import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BalanceDisplay from './BalanceDisplay';
import { useBalanceStore } from '@/store/balanceStore';

// Mock the useBalance hook (which is part of useBalanceStore)
jest.mock('@/store/balanceStore', () => ({
  useBalanceStore: {
    getState: jest.fn(() => ({ balance: 0 })),
    subscribe: jest.fn(),
    setState: jest.fn(),
    // Mock useBalance specifically
    useBalance: jest.fn(() => 0), // Default mock value
  },
  useBalance: jest.fn(() => 0), // Mock the named export directly if used
}));

describe('BalanceDisplay (Unit Test)', () => {
  beforeEach(() => {
    // Reset the mock before each test to ensure isolation
    (useBalanceStore as any).useBalance.mockClear();
    (useBalanceStore as any).useBalance.mockReturnValue(0); // Default to 0 for initial state
    // If useBalance is a named export and not part of the store object
    (useBalance as jest.Mock).mockClear();
    (useBalance as jest.Mock).mockReturnValue(0); // Default to 0 for initial state
  });

  it('renders the balance fetched from the store', () => {
    // Mock useBalance to return a specific value for this test
    (useBalanceStore as any).useBalance.mockReturnValue(123.45);
    // Or if useBalance is a direct named export:
    // (useBalance as jest.Mock).mockReturnValue(123.45);

    render(<BalanceDisplay />);
    expect(screen.getByText('$123.45')).toBeInTheDocument();
  });

  it('renders $0.00 when balance is 0', () => {
    (useBalanceStore as any).useBalance.mockReturnValue(0);
    render(<BalanceDisplay />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles negative balance correctly', () => {
    (useBalanceStore as any).useBalance.mockReturnValue(-50.00);
    render(<BalanceDisplay />);
    expect(screen.getByText('-$50.00')).toBeInTheDocument();
  });

  it('handles large balance correctly', () => {
    (useBalanceStore as any).useBalance.mockReturnValue(1234567.89);
    render(<BalanceDisplay />);
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });
});
