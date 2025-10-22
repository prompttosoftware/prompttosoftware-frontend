'use client';

import Image from 'next/image';
import { AppData } from '@/lib/appsData';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CircleCheck, Loader2, TriangleAlert } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { api } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePostHog } from 'posthog-js/react';
import { useSearchParams } from 'next/navigation';

interface LandingPageHeroProps {
  app: AppData;
}

export default function LandingPageHero({ app }: LandingPageHeroProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const posthog = usePostHog();

  // --- Animation Hooks ---
  // 1. useScroll captures scroll information.
  const { scrollY } = useScroll();
  
  // 2. useTransform maps one value to another.
  // Here, we map the scrollY position (from 0px to 500px) to an opacity value (from 1 to 0).
  // The content will be fully visible at the top and fully transparent after scrolling 500px.
  const contentOpacity = useTransform(scrollY, [200, 500], [1, 1]);
  const contentScale = useTransform(scrollY, [200, 500], [1, 1]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email.');
      }

      await api.apps.saveEmail({ email, slug: app.slug });

      // Retrieve UTMs from session storage
      const storedUtmParams = sessionStorage.getItem('utm_params');
      const campaign_metadata = storedUtmParams ? JSON.parse(storedUtmParams) : {};

      posthog?.capture('user_signed_up', {
        ...campaign_metadata,
        from_ad: !!campaign_metadata.utm_source,
      });

      setStatus('success');
      setMessage(`Thanks for joining the ${app.name} waitlist! We'll email you with updates.`);
    } catch (error: any) {
      console.error('Error saving email:', error);
      setStatus('error');
      setMessage(
        error?.response?.data?.message ||
          error.message ||
          'Something went wrong. Please try again.'
      );
      posthog?.capture('signup_failed', { error_message: error.message });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">

      {/* Floating Content Card */}
      <motion.div
        style={{
          opacity: contentOpacity,
          scale: contentScale,
        }}
        className="w-full max-w-md bg-card/70 backdrop-blur-lg rounded-xl shadow-2xl p-6 text-center text-card-foreground border border-white/10"
      >
        <Image
          src={app.logoUrl}
          alt={`${app.name} Logo`}
          width={64}
          height={64}
          className="mx-auto mb-3"
        />
        <h1 className="text-3xl font-extrabold mb-2">{app.name}</h1>
        <p className="text-base text-muted-foreground mb-4">{app.tagline}</p>

        <div className="text-left mb-6">

            {/* 2. Key Selling Points (The most critical element to save vertical space) */}
            <ul className="text-sm space-y-2 list-disc pl-5">
                {app.description.points.map((point, index) => (
                    <li key={index} className="text-card-foreground/80" dangerouslySetInnerHTML={{ __html: point }} />
                ))}
            </ul>
        </div>

        <div className="mb-4">
            <h3 className="text-xl font-bold text-primary">
                {app.callToAction}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
                Be the first to get early access and special perks.
            </p>
        </div>

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="your.email@example.com"
              // Standardized input size and reduced font-size
              className="h-12 text-base text-center"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              required
            />
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={status === 'loading'}
              style={{ backgroundColor: app.themeColor.primary }}
            >
              {status === 'loading' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Get Notified'
              )}
            </Button>
          </form>
        )}

        <div className='py-2'></div>
        
        {/* Status Messages */}
        {status === 'success' && (
        <Alert variant="success" className="text-left">
            <CircleCheck className="h-4 w-4" />
            <AlertTitle className="font-bold">Success!</AlertTitle>
            <AlertDescription>
            {message}
            </AlertDescription>
        </Alert>
        )}

        {status === 'error' && (
        <Alert variant="destructive" className="text-left">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle className="font-bold">Oops! Something went wrong.</AlertTitle>
            <AlertDescription>
            {message}
            </AlertDescription>
        </Alert>
        )}

        <div className='py-2'></div>

        {/* 5. Footer Details (Removed logos, using simple text footnote) */}
        <p className="text-xs text-muted-foreground mt-6 opacity-60">
            Available for iOS and Android (Coming Soon).
            <br />
            Target: {app.ageRange} in {app.targetLocation}.
        </p>
      </motion.div>
    </div>
  );
}
