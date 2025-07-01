import { useContext } from 'react';
import { AuthContext } from '../lib/AuthContext';

/**
 * Custom React hook to access authentication context.
 *
 * @returns An object containing authentication state and functions:
 *          - isAuthenticated: A boolean indicating if the user is authenticated.
 *          - user: The authenticated user object or null.
 *          - isLoading: A boolean indicating if authentication state is being loaded.
 *          - login: A function to initiate the login process.
 *          - logout: A function to initiate the logout process.
 * @throws {Error} If `useAuth` is used outside of an `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
