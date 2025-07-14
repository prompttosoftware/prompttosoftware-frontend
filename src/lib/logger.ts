// utils/logger.ts
const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  info: (...args: unknown[]) => {
    if (!isProduction && typeof window === 'undefined') {
      console.log('INFO:', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isProduction || typeof window === 'undefined') {
      console.warn('WARN:', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (!isProduction || typeof window === 'undefined') {
      console.error('ERROR:', ...args);
    }
  },
  debug: (...args: unknown[]) => {
    if (!isProduction && typeof window === 'undefined') {
      console.debug('DEBUG:', ...args);
    }
  },
};

export { logger };
