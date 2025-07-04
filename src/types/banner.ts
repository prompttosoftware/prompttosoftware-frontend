export interface Banner {
    id: string; // Unique identifier for dismissal
    message: string;
    type?: 'info' | 'success' | 'warning'; // For different styling
    dismissible: boolean;
}
