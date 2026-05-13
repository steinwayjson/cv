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
const PAGE_DELAY_MS = 1500;

async function fetchPage(username: string, before?: number): Promise<ParsedPost[]> {
  const url = before
    ? `https://t.me/s/${username}?before=${before}`
    : `https://t.me/s/${username}`;

  console.log(`[fetchPage] GET ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
    },
  });

  if (!res.ok) throw new Error(`t.me returned ${res.status} for @${username}`);

  const html = await res.text();
  console.log(`[fetchPage] received ${html.length} chars for @${username}`);

  // Логируем первые 500 символов чтобы понять что пришло
  console.log(`[fetchPage] HTML snippet: ${html.slice(0, 500)}`);

  const root = parse(html);
  const posts: ParsedPost[] = [];

  for (const el of root.querySelectorAll('.tgme_widget_message')) {
    const dataPost = el.getAttribute('data-post') ?? '';
    const messageId = Number(dataPost.split('/')[1]);
    if (!messageId) continue;

    const textEl = el.querySelector('.tgme_widget_message_text');
    const text = textEl?.innerText?.trim() ?? '';
    if (!text) continue;

    const datetime = el.querySelector('time')?.getAttribute('datetime') ?? '';
    const date = datetime
      ? Math.floor(new Date(datetime).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    posts.push({ channel_username: username, channel_title: '', message_id: messageId, text, date });
  }

  console.log(`[fetchPage] @${username}: found ${posts.length} posts on this page`);
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

    // DEBUG: логируем ID которые нашли на странице и last_post_id из БД
    console.log(`[debug] found ids: ${page.map(p => p.message_id).join(', ')}`);
    console.log(`[debug] last_post_id in DB: ${channel.last_post_id} (type: ${typeof channel.last_post_id})`);

    for (const post of page.toReversed()) {
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

export async function parseAllChannels(): Promise<{ posts_found: number; diagnostics: string[] }> {
  let totalPosts = 0;
  const diagnostics: string[] = [];
  const { data: channels, error } = await supabase
    .from('tg_channels')
    .select('id, username, title, last_post_id, is_active, depth_days')
    .eq('is_active', true);

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!channels?.length) { diagnostics.push('no active channels in DB'); console.log('[parser] no active channels'); return { posts_found: 0, diagnostics }; }

  diagnostics.push(`${channels.length} channels found`);
  console.log(`[parser] ${channels.length} channels`);

  for (const channel of channels as TgChannel[]) {
    const startedAt = Date.now();
    try {
      const posts = await getNewPosts(channel);
      if (!posts.length) { diagnostics.push(`@${channel.username}: no new posts`); console.log(`[parser] @${channel.username}: no new posts`); continue; }

      posts.sort((a, b) => a.message_id - b.message_id);
      const saved = await savePostsToRawVacancies(channel, posts);
      totalPosts += saved;
      diagnostics.push(`@${channel.username}: ${saved} posts saved`);
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
      diagnostics.push(`@${channel.username}: ERROR ${String(err)}`);
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
  return { posts_found: totalPosts, diagnostics };
}


