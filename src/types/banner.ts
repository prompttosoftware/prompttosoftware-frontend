// src/types/banner.d.ts
export interface Banner {
  id: string; // Unique identifier for dismissal
  message: string;
  type: 'info' | 'success' | 'warning';
  dismissible: boolean;
  autoDismissDelay?: number; // Optional delay for non-dismissible banners
}
