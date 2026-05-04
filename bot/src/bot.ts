import { Telegraf } from 'telegraf';
import { authMiddleware } from './middleware/auth';
import { loggerMiddleware } from './middleware/logger';
import { registerWizardHandlers, showMenu, handleWizardStep, cancelWizard } from './handlers/wizard';
import { registerConfirmHandlers } from './handlers/confirm';
import { registerStatusHandlers } from './handlers/status';
import { config } from './config';
import { errorMessage, escapeHtml } from './utils/html';

export function createBot(): Telegraf {
  const bot = new Telegraf(config.botToken);

  bot.use(authMiddleware);
  bot.use(loggerMiddleware);

  bot.start(showMenu);
  bot.command('add', showMenu);
  bot.command('cancel', cancelWizard);
  bot.command('skip', handleWizardStep);

  registerWizardHandlers(bot);
  registerConfirmHandlers(bot);
  registerStatusHandlers(bot);

  bot.on('text', async (ctx) => {
    try {
      const handled = await handleWizardStep(ctx);
      if (!handled) await showMenu(ctx);
    } catch (err) {
      console.error('[bot:text]', err);
      await ctx
        .reply(`❌ Ошибка: <code>${escapeHtml(errorMessage(err))}</code>`, { parse_mode: 'HTML' })
        .catch(() => {});
    }
  });

  bot.catch((err, ctx) => {
    console.error(`[bot:error] ${ctx.updateType}:`, err);
  });

  return bot;
}
