'use client';

import React from 'react';

const AddPaymentButton: React.FC = () => {
  // For now, assume unauthenticated for simplicity as per instructions.
  // In a real application, this would come from a global auth context or state.
  const isAuthenticated = false; // Placeholder for authentication status

  const handleClick = () => {
    if (!isAuthenticated) {
      console.log('Redirect to login for this feature.');
    } else {
      console.log('Payment button clicked. Initiating payment functionality.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        flex items-center justify-center
        w-10 h-10 md:w-12 md:h-12 rounded-lg
        bg-green-500 hover:bg-green-600 active:bg-green-700
        text-white transition-colors duration-200 ease-in-out
        shadow-md
      "
      aria-label="Add Payment"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </button>
  );
};

export default AddPaymentButton;
