'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { GitHubLogoIcon } from '@/components/icons/GitHubLogoIcon';
import { ExternalLink } from 'lucide-react';
import { ProjectLifecycleAccordion } from './ProjectLifecycleAccordian';
import { TUTORIAL_CONTEXT_COOKIE } from '@/lib/tutorialSteps';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGithub } = useAuth();
  
  // Use ref to track if we've already processed the callback
  const callbackProcessed = useRef(false);
  
  // Local state for the login action's loading and error states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionExpired = searchParams.get('sessionExpired') === 'true';

  // Simplified effect that doesn't depend on the callback function
  useEffect(() => {
    console.log('Auth provider use effect...');
    
    // Prevent processing the same callback multiple times
    if (callbackProcessed.current) {
      return;
    }

    // Clear any success messages from other pages
    useSuccessMessageStore.getState().clearMessage();

    const code = searchParams.get('code');
    const urlError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    console.log(`error description: ${errorDescription}`);
    
    if (code) {
      console.log('Code found, processing callback...');
      callbackProcessed.current = true; // Mark as processed
      
      // Clear URL parameters immediately to prevent re-processing
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      newUrl.searchParams.delete('state');
      window.history.replaceState({}, '', newUrl.toString());
      
      handleGithubCallback(code);
    } else if (urlError) {
      console.log(`Url error: ${urlError}`);
      const message = errorDescription
        ? decodeURIComponent(errorDescription).replace(/\+/g, ' ')
        : 'Access to your GitHub account was denied.';
      setError(`Authentication Failed: ${message}`);
    }
  }, [searchParams]); // Remove handleGithubCallback from dependencies

  const handleGithubCallback = async (code: string) => {
    console.log('Handling GitHub callback...');
    if (code) {
      console.log(`Code is valid in github callback.`);
    }
    
    setIsLoggingIn(true);
    setError(null); // Clear previous errors before trying
    
    try {
      await loginWithGithub(code);
      console.log(`Login with github success, should navigate to dashboard.`);
      
      // Clear success messages and navigate
      useSuccessMessageStore.getState().clearMessage();

      document.cookie = `${TUTORIAL_CONTEXT_COOKIE}=default; path=/; max-age=300`;
      // document.cookie = `${TUTORIAL_CONTEXT_COOKIE}=repo_analysis; path=/; max-age=300`;
      
      // Replace the current URL to remove the code parameter and navigate
      router.replace('/dashboard');
      
    } catch (err: any) {
      console.log(`Error while logging in: ${err}`);
      callbackProcessed.current = false; // Reset on error so user can try again
      setError(err.message || 'An unknown error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

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
    <div className="bg-background text-foreground">
      {/* Hero Section - Above the fold */}
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl text-center">
          
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-card-foreground">
              Automate Software Development with AI
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome to <span className="font-semibold text-primary">prompttosoftware.com</span>. Describe your project, and our autonomous AI system will build, test, and deliver it directly to your GitHub repository.
            </p>
          </header>

          {sessionExpired && (
            <div className="bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg mb-6 max-w-lg mx-auto">
              <strong className="font-bold">Session Expired.</strong>
              <span className="block sm:inline"> Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 max-w-lg mx-auto">
              <strong className="font-bold">Authentication Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          
          <div className="flex flex-col items-center justify-center space-y-6">
            {isLoggingIn ? (
              <div className="flex justify-center items-center h-16 w-full max-w-xs">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-4 text-lg">Authenticating with GitHub...</p>
              </div>
            ) : (
              <button
                onClick={handleGitHubLogin}
                className="w-full max-w-xs flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-200 ease-in-out hover:shadow-lg"
              >
                <GitHubLogoIcon className="w-8 h-8 mr-3" />
                Sign in with GitHub
              </button>
            )}
            <p className="text-sm text-muted-foreground">
              Integrates with GitHub, Jira, OpenRouter, and more.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline flex items-center"
              >
                Terms of Service
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline flex items-center"
              >
                Privacy Policy
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 animate-bounce">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </main>

      {/* Features Section - Below the fold */}
      <section id="how-it-works" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
              A Hands-Free Development Cycle
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From idea to a living project, powered by AI.
            </p>
          </div>
          
          <ProjectLifecycleAccordion />

        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">Ready to Free Up Your Time?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop supervising your AI. Start shipping finished features.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center space-y-6">
            <button
              onClick={handleGitHubLogin}
              disabled={isLoggingIn}
              className="w-full max-w-xs inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-200 ease-in-out hover:shadow-lg disabled:opacity-50"
            >
              <GitHubLogoIcon className="w-8 h-8 mr-3" />
              Get Started with GitHub
            </button>
            <div className="flex items-center space-x-4">
               <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline flex items-center"
              >
                Terms of Service
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:underline flex items-center"
              >
                Privacy Policy
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-center text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} PromptToSoftware, LLC. All rights reserved.</span>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <a href="/terms" className="hover:underline">Terms of Service</a>
                <a href="/privacy" className="hover:underline">Privacy Policy</a>
            </div>
        </div>
      </footer>
    </div>
  );
}
