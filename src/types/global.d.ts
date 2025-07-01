interface GlobalError {
  message: string;
  type?: 'error' | 'warning' | 'info';
  details?: unknown;
}
