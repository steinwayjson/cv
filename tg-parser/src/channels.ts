import { parse } from 'node-html-parser';
import { createClient } from '@supabase/supabase-js';

export interface TgChannel {
  id: string;
  username: string;
  title: string;
  last_post_id: number | null;
  is_active: boolean;
  depth_days: number;
}

export interface ParsedPost {
  channel_username: string;
  channel_title: string;
  message_id: number;
  text: string;
  date: number;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const DEFAULT_DEPTH_DAYS = 40;
const PAGE_DELAY_MS = 800;

async function fetchPage(username: string, before?: number): Promise<ParsedPost[]> {
  const url = before
    ? `https://t.me/s/${username}?before=${before}`
    : `https://t.me/s/${username}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; work-parser/1.0)' },
  });

  if (!res.ok) throw new Error(`t.me returned ${res.status} for @${username}`);

  const root = parse(await res.text());
  const posts: ParsedPost[] = [];

  for (const el of root.querySelectorAll('.tgme_widget_message')) {
    const dataPost = el.getAttribute('data-post') ?? '';
    const messageId = Number(dataPost.split('/')[1]);
    if (!messageId) continue;

    const text = el.querySelector('.tgme_widget_message_text')?.innerText?.trim() ?? '';
    if (!text) continue;

    const datetime = el.querySelector('time')?.getAttribute('datetime') ?? '';
    const date = datetime
      ? Math.floor(new Date(datetime).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    posts.push({ channel_username: username, channel_title: '', message_id: messageId, text, date });
  }

  return posts;
}

async function getNewPosts(channel: TgChannel): Promise<ParsedPost[]> {
  const depthDays = channel.depth_days ?? DEFAULT_DEPTH_DAYS;
  const isFirstRun = channel.last_post_id === null;
  const cutoff = isFirstRun ? Math.floor(Date.now() / 1000) - depthDays * 24 * 60 * 60 : null;
  const minId = channel.last_post_id ?? 0;

  const allPosts: ParsedPost[] = [];
  let before: number | undefined;

  outer: while (true) {
    const page = await fetchPage(channel.username, before);
    if (!page.length) break;

    for (const post of page) {
      if (cutoff && post.date < cutoff) break outer;
      if (!isFirstRun && post.message_id <= minId) break outer;
      allPosts.push({ ...post, channel_title: channel.title });
    }

    before = Math.min(...page.map((p) => p.message_id));
    await new Promise((r) => setTimeout(r, PAGE_DELAY_MS));
  }

  return allPosts;
}

async function savePostsToRawVacancies(channel: TgChannel, posts: ParsedPost[]): Promise<number> {
  if (!posts.length) return 0;

  const rows = posts.map(post => ({
    source: 'tg',
    tg_message_id: `${channel.username}/${post.message_id}`,
    channel_username: channel.username,
    raw_text: post.text,
    post_url: `https://t.me/${channel.username}/${post.message_id}`,
    posted_at: new Date(post.date * 1000).toISOString(),
    status: 'new',
  }));

  // ON CONFLICT DO NOTHING — дедупликация по tg_message_id
  const { error, data } = await supabase
    .from('raw_vacancies')
    .upsert(rows, { onConflict: 'tg_message_id', ignoreDuplicates: true })
    .select('id');

  if (error) throw new Error(`raw_vacancies insert error: ${error.message}`);
  return data?.length ?? rows.length;
}

export async function parseAllChannels(): Promise<number> {
  let totalPosts = 0;
  const { data: channels, error } = await supabase
    .from('tg_channels')
    .select('id, username, title, last_post_id, is_active, depth_days')
    .eq('is_active', true);

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!channels?.length) { console.log('[parser] no active channels'); return 0; }

  console.log(`[parser] ${channels.length} channels`);

  for (const channel of channels as TgChannel[]) {
    const startedAt = Date.now();
    try {
      const posts = await getNewPosts(channel);
      if (!posts.length) { console.log(`[parser] @${channel.username}: no new posts`); continue; }

      posts.sort((a, b) => a.message_id - b.message_id);
      const saved = await savePostsToRawVacancies(channel, posts);
      totalPosts += saved;
      console.log(`[parser] @${channel.username}: ${saved} posts saved (total: ${totalPosts})`);

      const maxId = Math.max(...posts.map((p) => p.message_id));
      const { error: e } = await supabase
        .from('tg_channels')
        .update({ last_post_id: maxId, last_run_at: new Date().toISOString() })
        .eq('id', channel.id);
      if (e) console.error(`[parser] update @${channel.username}:`, e.message);

      // Логируем прогон по каналу
      await supabase.from('parser_runs').insert({
        channel_id: channel.id,
        trigger: 'scheduled',
        status: 'ok',
        elapsed_ms: Date.now() - startedAt,
        posts_found: saved,
        error_message: null,
      });
    } catch (err) {
      console.error(`[parser] @${channel.username}:`, err);
      await supabase.from('parser_runs').insert({
        channel_id: channel.id,
        trigger: 'scheduled',
        status: 'error',
        elapsed_ms: Date.now() - startedAt,
        posts_found: 0,
        error_message: String(err),
      });
    }
  }
  return totalPosts;
}
