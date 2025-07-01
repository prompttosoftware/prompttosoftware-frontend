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
  count = 1,
  className = '',
}) => {
  const skeletonItems = Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={`bg-gray-300 dark:bg-gray-700 rounded animate-pulse ${width} ${height} ${className}`}
    />
  ));

  return <div className="space-y-2">{skeletonItems}</div>;
};

export default SkeletonLoader;
