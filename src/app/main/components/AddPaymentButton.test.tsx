import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddPaymentButton from './AddPaymentButton';
import { usePaymentModalStore } from '@/store/paymentModalStore';

// Mock the zustand store module
jest.mock('@/store/paymentModalStore', () => ({
  usePaymentModalStore: jest.fn(),
}));

describe('AddPaymentButton', () => {
  const mockOpenModal = jest.fn();

  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
    // Configure the mock to return the desired state and actions for the selector
    (usePaymentModalStore as jest.Mock).mockImplementation((selector) => selector({ openModal: mockOpenModal }));
  });

  test('renders correctly', () => {
    render(<AddPaymentButton />);
    expect(screen.getByRole('button', { name: /add payment/i })).toBeInTheDocument();
    expect(screen.getByText('Add Payment')).toBeInTheDocument();
  });

  test('calls openModal on click', () => {
    render(<AddPaymentButton />);
    const button = screen.getByRole('button', { name: /add payment/i });
    fireEvent.click(button);
    expect(mockOpenModal).toHaveBeenCalledTimes(1);
  });
});
