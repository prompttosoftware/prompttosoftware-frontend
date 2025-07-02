import React from 'react';

interface BalanceDisplayProps {
  balance: number;
}
const BalanceDisplay: React.FC<BalanceDisplayProps> = ({ balance }) => {
  return (
    <div className="w-24 h-10 bg-gray-200 flex items-center justify-center rounded-md border border-gray-400">
      <span className="text-gray-800 font-semibold text-sm">
        $ {balance.toFixed(2)}
      </span>{' '}
      {/* Placeholder for balance */}
    </div>
  );
};

export default BalanceDisplay;
