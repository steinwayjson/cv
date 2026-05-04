import type { Context, MiddlewareFn } from 'telegraf';
import { config } from '../config';

export const authMiddleware: MiddlewareFn<Context> = (ctx, next) => {
  const actorId = ctx.from?.id ?? ctx.chat?.id;
  if (actorId !== config.ownerChatId) return;
  return next();
};
