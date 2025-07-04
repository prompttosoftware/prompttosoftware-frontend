// src/app/(main)/components/SideNavBar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  PlusIcon,
  FolderIcon,
  RocketLaunchIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon, // Import the settings icon
} from '@heroicons/react/24/outline'; // Using outline icons
import * as Tooltip from '@radix-ui/react-tooltip';
import { AddPaymentButton } from './AddPaymentButton';
import WatchAdButton from './WatchAdButton';

const navigationItems = [
  { name: 'Home/Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'New Project', href: '/new-project', icon: PlusIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Explore', href: '/explore', icon: RocketLaunchIcon },
  { name: 'Help', href: '/help', icon: QuestionMarkCircleIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SideNavBarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

const SideNavBar: React.FC<SideNavBarProps> = ({
  isExpanded,
  setIsExpanded,
  isMobileNavOpen,
  setIsMobileNavOpen,
}) => {
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Tooltip.Provider>
      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Side Navigation Bar */}
      <div
        className={`flex-col h-full bg-gray-800 text-white transition-all duration-300 ease-in-out fixed left-0 top-0 bottom-0 z-50 shadow-lg
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobileNavOpen ? 'flex w-64' : 'hidden'}
          md:flex`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="flex items-center justify-end h-16 px-4">
          <button
            onClick={toggleExpansion}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden md:flex" // Hide on mobile nav
            aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            {isExpanded ? (
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex md:hidden ml-auto" // Show only on mobile nav
            aria-label="Close navigation"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigationItems.map((item) => (
            <Tooltip.Root key={item.name} delayDuration={300}>
              <Tooltip.Trigger asChild>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg text-sm font-medium ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  } text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={item.name}
                >
                  <item.icon className={`h-6 w-6 ${isExpanded ? 'mr-3' : ''}`} />
                  <span className={`${isExpanded ? '' : 'hidden'}`}>{item.name}</span>
                </Link>
              </Tooltip.Trigger>
              {!isExpanded && (
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-700 text-white text-xs px-2 py-1 rounded-md shadow-lg"
                    sideOffset={5}
                  >
                    {item.name}
                    <Tooltip.Arrow className="fill-current text-gray-700" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              )}
            </Tooltip.Root>
          ))}
          {/* Add Funds Button */}
          <div
            className={`flex items-center p-3 rounded-lg text-sm font-medium ${
              isExpanded ? 'justify-start' : 'justify-center'
            } text-gray-300`}
          >
            <AddPaymentButton />
          </div>
          {/* Watch Ad Button */}
          <div
            className={`flex items-center p-3 rounded-lg text-sm font-medium ${
              isExpanded ? 'justify-start' : 'justify-center'
            } text-gray-300`}
          >
            <WatchAdButton />
          </div>
        </nav>

        {/* Spacer to push content up if needed or for future bottom items */}
        <div className="mt-auto p-4 border-t border-gray-700">
          {/* Future bottom navigation items or user info */}
        </div>
      </div>
    </Tooltip.Provider>
  );
};

export default SideNavBar;
