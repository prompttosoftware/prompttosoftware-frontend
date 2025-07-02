import React from 'react';

interface BalanceDisplayProps {
  balance: number;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
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
