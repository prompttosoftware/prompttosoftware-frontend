import React, { ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  title: string;
  description: string;
  actionButton?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <div className="text-gray-400 mx-auto w-16 h-16">
        {/* Generic Icon placeholder */}
        <MagnifyingGlassIcon data-testid="empty-state-icon" className="w-full h-full" />
      </div>
      <p className="text-xl font-semibold text-gray-700 mb-2">{title}</p>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
