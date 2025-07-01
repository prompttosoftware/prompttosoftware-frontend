import React from 'react';

const BalanceDisplay: React.FC = () => {
  return (
    <div className="w-24 h-10 bg-gray-200 flex items-center justify-center rounded-md border border-gray-400">
      <span className="text-gray-800 font-semibold text-sm">$ 0.00</span> {/* Placeholder for balance */}
    </div>
  );
};

export default BalanceDisplay;
