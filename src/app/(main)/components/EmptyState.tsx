import React, { ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: ReactNode;
  buttonText?: string; // New prop for button text
  buttonLink?: string; // New prop for button link
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionButton, buttonText, buttonLink }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <div className="text-gray-400 mx-auto w-16 h-16">
        {/* Generic Icon placeholder */}
        <MagnifyingGlassIcon data-testid="empty-state-icon" className="w-full h-full" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {buttonText && buttonLink && (
        <Link href={buttonLink} passHref>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus->ring-offset-2 focus:ring-indigo-500">
            {buttonText}
          </button>
        </Link>
      )}
      {actionButton && !buttonText && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
