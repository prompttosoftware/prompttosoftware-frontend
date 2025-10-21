// app/about/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';
import { GitHubLogoIcon } from '@/components/icons/GitHubLogoIcon';

import React, { Suspense } from "react";
import LandingPageHeader from "../apps/components/LandingPageHeader";
import LandingPageFooter from "../apps/components/LandingPageFooter";

const AppPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

const founderDetails = {
  name: 'Benjamin Moen',
  title: 'Founder & CEO',
  imageUrl: '/photos/Founder-photo.png',
  bio: [
    "While working at another startup, it was clear I was going be responsible for writing and maintaining a lot of tests for the multiple applications and apps we were building. I didn't want to do that, so I devised a plan for an AI agent system that would write tests and fix bugs for us. I quickly realized the potential for a full software development system. At the time (start of 2025), there were only a handful of AI software development tools. After six months of development, the market is flooded with them. However, I believe our product stands out in affordability and freedom to build anything.",
    "We have a lot of features planned for the future and will continue to improve the product. I greatly appreciate any feedback or requests you might have.",
    "We're just getting started, and I'm incredibly excited to see what we can build together. Thank you for being a part of our journey."
  ],
  linkedinUrl: 'https://www.linkedin.com/in/benjamin-moen/',
};


export default function AboutPage() {
  return (
    <Suspense fallback={AppPageFallback}>
    <main>
    <LandingPageHeader textColor='dark' />
    <div className="bg-background text-foreground">
      {/* Mission Section */}
      <section className="py-20 sm:py-24 bg-secondary/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-card-foreground">
            Our Mission
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            To empower developers and organizations by automating the entire software development lifecycle. We build autonomous AI agents that write, test, and maintain code, allowing human developers to get out of the office, touch grass and enjoy life.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            
            {/* Founder Image */}
            <div className="flex-shrink-0">
              <Image
                src={founderDetails.imageUrl}
                alt={`Photo of ${founderDetails.name}`}
                width={200}
                height={200}
                className="rounded-full object-cover w-[150px] h-[150px] md:w-[200px] md:h-[200px] border-4 border-primary/20 shadow-lg"
              />
            </div>

            {/* Founder Bio */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-card-foreground">
                    A Message from the Founder
                </h2>
                <a
                    href={founderDetails.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="LinkedIn Profile"
                >
                    <Linkedin className="w-6 h-6" />
                </a>
              </div>
              <p className="mt-2 text-lg font-medium text-primary">
                {founderDetails.name}
              </p>
              <p className="text-md text-muted-foreground mb-6">
                {founderDetails.title}
              </p>

              <div className="space-y-4 text-muted-foreground">
                {founderDetails.bio.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-card-foreground sm:text-4xl">Join Our Mission</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Help us shape the future of software development. Get started today and see what autonomous AI can build for you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center">
            <Link
              href="/login"
              className="w-full max-w-xs inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-all duration-200 ease-in-out hover:shadow-lg"
            >
              <GitHubLogoIcon className="w-8 h-8 mr-3" />
              Get Started with GitHub
            </Link>
          </div>
        </div>
      </section>
    </div>
    <LandingPageFooter></LandingPageFooter>
    </main>
    </Suspense>
  );
}
