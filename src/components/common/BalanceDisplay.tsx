import React from 'react';
import { useBalance } from '@/store/balanceStore';

/**
 * BalanceDisplay component: Displays the current user balance.
 * Renders the balance formatted as a currency.
 */
export const BalanceDisplay: React.FC = () => {
  const balance = useBalance();

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  return (
    <div className="balance-display" data-testid="balance-display">
      <span className="balance-label">Current Balance: </span>
      <span className="balance-amount">{formattedBalance}</span>
    </div>
  );
};
