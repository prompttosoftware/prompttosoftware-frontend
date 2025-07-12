'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

const BalanceDisplay: React.FC = () => {
  const { user } = useAuth();
  const balance = user?.balance ?? 0;

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balance);

  return (
    <div className="flex items-center justify-end px-4 py-2 text-gray-700 rounded-lg text-xl font-bold min-w-[120px] balance-display">
      {formattedBalance}
    </div>
  );
};

export default BalanceDisplay;
