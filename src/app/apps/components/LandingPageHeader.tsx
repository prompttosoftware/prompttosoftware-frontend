'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function LandingPageHeader() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Set state to true if user has scrolled more than 10px
      setHasScrolled(window.scrollY > 10);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
  className={cn(
    'fixed top-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-in-out border-b',
    {
      'bg-background/80 backdrop-blur-sm border-border': hasScrolled,
      'bg-transparent border-transparent': !hasScrolled,
    }
  )}
>

      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logos/company-logo.svg" alt="PromptToSoftware Logo" width={40} height={40} />
          <span
            className={cn('text-xl font-bold hidden sm:block transition-colors', {
              'text-foreground': hasScrolled,
              'text-white': !hasScrolled,
            })}
          >
            PromptToSoftware
          </span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            asChild
            className={cn('transition-colors', {
              'text-muted-foreground hover:text-foreground': hasScrolled,
              'text-white hover:bg-white/10 hover:text-white': !hasScrolled,
            })}
          >
            <Link href="/contact">Contact</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
