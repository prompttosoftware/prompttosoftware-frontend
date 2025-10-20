import { apps } from '@/lib/appsData';
import { notFound } from 'next/navigation';
import LandingPageHeader from '../components/LandingPageHeader';
import LandingPageHero from '../components/LandingPageHero';
import LandingPageFeatures from '../components/LandingPageFeatures';
import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

// Generate static pages at build time for better performance and SEO
export async function generateStaticParams() {
  return apps.map((app) => ({
    slug: app.slug,
  }));
}

// Generate dynamic metadata for each page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = apps.find((app) => app.slug === params.slug);

  if (!app) {
    return {
      title: 'App Not Found',
    };
  }

  return {
    title: `${app.name} | ${app.tagline}`,
    description: app.description,
  };
}

export default async function AppLandingPage({ params }: Props) {
  const { slug } = params;
  const appData = apps.find((app) => app.slug === slug);

  // If no app data is found for the given slug, show a 404 page
  if (!appData) {
    notFound();
  }

  return (
    <main>
      {/* 
        The CSS variable `--primary-color` allows us to use the app's theme 
        color in global styles or other components if needed.
      */}
      <style>{`:root { --primary-color: ${appData.themeColor.primary}; }`}</style>
      
      <LandingPageHeader />
      <LandingPageHero app={appData} />
      <LandingPageFeatures app={appData} />
      {/* You can add a shared footer component here as well */}
    </main>
  );
}
