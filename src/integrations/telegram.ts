import { Telegraf } from 'telegraf';
import { env } from '../config/env';

const bot = new Telegraf(env.telegramToken);

export async function sendMessage(message: string) {
  await bot.telegram.sendMessage(env.telegramChatId, message, {
    parse_mode: 'Markdown',
  });
}
