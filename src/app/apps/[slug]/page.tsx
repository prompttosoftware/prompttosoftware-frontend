import { apps } from '@/lib/appsData';
import { notFound } from 'next/navigation';
import LandingPageHeader from '../components/LandingPageHeader';
import LandingPageHero from '../components/LandingPageHero';
import LandingPageFeatures from '../components/LandingPageFeatures';
import { Metadata } from 'next';
import LandingPageFooter from '../components/LandingPageFooter';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static pages at build time for better performance and SEO
export async function generateStaticParams() {
  return apps.map((app) => ({
    slug: app.slug,
  }));
}

const AppPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

// Generate dynamic metadata for each page
export async function generateMetadata({ params }: Props): Promise<Metadata> {

  let slug: string | undefined;

  try {
    if (!params) {
      console.error('No props or params provided');
      notFound();
    }
    
    // Handle both Promise and direct object cases for backward compatibility
    let resolvedParams;
    if (typeof params.then === 'function') {
      // It's a Promise
      resolvedParams = await params;
    } else {
      // It's already an object (shouldn't happen in Next.js 15+, but just in case)
      resolvedParams = params as any;
    }
    
    console.log('Resolved params:', resolvedParams);
    
    if (!resolvedParams || typeof resolvedParams.slug !== 'string') {
      console.error('Invalid resolved params:', resolvedParams);
      notFound();
    }
    
    slug = resolvedParams.slug;
    console.log('Final slug:', slug);
    
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  const app = apps.find((app) => app.slug === slug);

  if (!app) {
    return {
      title: 'App Not Found',
    };
  }

  return {
    title: `${app.name} | ${app.tagline}`,
    description: app.tagline
  };
}

export default async function AppLandingPage({ params }: Props) {

  let slug: string | undefined;

  try {
    if (!params) {
      console.error('No props or params provided');
      notFound();
    }
    
    // Handle both Promise and direct object cases for backward compatibility
    let resolvedParams;
    if (typeof params.then === 'function') {
      // It's a Promise
      resolvedParams = await params;
    } else {
      // It's already an object (shouldn't happen in Next.js 15+, but just in case)
      resolvedParams = params as any;
    }
    
    console.log('Resolved params:', resolvedParams);
    
    if (!resolvedParams || typeof resolvedParams.slug !== 'string') {
      console.error('Invalid resolved params:', resolvedParams);
      notFound();
    }
    
    slug = resolvedParams.slug;
    console.log('Final slug:', slug);
    
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  const appData = apps.find((app) => app.slug === slug);

  // If no app data is found for the given slug, show a 404 page
  if (!appData) {
    notFound();
  }

  return (
    <Suspense fallback={AppPageFallback}>
    <main>
      {/* 
        The CSS variable `--primary-color` allows us to use the app's theme 
        color in global styles or other components if needed.
      */}
      <style>{`:root { --primary-color: ${appData.themeColor.primary}; }`}</style>
      
      <LandingPageHeader textColor='dark' />
      <LandingPageHero app={appData} />
      <LandingPageFooter></LandingPageFooter>
    </main>
    </Suspense>
  );
}
