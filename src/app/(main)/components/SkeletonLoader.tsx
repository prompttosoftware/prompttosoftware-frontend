import React from 'react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  count?: number;
  className?: string; // Optional for additional styling
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
}) => {
  return (
    <div
      data-testid="skeleton-loader"
      className={`bg-muted rounded animate-pulse ${width} ${height} ${className}`}
    />
  );
};

export default SkeletonLoader;
