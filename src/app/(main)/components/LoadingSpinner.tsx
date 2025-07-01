import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string; // Tailwind color class, e.g., 'text-blue-500' or border-blue-500 depending on implementation
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', color = 'border-blue-500' }) => {
  let spinnerSizeClasses = '';
  let borderWidthClasses = '';

  switch (size) {
    case 'small':
      spinnerSizeClasses = 'w-6 h-6';
      borderWidthClasses = 'border-2';
      break;
    case 'medium':
      spinnerSizeClasses = 'w-10 h-10';
      borderWidthClasses = 'border-4';
      break;
    case 'large':
      spinnerSizeClasses = 'w-16 h-16';
      borderWidthClasses = 'border-4';
      break;
    default:
      spinnerSizeClasses = 'w-10 h-10';
      borderWidthClasses = 'border-4';
  }

  return (
    <div className={`inline-block animate-spin rounded-full ${spinnerSizeClasses} ${borderWidthClasses} ${color} border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;
