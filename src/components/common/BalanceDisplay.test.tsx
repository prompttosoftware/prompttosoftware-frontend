import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BalanceDisplay } from './BalanceDisplay';
import { useBalance } from '@/store/balanceStore';

// Mock the useBalance hook
jest.mock('@/store/balanceStore', () => ({
  useBalance: jest.fn(),
}));

const mockUseBalance = useBalance as jest.Mock;

describe('BalanceDisplay', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders with default balance of 0.00', () => {
    mockUseBalance.mockReturnValue(0);
    render(<BalanceDisplay />);
    const balanceAmount = screen.getByText('$0.00');
    expect(balanceAmount).toBeInTheDocument();
    expect(screen.getByText('Current Balance:')).toBeInTheDocument();
  });

  it('renders with a positive balance', () => {
    mockUseBalance.mockReturnValue(123.45);
    render(<BalanceDisplay />);
    const balanceAmount = screen.getByText('$123.45');
    expect(balanceAmount).toBeInTheDocument();
  });

  it('renders with a negative balance', () => {
    mockUseBalance.mockReturnValue(-50.75);
    render(<BalanceDisplay />);
    const balanceAmount = screen.getByText('-$50.75'); // Expecting negative sign before dollar sign
    expect(balanceAmount).toBeInTheDocument();
  });

  it('renders with a large balance', () => {
    mockUseBalance.mockReturnValue(1000000);
    render(<BalanceDisplay />);
    const balanceAmount = screen.getByText('$1,000,000.00');
    expect(balanceAmount).toBeInTheDocument();
  });

  // Test for dynamic updates (simulated by re-rendering with new mock value)
  it('updates when the balance changes', () => {
    mockUseBalance.mockReturnValue(10.00);
    const { rerender } = render(<BalanceDisplay />);
    expect(screen.getByText('$10.00')).toBeInTheDocument();

    mockUseBalance.mockReturnValue(25.50);
    rerender(<BalanceDisplay />);
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.queryByText('$10.00')).not.toBeInTheDocument();
  });

  it('handles decimal precision correctly', () => {
    mockUseBalance.mockReturnValue(7.1); // Test with one decimal place
    render(<BalanceDisplay />);
    expect(screen.getByText('$7.10')).toBeInTheDocument();
    cleanup();

    mockUseBalance.mockReturnValue(5.123); // Test with more than two decimal places
    render(<BalanceDisplay />);
    expect(screen.getByText('$5.12')).toBeInTheDocument();
  });
});
