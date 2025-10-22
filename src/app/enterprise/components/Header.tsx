'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LandingPageHeaderProps {
  textColor?: 'light' | 'dark';
}

export default function LandingPageHeader({ textColor = 'light' }: LandingPageHeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseText =
    textColor === 'light'
      ? { normal: 'text-white', scrolled: 'text-foreground' }
      : { normal: 'text-foreground', scrolled: 'text-foreground' };

  const buttonText =
    textColor === 'light'
      ? { normal: 'text-white hover:bg-white/10 hover:text-white', scrolled: 'text-muted-foreground hover:text-foreground' }
      : { normal: 'text-foreground hover:text-foreground/80', scrolled: 'text-muted-foreground hover:text-foreground' };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-2 transition-all duration-300 ease-in-out border-b',
        {
          'bg-background/80 backdrop-blur-sm border-border': hasScrolled,
          'bg-transparent border-transparent': !hasScrolled,
        }
      )}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logos/company-logo.svg" alt="PTS Automation Logo" width={32} height={32} />
          <span
            className={cn(
              'text-lg font-bold hidden sm:block transition-colors',
              hasScrolled ? baseText.scrolled : baseText.normal
            )}
          >
            PTS Automation
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            asChild
            className={cn('transition-colors', hasScrolled ? buttonText.scrolled : buttonText.normal)}
          >
            <Link href="/about">About</Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className={cn('transition-colors', hasScrolled ? buttonText.scrolled : buttonText.normal)}
          >
            <Link href="/contact">Contact</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
