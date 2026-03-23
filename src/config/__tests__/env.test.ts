describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.TELEGRAM_TOKEN = 'token';
    process.env.TELEGRAM_CHAT_ID = 'chat';
    process.env.ALIEXPRESS_APP_KEY = 'app-key';
    process.env.ALIEXPRESS_APP_SECRET = 'app-secret';
    process.env.ALIEXPRESS_TRACKING_ID = 'tracking';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should export required env variables', () => {
    jest.isolateModules(() => {
      const { env } = require('../env');
      expect(env.telegramToken).toBe('token');
      expect(env.telegramChatId).toBe('chat');
      expect(env.aliexpressAppKey).toBe('app-key');
      expect(env.aliexpressAppSecret).toBe('app-secret');
      expect(env.aliexpressTrackingId).toBe('tracking');
    });
  });

  it('should throw error when TELEGRAM_TOKEN is missing', () => {
    delete process.env.TELEGRAM_TOKEN;
    expect(() => {
      jest.isolateModules(() => {
        require('../env');
      });
    }).toThrow('Missing environment variable: TELEGRAM_TOKEN');
  });

  it('should throw error when TELEGRAM_CHAT_ID is missing', () => {
    delete process.env.TELEGRAM_CHAT_ID;
    expect(() => {
      jest.isolateModules(() => {
        require('../env');
      });
    }).toThrow('Missing environment variable: TELEGRAM_CHAT_ID');
  });

  it('should throw error when ALIEXPRESS_APP_KEY is missing', () => {
    delete process.env.ALIEXPRESS_APP_KEY;
    expect(() => {
      jest.isolateModules(() => {
        require('../env');
      });
    }).toThrow('Missing environment variable: ALIEXPRESS_APP_KEY');
  });

  it('should throw error when ALIEXPRESS_APP_SECRET is missing', () => {
    delete process.env.ALIEXPRESS_APP_SECRET;
    expect(() => {
      jest.isolateModules(() => {
        require('../env');
      });
    }).toThrow('Missing environment variable: ALIEXPRESS_APP_SECRET');
  });

  it('should throw error when ALIEXPRESS_TRACKING_ID is missing', () => {
    delete process.env.ALIEXPRESS_TRACKING_ID;
    expect(() => {
      jest.isolateModules(() => {
        require('../env');
      });
    }).toThrow('Missing environment variable: ALIEXPRESS_TRACKING_ID');
  });
});
