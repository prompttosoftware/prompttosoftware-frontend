// src/providers/posthog-provider.tsx
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useAuth } from '@/hooks/useAuth' // Assuming useAuth gives you user info
import { useEffect } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // This captures clicks, form submissions, etc., automatically
    autocapture: true, 
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWrapper>
        {children}
      </PostHogAuthWrapper>
    </PostHogProvider>
  )
}

// This component identifies the user to PostHog when they log in
function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth(); // You need a way to get the user object

  useEffect(() => {
    if (isAuthenticated && user) {
      posthog.identify(
        user._id, // The user's unique ID
        {
          email: user.email, // Any other user properties
          name: user.name,
        }
      );
    } else if (!isAuthenticated) {
      posthog.reset(); // If they log out
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
