export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

// Update this enum to match the backend for complete status tracking
export enum TransactionStatus {
  SUCCEEDED = 'succeeded',
  PENDING = 'pending',
  FAILED = 'failed',
  DISPUTED = 'disputed',
  LOST = 'lost',
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Always positive
  description: string;
  stripeEventId?: string; // Renamed from stripeChargeId
  relatedProjectId?: string; // For linking debits to projects
  createdAt: string; // Dates are strings over the network
  updatedAt: string;
}
