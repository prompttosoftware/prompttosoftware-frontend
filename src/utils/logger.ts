// src/lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, errorInstance?: Error, details?: any, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

const createLogger = (name: string): Logger => {
  const log = (level: LogLevel, message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] [${name}] ${message}`;
  
    let processedArgs = [...args]; // Create a copy to manipulate
  
    // Special handling for the error method's specific arguments
    if (level === 'error') {
      const [errorInstance, details, ...otherArgs] = args;
      processedArgs = otherArgs; // The remaining arguments
  
      if (errorInstance instanceof Error) {
        logMessage += `\nError: ${errorInstance.message}`;
        if (errorInstance.stack) {
          logMessage += `\nStack: ${errorInstance.stack}`;
        }
      } else if (errorInstance !== undefined) {
         // If the first argument is not an Error but something was passed, and it's not 'details'
         // This can happen if 'errorInstance' was meant to be details and 'error' was omitted
         // We can choose to log it as part of the details depending on expectation
         // For now, let's treat the first non-error arg as 'details' if it's there
         if (details === undefined && errorInstance !== undefined) {
             logMessage += `\nDetails: ${JSON.stringify(errorInstance)}`;
         } else {
             // If errorInstance is not an error and details exists, then errorInstance was likely meant to be logged
            processedArgs.unshift(errorInstance); // Put it back into processedArgs
         }
      }
  
      if (details !== undefined) {
        logMessage += `\nDetails: ${JSON.stringify(details)}`;
      }
    } else {
        // General handling for other levels
        if (processedArgs.length > 0) {
            // If the last argument is an Error object, format it specially
            const lastArg = processedArgs[processedArgs.length - 1];
            if (lastArg instanceof Error) {
                const error = processedArgs.pop(); // Remove the error from processedArgs
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
    info: (message: string, ...args: any[]) => log('info', message, ...args),
    warn: (message: string, ...args: any[]) => log('warn', message, ...args),
    error: (message: string, errorInstance?: Error, details?: any, ...args: any[]) =>
      log('error', message, errorInstance, details, ...args),
    debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  };
};

export const logger = createLogger('API');
