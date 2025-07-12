'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSuccessMessageStore } from '@/store/successMessageStore';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. We only need the `loginWithGithub` function from the auth context.
  const { loginWithGithub } = useAuth();
  
  // 2. Use local state for the login action's loading and error states.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionExpired = searchParams.get('sessionExpired') === 'true';

  // 3. This function now manages its own loading and error state.
  const handleGithubCallback = useCallback(async (code: string) => {
    setIsLoggingIn(true);
    setError(null); // Clear previous errors before trying
    try {
      await loginWithGithub(code);
      // On success, redirect to dashboard. Clear any lingering success messages first.
      useSuccessMessageStore.getState().clearMessage();
      router.replace('/dashboard');
    } catch (err: any) {
      // If login fails, set the local error state to display to the user.
      setError(err.message || 'An unknown error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  }, [loginWithGithub, router]);

  // 4. The main effect is now simpler and focuses on URL params.
  useEffect(() => {
    // Clear any success messages from other pages (e.g., after registration)
    useSuccessMessageStore.getState().clearMessage();

    const code = searchParams.get('code');
    const urlError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (code) {
      handleGithubCallback(code);
    } else if (urlError) {
      const message = errorDescription
        ? decodeURIComponent(errorDescription).replace(/\+/g, ' ')
        : 'Access to your GitHub account was denied.';
      setError(`Authentication Failed: ${message}`);
    }
  }, [searchParams, handleGithubCallback]);

  const handleGitHubLogin = () => {
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub Client ID is not configured. Please contact support.');
      return;
    }
    const REDIRECT_URI = `${window.location.origin}/login`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-2xl w-full max-w-lg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome</h1>

        {sessionExpired && (
          <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg mb-6">
            <strong className="font-bold">Session Expired.</strong>
            <span className="block sm:inline"> Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            <strong className="font-bold">Authentication Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <p className="text-gray-400 mb-6">
          Sign in with your GitHub account to continue. We request repository access to create and manage your software projects.
        </p>

        {isLoggingIn ? (
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="ml-4 text-lg">Authenticating...</p>
          </div>
        ) : (
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.796 24 17.3 24 12c0-6.63-5.37-12-12-12z" clipRule="evenodd" />
            </svg>
            Sign in with GitHub
          </button>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
