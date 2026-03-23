import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { Deal } from '../domain/deal';

const bot = new Telegraf(env.telegramToken);

export async function sendMessage(message: string) {
  await bot.telegram.sendMessage(env.telegramChatId, message, {
    parse_mode: 'Markdown',
  });
}

function escapeMarkdown(value: string): string {
  return value.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function sendDealMessage(deal: Deal): Promise<void> {
  const lines = [
    `🔥 *${escapeMarkdown(deal.title)}*`,
    `💰 *Preço:* ${escapeMarkdown(deal.price)}`,
    deal.commissionRate
      ? `💸 *Comissão:* ${escapeMarkdown(deal.commissionRate)}`
      : undefined,
    deal.couponInfo ? `🎟️ *Cupom:* ${escapeMarkdown(deal.couponInfo)}` : undefined,
    `🔗 [Comprar com afiliado](${deal.affiliateUrl})`,
  ].filter(Boolean);

  await sendMessage(lines.join('\n'));
}
