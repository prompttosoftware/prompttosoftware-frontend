export interface Banner {
  id: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success'; // Optional: for styling
  dismissible?: boolean; // Optional: if the banner can be dismissed by the user
  autoDismiss?: number; // Optional: time in ms before auto-dismissing
}
