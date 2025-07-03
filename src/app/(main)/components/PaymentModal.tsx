'use client';

import React, { useState } from 'react';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { Button } from '@/components/ui/button'; // Import Button component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Import DialogFooter component
} from '@/components/ui/dialog';

export function PaymentModal() {
  const { isOpen, closeModal } = usePaymentModalStore();
  const [amount, setAmount] = useState<string>('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Choose a payment method to add funds to your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={amount}
              onChange={handleAmountChange}
              min="0.01"
              step="0.01"
              placeholder="e.g., 10.00"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {parseFloat(amount) <= 0 && amount !== '' && (
              <p className="mt-2 text-sm text-red-600">Amount must be a positive number.</p>
            )}
          </div>
          <p className="text-center text-gray-500">
            Payment content coming soon...
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button type="submit">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
