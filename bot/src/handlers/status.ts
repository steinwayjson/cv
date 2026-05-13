import type { Telegraf } from 'telegraf';
import { updateVacancyStatus } from '../services/supabase';
import { errorMessage, escapeHtml } from '../utils/html';

type StatusKey = 'replied' | 'interview' | 'offer';

const STATUSES: { command: StatusKey; label: string }[] = [
  { command: 'replied', label: 'Ответ получен ✉️' },
  { command: 'interview', label: 'Собеседование назначено 🗓' },
  { command: 'offer', label: 'Оффер! 🎉' },
];

export function registerStatusHandlers(bot: Telegraf): void {
  for (const { command, label } of STATUSES) {
    bot.command(command, async (ctx) => {
      const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      const vacancyId = text.trim().split(/\s+/)[1];

      if (!vacancyId) {
        await ctx.reply(`Использование: /${command} &lt;vacancy_id&gt;`, { parse_mode: 'HTML' });
        return;
      }

      try {
        await updateVacancyStatus(vacancyId, command);
        await ctx.reply(`${label}\nВакансия: <code>${escapeHtml(vacancyId)}</code>`, { parse_mode: 'HTML' });
      } catch (err) {
        console.error(`[status:${command}]`, err);
        await ctx.reply(`❌ Ошибка: <code>${escapeHtml(errorMessage(err))}</code>`, { parse_mode: 'HTML' });
      }
    });
  }
}
