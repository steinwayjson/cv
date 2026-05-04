import type { ParsedPost } from './channels';

const N8N_URL = process.env.N8N_WEBHOOK_URL;
if (!N8N_URL) throw new Error('N8N_WEBHOOK_URL not set');

export async function sendToN8n(post: ParsedPost): Promise<void> {
  const res = await fetch(N8N_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });

  if (!res.ok) {
    throw new Error(`n8n webhook failed: ${res.status} ${await res.text()}`);
  }

  console.log(`[webhook] sent msg_id=${post.message_id} from @${post.channel_username}`);
}
