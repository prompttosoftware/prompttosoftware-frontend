'use client';

import React, { useEffect, useRef } from 'react';
import { useSuccessMessageStore } from '@/store/successMessageStore';

const SuccessToast: React.FC = () => {
  const { successMessage, clearSuccessMessage } = useSuccessMessageStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (successMessage) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Set a new timer to auto-clear the message after 5-7 seconds
      const autoClearDuration = Math.random() * (7000 - 5000) + 5000; // Between 5000ms and 7000ms
      timerRef.current = setTimeout(() => {
        clearSuccessMessage();
      }, autoClearDuration);
    } else {
      // If successMessage is null, clear any active timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    // Cleanup on unmount or if successMessage changes before timer fires
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [successMessage, clearSuccessMessage]);

  if (!successMessage) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 max-w-sm w-full">
      <div
        className="relative bg-green-500 text-white p-4 rounded-lg shadow-lg border-2 border-green-600 flex items-center justify-between"
        role="alert"
      >
        <p className="flex-grow pr-4 text-sm font-medium">{successMessage}</p>
        <button
          onClick={clearSuccessMessage}
          className="flex-shrink-0 ml-4 p-1 rounded-full text-white opacity-75 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-500"
          aria-label="Close"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SuccessToast;
