import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  telegramToken: required('TELEGRAM_TOKEN'),
  telegramChatId: required('TELEGRAM_CHAT_ID'),
};
