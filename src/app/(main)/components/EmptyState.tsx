import React, { ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  message: string;
  actionButton?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <div className="text-gray-400 mb-4 mx-auto w-16 h-16">
        {/* Generic Icon placeholder */}
        <MagnifyingGlassIcon
          data-testid="empty-state-icon"
          className="w-full h-full"
        />
      </div>
      <p className="text-xl font-semibold text-gray-700 mb-2">{message}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
