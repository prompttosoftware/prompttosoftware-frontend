'use client';

import React, { useEffect, useRef } from 'react';
import { useGlobalErrorStore } from '@/store/globalErrorStore';

const ErrorModal: React.FC = () => {
  const { error, clearError } = useGlobalErrorStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (error) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      // Set a new timer to auto-clear the error after 5-7 seconds
      // Using a random duration within the range for a touch of dynamism
      const autoClearDuration = Math.random() * (7000 - 5000) + 5000; // Between 5000ms and 7000ms
      timerRef.current = setTimeout(() => {
        clearError();
      }, autoClearDuration);
    } else {
      // If error is null, clear any active timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
    // Cleanup on unmount or if error changes before timer fires
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [error, clearError]);

  if (!error) {
    return null;
  }

  const { message, type = 'error' } = error;

  let bgColorClass = 'bg-red-500';
  let textColorClass = 'text-white';
  let borderColorClass = 'border-red-600';

  switch (type) {
    case 'warning':
      bgColorClass = 'bg-yellow-500';
      textColorClass = 'text-gray-800';
      borderColorClass = 'border-yellow-600';
      break;
    case 'info':
      bgColorClass = 'bg-blue-500';
      textColorClass = 'text-white';
      borderColorClass = 'border-blue-600';
      break;
    case 'error':
    default:
      // Already set for error
      break;
  }

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 max-w-sm w-full">
      <div
        className={`relative ${bgColorClass} ${textColorClass} p-4 rounded-lg shadow-lg border-2 ${borderColorClass} flex items-center justify-between`}
        role="alert"
      >
        <p className="flex-grow pr-4 text-sm font-medium">{message}</p>
        <button
          onClick={clearError}
          className={`flex-shrink-0 ml-4 p-1 rounded-full ${textColorClass} opacity-75 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColorClass === 'text-white' ? 'focus:ring-offset-red-500' : 'focus:ring-offset-yellow-500'}`}
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

export default ErrorModal;
