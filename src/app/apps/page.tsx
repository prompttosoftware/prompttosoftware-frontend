import { apps, AppData } from '@/lib/appsData';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { MapPin, Calendar } from 'lucide-react';
import LandingPageHeader from './components/LandingPageHeader';
import { Suspense } from 'react';
import LandingPageFooter from './components/LandingPageFooter';

// Set static metadata for this page
export const metadata: Metadata = {
  title: 'Our Apps | Discover Our Collection',
  description: 'Browse our collection of innovative apps, each designed to solve unique problems.',
};

/**
 * A helper function to get appropriate styling for the app status badge.
 * This makes the status visually distinct.
 */
function getStatusStyles(status: string): string {
  const baseClasses = "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold";
  switch (status.toLowerCase()) {
    case 'live':
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
    case 'beta':
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
    case 'coming soon':
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
  }
}

/**
 * A reusable card component to display a summary of an app.
 * It's wrapped in a Next.js <Link> to be navigable.
 */
function AppCard({ app }: { app: AppData }) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group relative flex flex-col rounded-xl border bg-card text-card-foreground transition-all duration-300 hover:shadow-md focus:ring"
    >
      {/* App Content */}
      <div className="flex flex-col items-center p-8 text-center flex-grow">
        {/* Logo */}
        <Image
          src={app.logoUrl}
          alt={`${app.name} Logo`}
          width={80}
          height={80}
          className="mb-4 rounded-lg object-contain"
        />

        {/* App Name */}
        <h2 className="text-xl font-bold text-foreground">{app.name}</h2>

        {/* App Tagline */}
        <p className="mt-2 text-sm text-muted-foreground">{app.tagline}</p>
      </div>

      {/* Divider & Info */}
      <div className="mt-auto border-t px-6 py-4 space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Location:</span>{' '}
            <span className="text-muted-foreground">{app.targetLocation}</span>
          </div>
        </div>

        {app.releaseDate && (
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-semibold text-foreground">Release:</span>{' '}
              <span className="text-muted-foreground">{app.releaseDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Badge in bottom-right corner */}
      <div className="absolute bottom-4 right-4">
        <span className={getStatusStyles(app.status)}>{app.status}</span>
      </div>
    </Link>
  );
}

const AppPageFallback = (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    Loading...
  </div>
);

/**
 * The main page component that displays all available apps.
 */
export default function AppsPage() {
  return (
    <Suspense fallback={AppPageFallback}>
        <LandingPageHeader textColor='dark'></LandingPageHeader>
        <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 sm:py-24">
            {/* Page Header */}
            <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Our Apps
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Discover our collection of apps, each crafted with a unique purpose.
            </p>
            </div>

            {/* Responsive Grid for App Cards */}
            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
                <AppCard key={app.slug} app={app} />
            ))}
            </div>
        </div>
        </main>
        <LandingPageFooter></LandingPageFooter>
    </Suspense>
  );
}
