import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BalanceDisplay from './BalanceDisplay';
import { useBalanceStore, useBalance } from '@/store/balanceStore'; // Import useBalance

// Mock the useBalance hook directly.
jest.mock('@/store/balanceStore', () => ({
  // Mock the actual Zustand store object with its methods
  useBalanceStore: {
    getState: jest.fn(() => ({ balance: 0 })), // Provide a default state for getState
    subscribe: jest.fn(),
    setState: jest.fn(),
  },
  useBalance: jest.fn(() => 0), // Mock the named export directly
}));

describe('BalanceDisplay (Unit Test)', () => {
  beforeEach(() => {
    // Reset the mock before each test to ensure isolation
    (useBalance as jest.Mock).mockClear();
    (useBalance as jest.Mock).mockReturnValue(0); // Default to 0 for initial state
  });

  it('renders the balance fetched from the store', () => {
    // Mock useBalance to return a specific value for this test
    (useBalance as jest.Mock).mockReturnValue(123.45);
  
    render(<BalanceDisplay />);
    expect(screen.getByText('$123.45')).toBeInTheDocument();
  });
  
  it('renders $0.00 when balance is 0', () => {
    (useBalance as jest.Mock).mockReturnValue(0);
    render(<BalanceDisplay />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });
  
  it('handles negative balance correctly', () => {
    (useBalance as jest.Mock).mockReturnValue(-50.00);
    render(<BalanceDisplay />);
    expect(screen.getByText('-$50.00')).toBeInTheDocument();
  });
  
  it('handles large balance correctly', () => {
    (useBalance as jest.Mock).mockReturnValue(1234567.89);
    render(<BalanceDisplay />);
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });
});
