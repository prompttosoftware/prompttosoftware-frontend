import React, { ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: ReactNode;
  buttonText?: string;
  buttonLink?: string;
  hideButton?: boolean; // New prop to hide the button
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionButton,
  buttonText,
  buttonLink,
  hideButton = false, // Default to false
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <div className="text-foreground mx-auto w-16 h-16">
        {/* Generic Icon placeholder */}
        <MagnifyingGlassIcon data-testid="empty-state-icon" className="w-full h-full" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-foreground mb-4">{description}</p>
      {!hideButton && buttonText && buttonLink && (
        <Link href={buttonLink} passHref>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary-hover hover:text-primary-foreground focus:outline-none focus:ring">
            {buttonText}
          </button>
        </Link>
      )}
      {!hideButton && actionButton && !buttonText && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
