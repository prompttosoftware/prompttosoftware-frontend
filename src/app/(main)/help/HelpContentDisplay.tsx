'use client';

import React, { useState } from 'react';

interface HelpMenuItem {
  name: string;
  content: React.ReactNode;
}

interface HelpContentDisplayProps {
  initialSelectedItemName: string;
  helpMenuItems: HelpMenuItem[];
}

export default function HelpContentDisplay({ initialSelectedItemName, helpMenuItems }: HelpContentDisplayProps) {
  const [selectedItemName, setSelectedItemName] = useState<string>(initialSelectedItemName);
  const [isNavOpen, setIsNavOpen] = useState(false); // State to control mobile nav

  const selectedItem = helpMenuItems.find(item => item.name === selectedItemName);

  const handleItemClick = (name: string) => {
    setSelectedItemName(name);
    setIsNavOpen(false); // Close nav on mobile after selection
  };

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="flex items-center justify-between w-full bg-card border rounded-lg p-3 text-lg font-semibold"
        >
          <span>{selectedItemName}</span>
          {/* A simple SVG for a chevron icon. Replace with a proper icon library. */}
          <svg className={`w-5 h-5 transition-transform ${isNavOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      {/* Navigation Sidebar (Conditional for mobile) */}
      <nav className={`
        w-full md:w-1/4 lg:w-1/5 flex-shrink-0 bg-card rounded-lg border p-4 mb-4 md:mb-0 md:mr-4
        ${isNavOpen ? 'block' : 'hidden'} md:block
      `}>
        <ul className="space-y-2">
          {helpMenuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleItemClick(item.name)}
                className={`
                  w-full text-left py-2 px-3 rounded-md transition-colors duration-200
                  ${selectedItemName === item.name
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-primary hover:bg-primary-hover hover:text-primary-hover-foreground'
                  }
                `}
                data-testid={`help-nav-button-${item.name.toLowerCase()}`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content Area */}
      <div className="flex-grow bg-card rounded-lg border p-6 lg:p-8 overflow-y-auto">
        {selectedItem ? selectedItem.content : <p className="text-card-foreground">Select an item from the menu.</p>}
      </div>
    </>
  );
}
