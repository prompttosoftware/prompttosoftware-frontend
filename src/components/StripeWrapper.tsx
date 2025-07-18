'use client';

import React, { ReactNode } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from 'next-themes';

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!pk) console.warn("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment");

const stripePromise = loadStripe(pk ?? '');

interface StripeWrapperProps {
  children: ReactNode;
}

export function StripeWrapper({ children }: StripeWrapperProps) {
  const { theme } = useTheme();

  const options = {
    appearance: {
      theme: (theme === 'dark' ? 'night' : 'stripe') as 'night' | 'stripe',
      labels: 'floating' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
