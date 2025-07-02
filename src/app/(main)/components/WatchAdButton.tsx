import React from 'react';

const WatchAdButton: React.FC = () => {
  return (
    <button
      className="relative w-10 h-10 bg-gray-200 flex items-center justify-center rounded-md border border-gray-400
             md:w-12 md:h-12 lg:w-14 lg:h-14 hover:bg-gray-300 transition-colors duration-200"
      onClick={() => {
        const isAuthenticated = false; // Placeholder for authentication state
        if (!isAuthenticated) {
          console.log('Redirect to login for this feature (Watch Ad).');
        } else {
          console.log(
            'Watch Ad button clicked! (Will trigger ad functionality from another Epic)',
          );
        }
      }}
    >
      {/* Placeholder for "watch ad" icon, e.g., a play button */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-700"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.91 11.672a.5.5 0 010 .656l-5.601 3.5c-.155.097-.349-.059-.349-.28l.002-7c0-.222.194-.378.349-.28l5.602 3.5z"
        />
      </svg>
    </button>
  );
};

export default WatchAdButton;
