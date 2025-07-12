/**
 * @interface GlobalError
 * @description Defines the structure for a global error object used throughout the application.
 *              This can be used to standardize error messages and provide additional context.
 */
interface GlobalError {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  details?: unknown;
}
