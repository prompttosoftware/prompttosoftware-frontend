'use client'; // This is a client component

import { useGlobalError } from '@/hooks/useGlobalError';
import api from '@/lib/api'; // Import the axios instance
import React from 'react';

export default function DashboardPage() {
  // setError is no longer directly used here as axios interceptor will handle it
  const { setError } = useGlobalError(); // Keep it for now, might be useful if specific local errors still need direct handling

  const handleTriggerError = async () => {
    try {
      await api.get('/api/mock-error'); // Use the axios instance
      console.log(
        'Mock error endpoint returned success (should not happen for this test).',
      );
    } catch (error) {
      // The axios interceptor should catch this error now, so direct setError call is not needed.
      console.error('Failed to fetch mock error:', error);
      // Optionally, if there's a network error before the interceptor,
      // you might want to show a generic message. But typically, axios handles network errors too.
    }
  };

  return (
    <div>
      <h1>Dashboard Page</h1>
      <button
        onClick={handleTriggerError}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Trigger Global Error
      </button>
    </div>
  );
}
