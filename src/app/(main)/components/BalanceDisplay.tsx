'use client';

import React from 'react';
import SkeletonLoader from './SkeletonLoader';

interface BalanceDisplayProps {
  balance?: number; // Accept an optional balance
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
  // If balance is not yet available, show a skeleton loader
  if (balance === undefined) {
    return (
      <div className="flex items-center justify-end px-4 py-2 min-w-[120px]">
        <SkeletonLoader width="w-20" height="h-6" />
      </div>
    );
  }

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balance);

  return (
    <div className="flex items-center justify-end px-4 py-2 text-primary text-sm font-medium min-w-[100px] balance-display">
      {formattedBalance}
    </div>
  );
};

export default BalanceDisplay;
