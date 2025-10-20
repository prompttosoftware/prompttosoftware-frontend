'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { GitHubLogoIcon } from '@/components/icons/GitHubLogoIcon';
import { CheckCircle2, ExternalLink, Linkedin, Youtube } from 'lucide-react';
import { ProjectLifecycleAccordion } from './ProjectLifecycleAccordian';
import { TUTORIAL_CONTEXT_COOKIE } from '@/lib/tutorialSteps';
import { usePostHog } from 'posthog-js/react';

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGithub } = useAuth();
  const posthog = usePostHog();
  
  // Use ref to track if we've already processed the callback
  const callbackProcessed = useRef(false);
  
  // Local state for the login action's loading and error states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionExpired = searchParams.get('sessionExpired') === 'true';

  useEffect(() => {
      // This runs only once when the component mounts
      const utm_source = searchParams.get('utm_source');
      const utm_medium = searchParams.get('utm_medium');
      const utm_campaign = searchParams.get('utm_campaign');
  
      const analytics_props = {
        utm_source,
        utm_medium,
        utm_campaign,
      };
  
      // Track the page view event with UTMs
      posthog?.capture('default_landing_page_viewed', analytics_props);
  
      // Persist UTMs in session storage to survive the GitHub redirect
      if (utm_source) {
        sessionStorage.setItem('utm_params', JSON.stringify(analytics_props));
      }
    }, [searchParams, posthog]);

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
      // Retrieve UTMs from session storage
      const storedUtmParams = sessionStorage.getItem('utm_params');
      const campaign_metadata = storedUtmParams ? JSON.parse(storedUtmParams) : {};

      await loginWithGithub(code); // TODO: apply promo to free project
      console.log(`Login with github success, should navigate to dashboard.`);
      
      // Clear success messages and navigate
      useSuccessMessageStore.getState().clearMessage();

      document.cookie = `${TUTORIAL_CONTEXT_COOKIE}=default; path=/; max-age=300`;

      posthog?.capture('user_signed_up', {
        ...campaign_metadata,
        login_method: 'github',
        promo_applied: !!campaign_metadata.utm_source,
      });
      // Optionally clean up session storage
      sessionStorage.removeItem('utm_params');
      
      // Replace the current URL to remove the code parameter and navigate
      router.replace('/dashboard');
      
    } catch (err: any) {
      console.log(`Error while logging in: ${err}`);
      callbackProcessed.current = false; // Reset on error so user can try again
      setError(err.message || 'An unknown error occurred during login.');
      posthog?.capture('signup_failed', { error_message: err.message });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGitHubLogin = () => {
    posthog?.capture('login_initiated', { login_method: 'github' });

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
              Automate Your Next Project with AI
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Describe your software in plain English. Our AI agent handles the code, tests, and bug fixes, delivering a complete project to your GitHub repo.
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

      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
            Transparent Pricing for Autonomous Development
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Build and scale projects affordably. Pay only for active runtime and the AI models you choose—no subscriptions, no hidden fees.
          </p>

          <div className="mt-8 rounded-lg bg-card p-6 border text-left">
            <ul className="space-y-4 text-card-foreground">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block">Platform Runtime Fee</strong>
                  A flat rate of $0.50 per hour for each active project. Billed only while your project is running.
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                <div>
                  <strong className="block">AI API Usage</strong>
                  Pay the direct cost for any AI APIs used, depending on the models you select. Bring your own API key to waive these fees.
                </div>
              </li>
            </ul>

            <div className="mt-6 text-center text-sm text-card-foreground bg-primary/10 p-4 rounded-md border border-primary/20">
              <p>
                A typical autonomous project runs for <strong className="text-primary">less than $1.00 per hour</strong>—including both compute and AI costs.
              </p>
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-center">
              You have full control over spending: set runtime or budget limits, or pause projects anytime.
            </p>
          </div>
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
            <p className="text-xs text-muted-foreground pt-2">
              We request repo access to manage your projects. <br/> We will never store your code.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
