import React from 'react';

const ProfileButton: React.FC = () => {
  const handleClick = () => {
    console.log('Profile button clicked!');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
      aria-label="Profile"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A11.97 11.97 0 0112 21.75c-2.586 0-5.12-2.148-7.5-6.002z"
        ></path>
      </svg>
    </button>
  );
};

export default ProfileButton;
