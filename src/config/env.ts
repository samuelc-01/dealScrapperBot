import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value : fallback;
}

function optionalNumber(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return parsed;
}

export const env = {
  telegramToken: required('TELEGRAM_TOKEN'),
  telegramChatId: required('TELEGRAM_CHAT_ID'),
  aliexpressAppKey: required('ALIEXPRESS_APP_KEY'),
  aliexpressAppSecret: required('ALIEXPRESS_APP_SECRET'),
  aliexpressTrackingId: required('ALIEXPRESS_TRACKING_ID'),
  aliexpressApiBaseUrl: optional(
    'ALIEXPRESS_API_BASE_URL',
    'https://api-sg.aliexpress.com',
  ),
  aliexpressDealsPath: optional(
    'ALIEXPRESS_DEALS_PATH',
    '/affiliate/deals/hot',
  ),
  aliexpressDeeplinkPath: optional(
    'ALIEXPRESS_DEEPLINK_PATH',
    '/affiliate/deeplink/create',
  ),
  queryKeyword: optional('ALIEXPRESS_QUERY_KEYWORD', 'smartphone'),
  maxPriceBrl: optionalNumber('MAX_PRICE_BRL', 500),
  pollIntervalMinutes: optionalNumber('POLL_INTERVAL_MINUTES', 15),
  maxItemsPerCycle: optionalNumber('MAX_ITEMS_PER_CYCLE', 10),
  requestTimeoutMs: optionalNumber('REQUEST_TIMEOUT_MS', 12000),
};
