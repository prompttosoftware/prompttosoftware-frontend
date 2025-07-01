import React from 'react';

const ProfileButton: React.FC = () => {
  return (
    <button
  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border border-gray-400
             md:w-12 md:h-12 lg:w-14 lg:h-14 hover:bg-gray-300 transition-colors duration-200"
  onClick={() => console.log('Profile button clicked!')}
>
      {/* Generic user icon placeholder */}
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
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A11.97 11.97 0 0112 21.75c-2.586 0-5.12-2.148-7.5-6.002z"
        />
      </svg>
    </button>
  );
};

export default ProfileButton;
