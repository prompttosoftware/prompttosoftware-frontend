'use client';

import React, { useState } from 'react';
import SideNavBar from './components/SideNavBar';
import { Bars3Icon } from '@heroicons/react/24/outline'; // Import the hamburger icon
import ErrorModal from './components/ErrorModal';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // New state for mobile nav

  // This class should match the expanded/collapsed width of the SideNavBar
  const navMarginClass = isNavExpanded ? 'ml-0 md:ml-64' : 'ml-0 md:ml-20';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideNavBar
        isExpanded={isNavExpanded}
        setIsExpanded={setIsNavExpanded}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-8 z-30 transition-all duration-300 ease-in-out ${isNavExpanded ? 'md:pl-64' : 'md:pl-20'}`}
      >
        <div className="flex items-center">
          <button
            className="md:hidden p-2 mr-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          <div className="text-2xl font-semibold text-gray-800">
            {/* Dynamic Page Title Placeholder */}
            Page Title
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Profile Button */}
          <div className="relative">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </div>
          </div>
          {/* Balance Display */}
          <div className="bg-green-500 text-white font-bold py-2 px-4 rounded-md cursor-pointer hover:bg-green-600 transition-colors">
            $0.00
          </div>
          {/* Add Payment Button */}
          <div className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Payment
          </div>
          {/* Watch Ad Button */}
          <div className="bg-purple-500 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-purple-600 transition-colors">
            Watch Ad
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out ${navMarginClass} p-8 mt-16`}
      >
        {children}
      </main>
      <ErrorModal />
    </div>
  );
}
