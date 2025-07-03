// Placeholder for logger utility
const logger = {
  info: (...args: unknown[]) => console.log('INFO:', ...args),
  warn: (...args: unknown[]) => console.warn('WARN:', ...args),
  error: (...args: unknown[]) => console.error('ERROR:', ...args),
  debug: (...args: unknown[]) => console.debug('DEBUG:', ...args),
};

export { logger };
