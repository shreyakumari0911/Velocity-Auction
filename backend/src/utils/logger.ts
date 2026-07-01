import pino from 'pino';
import { AsyncLocalStorage } from 'async_hooks';

// Storage to persist request-specific metadata (like requestId) across async boundaries
export const requestStore = new AsyncLocalStorage<{ requestId: string }>();

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
  level: isProduction ? 'info' : 'debug',
  mixin() {
    const store = requestStore.getStore();
    return store?.requestId ? { requestId: store.requestId } : {};
  },
  transport: (!isProduction && !isTest)
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname'
        }
      }
    : undefined
});
