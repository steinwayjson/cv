import type { Context, MiddlewareFn } from 'telegraf';

export const loggerMiddleware: MiddlewareFn<Context> = (ctx, next) => {
  const type = ctx.updateType;
  const data =
    ctx.message && 'text' in ctx.message
      ? ctx.message.text.slice(0, 80)
      : ctx.callbackQuery && 'data' in ctx.callbackQuery
        ? `callback:${ctx.callbackQuery.data}`
        : '-';

  console.log(`[${new Date().toISOString()}] ${type} | ${data}`);
  return next();
};
