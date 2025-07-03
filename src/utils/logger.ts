// src/lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, errorInstance?: unknown, details?: unknown, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

const createLogger = (name: string): Logger => {
  const log = (level: LogLevel, message: string, ...args: unknown[]) => {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] [${name}] ${message}`;

    let processedArgs = [...args]; // Create a copy to manipulate

    // Special handling for the error method's specific arguments
    if (level === 'error') {
      const actualErrorInstance = args[0]; // This is the 'errorInstance' argument
      const actualDetails = args[1];     // This is the 'details' argument
      const otherUserArgs = args.slice(2); // These are the `...args` from the logger.error call
    
      if (actualErrorInstance instanceof Error) {
        logMessage += `\nError: ${actualErrorInstance.message}`;
        if (actualErrorInstance.stack) {
          logMessage += `\nStack: ${actualErrorInstance.stack}`;
        }
      } else if (actualErrorInstance !== undefined) {
        logMessage += `\nError (Non-Error object): ${
          typeof actualErrorInstance === 'object' && actualErrorInstance !== null
            ? JSON.stringify(actualErrorInstance)
            : String(actualErrorInstance)
        }`;
      }
    
      if (actualDetails !== undefined) {
        logMessage += `\nDetails: ${
          typeof actualDetails === 'object' && actualDetails !== null
            ? JSON.stringify(actualDetails)
            : String(actualDetails)
        }`;
      }
    
      if (otherUserArgs.length > 0) {
        logMessage += `\nAdditional Arguments: ${JSON.stringify(otherUserArgs)}`;
      }
      processedArgs = []; // Clear processedArgs as everything relevant is now in logMessage
    } else {
      // General handling for other levels (info, warn, debug)
      processedArgs = [...args]; // Take all arguments from the log call initially
    
      // Check if the last argument is an Error object for general levels and format it
      if (processedArgs.length > 0) {
        const lastArg = processedArgs[processedArgs.length - 1];
        if (lastArg instanceof Error) {
          const error = processedArgs.pop() as Error; // Pop and assert as Error for message/stack access
          logMessage += `\nError: ${error.message}`;
          if (error.stack) {
            logMessage += `\nStack: ${error.stack}`;
          }
        }
      }
    }

    console[level](logMessage, ...processedArgs);
  };

  return {
    info: (message: string, ...args: unknown[]) => log('info', message, ...args),
    warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
    error: (message: string, errorInstance?: unknown, details?: unknown, ...args: unknown[]) =>
      log('error', message, errorInstance, details, ...args),
    debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  };
};

export const logger = createLogger('API');
