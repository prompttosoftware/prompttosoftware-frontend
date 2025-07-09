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
    <div className="flex items-center justify-end px-4 py-2 text-gray-700 rounded-lg text-xl font-bold min-w-[120px] balance-display">
      {formattedBalance}
    </div>
  );
};

export default BalanceDisplay;
