import React from 'react';

const AddPaymentButton: React.FC = () => {
  return (
    <button
  className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-md border border-gray-400
             md:w-12 md:h-12 lg:w-14 lg:h-14 hover:bg-gray-300 transition-colors duration-200"
  onClick={() => {
    const isAuthenticated = false; // Placeholder for authentication state
    if (!isAuthenticated) {
      console.log('Redirect to login for this feature (Add Payment).');
    } else {
      console.log('Add Payment button clicked! (Will trigger payment flow from another Epic)');
    }
  }}
>
      {/* Plus icon placeholder */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-700"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>
  );
};

export default AddPaymentButton;
