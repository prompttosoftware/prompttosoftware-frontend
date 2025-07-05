// src/types/auth.ts

/**
 * Represents the detailed profile information of an authenticated user.
 */
import { UserUsage } from './usage'; // Import UserUsage

/**
 * Represents the detailed profile information of an authenticated user.
 */
export interface UserProfile {
  id: string;
  email: string;
  isNewUser: boolean;
  balance: number; // User's current balance
  username?: string; // Optional username
  imageUrl?: string; // Optional URL to user's profile image
  role?: string; // Optional user role (e.g., 'admin', 'user')
  savedCards?: string[]; // Array of identifiers for saved payment cards
  usage?: UserUsage; // Optional usage statistics
  // Add other user properties as needed based on the /auth/me API response
}

/**
 * Represents the structure of the authentication response that includes a JWT token
 * and potentially user details upon successful login or registration.
 */
export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// You can add more auth-related types here if needed, e.g., for login/registration forms.
