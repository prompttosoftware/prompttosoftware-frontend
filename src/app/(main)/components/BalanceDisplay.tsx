import React from 'react';
import { useBalance } from '@/store/balanceStore'; // Import the new hook

const BalanceDisplay: React.FC = () => { // No longer needs props
  const balance = useBalance(); // Use the hook to get balance from store

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balance);

  return (
    <div className="flex items-center justify-center w-24 h-12 bg-gray-200 text-gray-800 rounded-md border border-gray-400 font-semibold text-lg">
      {formattedBalance}
    </div>
  );
};

export default BalanceDisplay;
