import * as dotenv from 'dotenv';
dotenv.config();

import { Telegraf } from 'telegraf';
import { requiredEnv } from './config';

async function main() {
  const webhookUrl = requiredEnv('WEBHOOK_DOMAIN');
  const bot = new Telegraf(requiredEnv('BOT_TOKEN'));

  await bot.telegram.setWebhook(webhookUrl, {
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });

  console.log('✅ Webhook установлен:', webhookUrl);

  const info = await bot.telegram.getWebhookInfo();
  console.log('Info:', JSON.stringify(info, null, 2));
}

main().catch((err) => {
  console.error('❌', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
