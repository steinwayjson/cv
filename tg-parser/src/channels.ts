import { parse } from 'node-html-parser';
import { createClient } from '@supabase/supabase-js';
import { sendToN8n } from './webhook';

export interface TgChannel {
  id: string;
  username: string;
  title: string;
  last_post_id: number | null;
  is_active: boolean;
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
  process.env.SUPABASE_KEY!
);

const THIRTY_DAYS_S = 40 * 24 * 60 * 60;
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
  const isFirstRun = channel.last_post_id === null;
  const cutoff = isFirstRun ? Math.floor(Date.now() / 1000) - THIRTY_DAYS_S : null;
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

export async function parseAllChannels(): Promise<number> {
  let totalPosts = 0;
  const { data: channels, error } = await supabase
    .from('tg_channels')
    .select('*')
    .eq('is_active', true);

  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!channels?.length) { console.log('[parser] no active channels'); return 0; }

  console.log(`[parser] ${channels.length} channels`);

  for (const channel of channels as TgChannel[]) {
    try {
      const posts = await getNewPosts(channel);
      if (!posts.length) { console.log(`[parser] @${channel.username}: no new posts`); continue; }

      totalPosts += posts.length;
      console.log(`[parser] @${channel.username}: ${posts.length} posts (total: ${totalPosts})`);
      posts.sort((a, b) => a.message_id - b.message_id);

      for (const post of posts) await sendToN8n(post);

      const maxId = Math.max(...posts.map((p) => p.message_id));
      const { error: e } = await supabase
        .from('tg_channels')
        .update({ last_post_id: maxId })
        .eq('id', channel.id);
      if (e) console.error(`[parser] update @${channel.username}:`, e.message);
    } catch (err) {
      console.error(`[parser] @${channel.username}:`, err);
    }
  }
  return totalPosts;
}
