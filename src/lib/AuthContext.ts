import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Default context value
const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  isLoading: true, // Should be true initially to indicate loading state
  login: () => {}, // No-op default
  logout: () => {}, // No-op default
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    if ((userData as any).isNewUser) { // Assuming `isNewUser` might be on the User object
      localStorage.setItem('show_tutorial', 'true');
    } else {
      localStorage.removeItem('show_tutorial');
    }

    setIsAuthenticated(true);
    setUser(userData);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    localStorage.removeItem('show_tutorial');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadAuthData = () => {
      const token = localStorage.getItem('jwt_token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const parsedUser: User = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing user data from localStorage", e);
          // Clear invalid data
          logout();
        }
      }
      setIsLoading(false);
    };

    loadAuthData();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
