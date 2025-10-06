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
  Cog6ToothIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import * as Tooltip from '@radix-ui/react-tooltip';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'New Project', href: '/new-project', icon: PlusIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Analysis', href: '/analysis', icon: ClipboardDocumentCheckIcon },
  { name: 'Chat', href: '/chat/new', icon: ChatBubbleOvalLeftEllipsisIcon },
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

  const handleNavigationClick = () => {
    if (isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  };

  return (
    <Tooltip.Provider>
      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Side Navigation Bar */}
      <div
        className={`flex-col h-full bg-background text-foreground transition-all duration-300 ease-in-out fixed left-0 top-0 bottom-0 z-50 border side-navbar
          ${isExpanded ? 'w-64' : 'w-20'}
          ${isMobileNavOpen ? 'flex w-64' : 'hidden'}
          md:flex`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="flex items-center justify-end h-16 px-4">
          <button
            onClick={toggleExpansion}
            className="p-2 rounded-full focus:outline-none focus:ring hidden md:flex"
            aria-label={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
          >
            {isExpanded ? (
              <ChevronLeftIcon className="h-6 w-6 text-foreground" />
            ) : (
              <ChevronRightIcon className="h-6 w-6 text-foreground" />
            )}
          </button>
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-2 rounded-full focus:outline-none focus:ring flex md:hidden ml-auto"
            aria-label="Close navigation"
          >
            <ChevronLeftIcon className="h-6 w-6 text-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigationItems.map((item) =>
            isExpanded ? (
              // When expanded: no tooltip, show icon and label
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center p-3 rounded-lg text-sm font-medium justify-start text-foreground transition-colors duration-200 focus:outline-none focus:ring"
                aria-label={item.name}
                onClick={handleNavigationClick}
                {...(
                  item.name === 'New Project' ? { 'id': 'nav-link-new-project' } :
                  item.name === 'Explore' ? { 'id': 'nav-link-explore' } :
                  item.name === 'Projects' ? { 'id': 'nav-link-projects' } :
                  item.name === 'Analysis' ? { 'id': 'nav-link-analysis' } :
                  {}
                )}
              >
                <item.icon className="h-6 w-6 mr-3" />
                <span>{item.name}</span>
              </Link>
            ) : (
              // When collapsed: show icon only and wrap with tooltip
              <Tooltip.Root key={item.name} delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <Link
                    href={item.href}
                    className="flex items-center p-3 rounded-lg text-sm font-medium justify-center text-foreground transition-colors duration-200 focus:outline-none focus:ring"
                    aria-label={item.name}
                    {...(
                      item.name === 'New Project' ? { 'data-testid': 'new-project-button' } :
                      item.name === 'Explore' ? { id: 'explore-tab' } :
                      item.name === 'Projects' ? { id: 'projects-tab' } :
                      {}
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md shadow-lg z-[60]"
                    side="right"
                    sideOffset={5}
                  >
                    {item.name}
                    <Tooltip.Arrow className="fill-current text-popover" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            )
          )}
        </nav>

        <div className="mt-auto p-4 border-t border-border">
          {/* Future bottom navigation items or user info */}
        </div>
      </div>
    </Tooltip.Provider>
  );

};

export default SideNavBar;
