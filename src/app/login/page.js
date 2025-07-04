'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api'; // Import the axios instance

// This component contains the core logic and renders the login form.
// It will be wrapped in Suspense.
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const { login } = useAuth(); // Get the login function from the AuthContext
  const sessionExpired = searchParams.get('sessionExpired') === 'true';

  // Memoize exchangeCodeForToken to ensure a stable function reference
  const exchangeCodeForToken = useCallback(
    async (code) => {
      setLoading(true);
      setAuthError(null);
      try {
        const response = await api.post('/auth/github', { code }); // Use axios instance
        console.warn('Auth successful:', response.data);

        // Instead of directly manipulating localStorage here, use the login function from useAuth
        // This ensures the AuthContext is updated and handles storing the token/user data
        if (response.data.token && response.data.user) {
          login(response.data.token, response.data.user);
        } else {
          throw new Error('Authentication response missing token or user data.');
        }

        router.push('/dashboard'); // Always redirect to the dashboard
      } catch (err) {
        console.error('Error exchanging code:', err);
        if (err.response) {
          setAuthError(err.response.data.message || 'Authentication failed. Please try again.');
        } else if (err.request) {
          setAuthError('Network error. Please check your internet connection.');
        } else {
          setAuthError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setAuthError, router, login], // Add 'login' to dependencies
  ); // Dependencies for useCallback. 'api' is stable and removed.

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (code) {
      if (!loading) {
        // Prevent multiple calls if already loading
        console.warn('GitHub OAuth code received:', code);
        exchangeCodeForToken(code);
      }
    } else if (error) {
      let errorMessage = 'GitHub authentication failed.';
      if (error_description) {
        errorMessage += ` Reason: ${decodeURIComponent(error_description).replace(/\+/g, ' ')}`;
      } else if (error === 'access_denied') {
        errorMessage = 'You denied access to your GitHub account.';
      }
      console.error('GitHub OAuth error:', error, error_description);
      setAuthError(errorMessage);
    }
  }, [searchParams, loading, exchangeCodeForToken]); // Added exchangeCodeForToken to dependency array

  const handleGitHubLogin = () => {
    // Direct the user to the GitHub OAuth authorization page
    // client_id should be loaded from environment variables
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) {
      setAuthError('GitHub Client ID is not configured. Please contact support.');
      console.error('NEXT_PUBLIC_GITHUB_CLIENT_ID is not set.');
      return;
    }
    const REDIRECT_URI = `${window.location.origin}/login`; // Redirect back to the login page to handle the code
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome</h1>

        {sessionExpired && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Session Expired:</strong>
            <span className="block sm:inline"> Please log in again.</span>
          </div>
        )}

        {authError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Authentication Error:</strong>
            <span className="block sm:inline"> {authError}</span>
          </div>
        )}

        <p className="text-gray-700 mb-6">
          To provide you with the best experience and enable full functionality, we use GitHub for
          authentication. By signing in with GitHub, you grant us permission to:
        </p>
        <ul className="text-gray-600 text-left mb-6 list-disc list-inside">
          <li>
            <strong>Create repositories:</strong> We may create new repositories on your behalf to
            store generated code or project-related files.
          </li>
          <li>
            <strong>Push software:</strong> We will push code and project updates directly to these
            repositories.
          </li>
        </ul>
        <p className="text-gray-700 mb-8">
          This integration streamlines your workflow and ensures your projects are securely managed.
          We only request the necessary permissions to facilitate these core functionalities.
        </p>
        <button
          onClick={handleGitHubLogin}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out sm:px-8 sm:py-4 sm:text-lg"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.62 3.87 10.32 9.08 12C9.6 24.16 9.73 24.11 9.77 24.08c.03-.02.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-.28.48-,.01s-.07-.01-.11z"
              clipRule="evenodd"
            />
          </svg>
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
