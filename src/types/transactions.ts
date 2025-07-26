import { UserProfile } from "@/types/auth";

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  SUCCEEDED = 'succeeded',
  PENDING = 'pending',
  FAILED = 'failed',
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  stripeChargeId?: string;
  relatedProjectId?: string;
  createdAt: string; // Dates will be strings over the network
}

// Update your UserProfile type to include this
export interface TransactionUserProfile extends UserProfile {
    transactionHistory?: Transaction[];
}
