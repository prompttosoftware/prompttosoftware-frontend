import React from 'react';
import { useBalance } from '@/store/balanceStore'; // Import the new hook

const BalanceDisplay: React.FC = () => {
  // No longer needs props
  const balance = useBalance(); // Use the hook to get balance from store

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balance);

  return (
    <div className="flex items-center justify-end px-4 py-2 bg-gray-700 text-green-400 rounded-lg text-xl font-bold min-w-[120px]">
      {formattedBalance}
    </div>
  );
};

export default BalanceDisplay;
