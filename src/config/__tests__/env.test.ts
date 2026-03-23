import * as dotenv from 'dotenv';

describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load environment variables from dotenv', () => {
    dotenv.config();
    expect(process.env.TELEGRAM_TOKEN).toBeDefined();
    expect(process.env.TELEGRAM_CHAT_ID).toBeDefined();
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
});
