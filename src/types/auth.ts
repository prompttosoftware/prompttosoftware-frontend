// src/types/auth.ts

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  cardHolderName?: string;
  isDefault?: boolean;
}

export interface ApiKey {
  provider: string;
  api_key: string;
}

export interface Transaction {
  amount: number;        // Positive (credit) or negative (debit)
  timestamp: string;     // ISO string from backend Date
}

/**
 * Represents the detailed profile information of an authenticated user.
 */
export interface UserProfile {
  id: string;
  email?: string;
  isNewUser: boolean;
  balance: number;
  username?: string;
  imageUrl?: string;
  role?: string;
  integrations: {
    jira: {
      isLinked?: boolean;
    }
  };
  apiKeys?: {
    provider: string;
    api_key: string;
  }[];
  savedCards?: {
    id: string;
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    cardHolderName?: string;
    isDefault?: boolean;
  }[];
  transactionHistory?: Transaction[];
  starredProjects?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the structure of the authentication response that includes a JWT token
 * and potentially user details upon successful login or registration.
 */
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

/**
 * Defines the shape of the credentials required for a user to log in.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Defines the shape of the payload required to register a new user.
 */
export interface RegisterPayload {
  email: string;
  password: string;
  username?: string;
}

// You can add more auth-related types here if needed, e.g., for login/registration forms.
