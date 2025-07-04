'use client';

import React from 'react';

const WatchAdButton: React.FC = () => {
  // For now, assume unauthenticated for simplicity as per instructions.
  // In a real application, this would come from a global auth context or state.
  const isAuthenticated = false; // Placeholder for authentication status

  const handleClick = () => {
    if (!isAuthenticated) {
      console.warn('Redirect to login for this feature.');
    } else {
      console.warn('Watch Ad button clicked. Initiating ad functionality.');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="
        flex items-center justify-center
        w-10 h-10 md:w-12 md:h-12 rounded-lg
        bg-blue-500 hover:bg-blue-600 active:bg-blue-700
        text-white font-bold
        transition-colors duration-200 ease-in-out
        shadow-md
      "
      aria-label="Watch Ad"
    >
      AD
    </button>
  );
};

export default WatchAdButton;
