import React, { ReactNode } from 'react';
import { BiSearchAlt2 } from 'react-icons/bi'; // Using react-icons for a generic icon

interface EmptyStateProps {
  message: string;
  actionButton?: ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
      <div className="text-gray-400 mb-4">
        {/* Generic Icon placeholder */}
        <BiSearchAlt2 className="w-16 h-16 mx-auto" data-testid="empty-state-icon" />
      </div>
      <p className="text-xl font-semibold text-gray-700 mb-2">
        {message}
      </p>
      {actionButton && (
        <div className="mt-4">{actionButton}</div>
      )}
    </div>
  );
};

export default EmptyState;
