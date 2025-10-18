'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { GitHubLogoIcon } from '@/components/icons/GitHubLogoIcon';
import { 
  CheckCircle2,
  ExternalLink,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { TUTORIAL_CONTEXT_COOKIE } from '@/lib/tutorialSteps';
import AnalysisAccordion from './AnalysisAccordion';
import { usePostHog } from 'posthog-js/react';

export function GitHubAnalysisLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGithub } = useAuth();
  const callbackProcessed = useRef(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posthog = usePostHog();

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
    posthog?.capture('analysis_landing_page_viewed', analytics_props);

    // Persist UTMs in session storage to survive the GitHub redirect
    if (utm_source) {
      sessionStorage.setItem('utm_params', JSON.stringify(analytics_props));
    }
  }, [searchParams, posthog]);

  useEffect(() => {
    if (callbackProcessed.current) return;

    useSuccessMessageStore.getState().clearMessage();

    const code = searchParams.get('code');
    const urlError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (code) {
      callbackProcessed.current = true;
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      newUrl.searchParams.delete('state');
      window.history.replaceState({}, '', newUrl.toString());
      handleGithubCallback(code);
    } else if (urlError) {
      const message = errorDescription
        ? decodeURIComponent(errorDescription).replace(/\+/g, ' ')
        : 'Access to your GitHub account was denied.';
      setError(`Authentication Failed: ${message}`);
    }
  }, [searchParams]);

  const handleGithubCallback = async (code: string) => {
    setIsLoggingIn(true);
    setError(null);
    try {
      // Retrieve UTMs from session storage
      const storedUtmParams = sessionStorage.getItem('utm_params');
      const campaign_metadata = storedUtmParams ? JSON.parse(storedUtmParams) : {};

      await loginWithGithub(code, false, true);
      useSuccessMessageStore.getState().clearMessage();
      
      // Set the tutorial context cookie specifically for the repo analysis flow
      document.cookie = `${TUTORIAL_CONTEXT_COOKIE}=repo_analysis; path=/; max-age=300`;


      posthog?.capture('user_signed_up', {
        ...campaign_metadata,
        login_method: 'github',
        promo_applied: true,
      });
      // Optionally clean up session storage
      sessionStorage.removeItem('utm_params');
      
      router.replace('/dashboard');
    } catch (err: any) {
      callbackProcessed.current = false;
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
      {/* Hero Section */}
      <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl text-center">
          
          <header className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-card-foreground">
              Get Your <span className="text-primary">Free</span> AI Codebase Analysis
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Struggling to understand an AI-generated or unfamiliar codebase? Our agent performs a deep analysis and gives you a complete report in minutes. Your first one is on us.
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
                className="w-full max-w-xs flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-200 ease-in-out hover:shadow-lg transform hover:scale-105"
              >
                <GitHubLogoIcon className="w-8 h-8 mr-3" />
                Start Your Free Analysis
              </button>
            )}
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500"/>
                <span>First analysis is 100% free</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500"/>
                <span>No credit card required</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center">
                Terms of Service <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center">
                Privacy Policy <ExternalLink className="ml-1 h-3 w-3" />
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

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">
              What Your Free Analysis Includes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our AI goes beyond static analysis to understand your code's purpose, structure, and health.
            </p>
          </div>
          <AnalysisAccordion />
        </div>
      </section>

      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">Simple Pricing After Your Free Run</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Loved your free analysis? Continue using our service with transparent, pay-as-you-go pricing. No subscriptions, no surprises.
            </p>
            <div className="mt-8 rounded-lg bg-card p-6 border text-left">
              <ul className="space-y-4 text-card-foreground">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <strong className="block">Direct AI API Costs</strong>
                    You only pay the pass-through cost for the AI models used.
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 mr-3 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <strong className="block">Compute Runtime Fee</strong>
                    A small fee for the 5-10 minutes of virtual machine time.
                  </div>
                </li>
              </ul>
              <div className="mt-6 text-center text-sm text-card-foreground bg-primary/10 p-4 rounded-md border border-primary/20">
                <p>
                  A complete analysis for a medium-sized project typically costs <strong className="text-primary">less than a dollar.</strong>
                </p>
              </div>
            </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          {/* CHANGE: Headline reinforces the free offer */}
          <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">Ready for Your Free Code X-Ray?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get actionable insights and a complete architectural overview in less time than a coffee break. Click below to start.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            {/* CHANGE: Consistent button text */}
            <button
              onClick={handleGitHubLogin}
              disabled={isLoggingIn}
              className="w-full max-w-xs inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-200 ease-in-out hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
            >
              <GitHubLogoIcon className="w-8 h-8 mr-3" />
              Claim Free Analysis
            </button>
            <p className="text-sm text-muted-foreground">No credit card required to sign up.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-center text-sm text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} PromptToSoftware, LLC. All rights reserved.</span>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                <a href="/terms" className="hover:underline">Terms of Service</a>
                <a href="/privacy" className="hover:underline">Privacy Policy</a>
                <a
                  href="https://www.linkedin.com/company/prompttosoftware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition flex items-center"
                >
                  <Linkedin className="h-4 w-4 mr-1" />
                  <span>LinkedIn</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>

                <a
                  href="https://www.youtube.com/@prompttosoftware"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition flex items-center"
                >
                  <Youtube className="h-4 w-4 mr-1" />
                  <span>YouTube</span>
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
            </div>
        </div>
      </footer>
    </div>
  );
}
