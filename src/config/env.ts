import "dotenv/config";

export const env = {
  telegramToken: process.env.TELEGRAM_TOKEN!,
  telegramChatId: process.env.TELEGRAM_CHAT_ID!,
};