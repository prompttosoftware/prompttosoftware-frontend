'use client'; // This is a client component

import React from 'react';
import { useBalance, useBalanceStore } from '@/store/balanceStore'; // Import useBalance and useBalanceStore
import useProtectedRoute from '@/hooks/useProtectedRoute';

export default function DashboardPage() {
  const { isLoading } = useProtectedRoute(); // Apply the protection hook and get isLoading
  const balance = useBalance(); // Get the current balance
  const setBalance = useBalanceStore((state) => state.setBalance); // Get the setBalance function

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading authentication...</p>
      </div>
    );
  }

  const handleUpdateBalance = () => {
    const newBalance = Math.floor(Math.random() * 1000) + 1; // Simulate a new balance
    setBalance(newBalance);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Page</h1>
      <p className="text-lg mb-4">
        Current Balance: <span className="font-semibold">${balance.toFixed(2)}</span>
      </p>
      <button
        onClick={handleUpdateBalance}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
      >
        Simulate Balance Update
      </button>
      <p className="mt-4 text-sm text-gray-600">
        (Balance will update automatically if `useAuthApollo` updates the user profile with a new
        balance, or you can use the button above to simulate a change locally for testing
        reactivity.)
      </p>
    </div>
  );
}
