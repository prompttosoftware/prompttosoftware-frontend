import Link from 'next/link';
import Image from 'next/image';
import { Github, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPageFooter() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-12 px-4">
        {/* Column 1: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logos/company-logo.svg"
              alt="PromptToSoftware Logo"
              width={32}
              height={32}
            />
            <span className="text-lg font-bold">PromptToSoftware</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} PromptToSoftware, LLC. <br /> All
            rights reserved.
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-foreground mb-4">Navigate</h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/login/analysis"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Analysis
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* Column 3: Social & Legal */}
        <div className="text-center md:text-left">
          <h3 className="font-semibold text-foreground mb-4">Connect</h3>
          <div className="flex justify-center md:justify-start gap-2 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://www.youtube.com/@prompttosoftware"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://www.linkedin.com/company/prompttosoftware"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/prompttosoftware"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
