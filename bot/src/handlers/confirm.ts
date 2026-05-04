import type { Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
import type { GeneratedLetter, FollowUpNotification } from '../types';
import { sendConfirmation, sendFollowUpAction } from '../services/n8n';
import { escapeHtml } from '../utils/html';

export async function sendLetterForConfirmation(
  bot: Telegraf,
  chatId: number,
  letter: GeneratedLetter,
): Promise<void> {
  const channelLabel = { hh: 'HH.ru', telegram: 'Telegram', email: 'Email' }[letter.channel] ?? letter.channel;

  const text = [
    `📬 <b>Письмо для ${escapeHtml(letter.company_name)}</b>`,
    letter.contact_name ? `👤 Контакт: ${escapeHtml(letter.contact_name)}` : '',
    `📡 Канал: ${escapeHtml(channelLabel)}`,
    '',
    '<pre>',
    escapeHtml(letter.letter_text),
    '</pre>',
  ]
    .filter(Boolean)
    .join('\n');

  await bot.telegram.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      Markup.button.callback('✅ Отправить', `send:${letter.vacancy_id}`),
      Markup.button.callback('✏️ Редактировать', `edit:${letter.vacancy_id}`),
    ]),
  });
}

export async function sendFollowUpPrompt(
  bot: Telegraf,
  chatId: number,
  notification: FollowUpNotification,
): Promise<void> {
  const sentAt = new Date(notification.sent_at).getTime();
  const daysSince = Number.isFinite(sentAt)
    ? Math.max(0, Math.floor((Date.now() - sentAt) / (1000 * 60 * 60 * 24)))
    : 0;

  await bot.telegram.sendMessage(
    chatId,
    `⏰ Нет ответа от <b>${escapeHtml(notification.company_name)}</b> уже ${daysSince} дн. Отправить follow-up?`,
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        Markup.button.callback('Да', `followup_send:${notification.vacancy_id}`),
        Markup.button.callback('Пропустить', `followup_skip:${notification.vacancy_id}`),
      ]),
    },
  );
}

export function registerConfirmHandlers(bot: Telegraf): void {
  bot.action(/^send:(.+)$/, async (ctx) => {
    const vacancyId = ctx.match[1];
    await ctx.answerCbQuery('Отправляю...');
    try {
      await sendConfirmation({ vacancy_id: vacancyId, action: 'send' });
      await ctx.editMessageText('✅ Отправлено. n8n обновит статус.');
    } catch (err) {
      console.error('[confirm:send]', err);
      await ctx.editMessageText('❌ Ошибка отправки. Попробуй ещё раз.');
    }
  });

  bot.action(/^edit:(.+)$/, async (ctx) => {
    const vacancyId = ctx.match[1];
    await ctx.answerCbQuery('Передаю на редактирование...');
    try {
      await sendConfirmation({ vacancy_id: vacancyId, action: 'edit' });
      await ctx.editMessageText('✏️ Передано в n8n на редактирование.');
    } catch (err) {
      console.error('[confirm:edit]', err);
      await ctx.editMessageText('❌ Ошибка. Попробуй ещё раз.');
    }
  });

  bot.action(/^followup_send:(.+)$/, async (ctx) => {
    const vacancyId = ctx.match[1];
    await ctx.answerCbQuery('Отправляю follow-up...');
    try {
      await sendFollowUpAction({ vacancy_id: vacancyId, action: 'send_followup' });
      await ctx.editMessageText('📤 Follow-up отправлен.');
    } catch (err) {
      console.error('[followup:send]', err);
      await ctx.editMessageText('❌ Ошибка. Попробуй ещё раз.');
    }
  });

  bot.action(/^followup_skip:(.+)$/, async (ctx) => {
    const vacancyId = ctx.match[1];
    await ctx.answerCbQuery('Пропускаю...');
    try {
      await sendFollowUpAction({ vacancy_id: vacancyId, action: 'skip' });
      await ctx.editMessageText('⏭️ Пропущено.');
    } catch (err) {
      console.error('[followup:skip]', err);
      await ctx.editMessageText('❌ Ошибка. Попробуй ещё раз.');
    }
  });
}
