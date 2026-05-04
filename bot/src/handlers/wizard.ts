import { Markup } from 'telegraf';
import type { Telegraf, Context } from 'telegraf';
import { checkDuplicateVacancy, getSession, saveSession, deleteSession } from '../services/supabase';
import type { WizardSession } from '../services/supabase';
import { sendVacancyToN8n } from '../services/n8n';
import { errorMessage, escapeHtml } from '../utils/html';

type WizardStep = WizardSession['step'];

// lastBotMsgId хранится только в памяти — не критично при cold start
const lastBotMsgIds = new Map<number, number>();

// Главное меню с выбором пути
export async function showMenu(ctx: Context): Promise<void> {
  await ctx.reply(
    'Выбери тип добавления:',
    Markup.inlineKeyboard([
      [
        Markup.button.callback('📋 Вакансия с агрегатора', 'flow:hh'),
        Markup.button.callback('🎯 Аутрич-компания', 'flow:outreach'),
      ],
    ])
  );
}

async function deleteBotMsg(ctx: Context, msgId?: number): Promise<void> {
  if (!msgId || !ctx.chat) return;
  try { await ctx.telegram.deleteMessage(ctx.chat.id, msgId); } catch { /* уже удалено */ }
}

async function deleteUserMsg(ctx: Context): Promise<void> {
  if (!ctx.message?.message_id || !ctx.chat) return;
  try { await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id); } catch { /* нет прав */ }
}

const PROMPTS: Record<WizardStep, string> = {
  url: '📋 <b>Шаг 1/4 · Ссылка на вакансию</b>\n\nПришли ссылку с hh.ru',
  text: '📄 <b>Шаг 2/4 · Текст вакансии</b>\n\nСкопируй и пришли текст вакансии с hh.ru',
  site: '🌐 <b>Шаг 3/4 · Сайт компании</b> (необязательно)\n\nПришли ссылку на сайт компании или /skip',
  company_text: '🏢 <b>Шаг 4/4 · Описание компании с hh.ru</b> (необязательно)\n\nСкопируй описание или /skip',
};

// Регистрирует callback-обработчики кнопок меню
export function registerWizardHandlers(bot: Telegraf): void {
  // Путь 1: Вакансия с агрегатора
  bot.action('flow:hh', async (ctx) => {
    await ctx.answerCbQuery('Ок, начинаем...');
    const chatId = ctx.chat?.id ?? ctx.from?.id;
    if (!chatId) {
      await ctx.reply('❌ Не смог определить chat id.');
      return;
    }

    try {
      try { await ctx.deleteMessage(); } catch { /* нет прав */ }

      await saveSession(chatId, { step: 'url' });
      const msg = await ctx.reply(PROMPTS.url, { parse_mode: 'HTML' });
      lastBotMsgIds.set(chatId, msg.message_id);
    } catch (err) {
      console.error('[wizard:flow:hh]', err);
      await ctx.reply(`❌ Ошибка запуска сценария:\n<code>${escapeHtml(errorMessage(err))}</code>`, { parse_mode: 'HTML' });
    }
  });

  // Путь 2: Аутрич — заглушка
  bot.action('flow:outreach', async (ctx) => {
    await ctx.answerCbQuery('Пока в разработке');
    try {
      try { await ctx.deleteMessage(); } catch { /* нет прав */ }
      await ctx.reply('🔧 Аутрич-кампании — в разработке.');
    } catch (err) {
      console.error('[wizard:flow:outreach]', err);
    }
  });
}

// Отменяет текущий опрос
export async function cancelWizard(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const session = await getSession(chatId);
  if (session) {
    await deleteBotMsg(ctx, lastBotMsgIds.get(chatId));
    lastBotMsgIds.delete(chatId);
    await deleteSession(chatId);
    await ctx.reply('Отменено ✖️');
  } else {
    await ctx.reply('Нет активного опроса.');
  }
}

// Обрабатывает текущий шаг wizard'а. Возвращает true если сообщение обработано, false — сессии нет
export async function handleWizardStep(ctx: Context): Promise<boolean> {
  if (!ctx.message || !('text' in ctx.message)) return false;
  const chatId = ctx.chat?.id;
  if (!chatId) return false;

  const session = await getSession(chatId);
  if (!session) return false;

  // Дедупликация: Telegram ретраит вебхук при медленном ответе (cold start)
  // Если update_id совпадает с последним обработанным — игнорируем
  const updateId = ctx.update.update_id;
  if (session.last_update_id === updateId) {
    console.log(`[wizard] duplicate update_id=${updateId} for chat=${chatId}, skipping`);
    return true;
  }

  const input = ctx.message.text.trim();
  const isSkip = input === '/skip';

  // Чистим: предыдущий вопрос бота + ответ пользователя
  await Promise.all([
    deleteBotMsg(ctx, lastBotMsgIds.get(chatId)),
    deleteUserMsg(ctx),
  ]);
  lastBotMsgIds.delete(chatId);

  async function nextStep(text: string): Promise<void> {
    const msg = await ctx.reply(text, { parse_mode: 'HTML' });
    lastBotMsgIds.set(chatId!, msg.message_id);
  }

  async function replyError(text: string): Promise<void> {
    const msg = await ctx.reply(text);
    lastBotMsgIds.set(chatId!, msg.message_id);
  }

  switch (session.step) {
    case 'url': {
      if (!/^https?:\/\//i.test(input)) {
        await replyError('❌ Не похоже на URL. Пришли ссылку на вакансию (https://...)');
        return true;
      }
      const isDuplicate = await checkDuplicateVacancy(input);
      if (isDuplicate) {
        await replyError('⚠️ Эта вакансия уже есть в базе. Пришли другую ссылку или /cancel.');
        return true;
      }
      await saveSession(chatId, { ...session, step: 'text', vacancy_url: input, last_update_id: updateId });
      await nextStep(PROMPTS.text);
      break;
    }

    case 'text': {
      if (input.length < 20) {
        await replyError('❌ Слишком коротко. Скопируй полный текст вакансии.');
        return true;
      }
      await saveSession(chatId, { ...session, step: 'site', vacancy_text: input, last_update_id: updateId });
      await nextStep(PROMPTS.site);
      break;
    }

    case 'site': {
      if (!isSkip) {
        if (!/^https?:\/\//i.test(input)) {
          await replyError('❌ Не похоже на URL. Пришли ссылку или /skip');
          return true;
        }
        await saveSession(chatId, { ...session, step: 'company_text', company_site: input, last_update_id: updateId });
      } else {
        await saveSession(chatId, { ...session, step: 'company_text', last_update_id: updateId });
      }
      await nextStep(PROMPTS.company_text);
      break;
    }

    case 'company_text': {
      const company_text = isSkip ? undefined : input;
      await saveSession(chatId, { ...session, company_text, last_update_id: updateId });
      lastBotMsgIds.delete(chatId);

      try {
        await sendVacancyToN8n({
          vacancy_url: session.vacancy_url!,
          vacancy_text: session.vacancy_text!,
          company_site: session.company_site,
          company_text,
        });
        await deleteSession(chatId);
        await ctx.reply('✅ Передано в n8n. Письмо придёт на подтверждение.');
      } catch (err) {
        console.error('[wizard:save]', err);
        await ctx.reply(`❌ Ошибка отправки в n8n:\n<code>${escapeHtml(errorMessage(err))}</code>`, { parse_mode: 'HTML' });
      }
      break;
    }
  }
  return true;
}
