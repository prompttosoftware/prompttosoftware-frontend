// app/help/HelpContentDisplay.tsx (This will be your Client Component)
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

  const selectedItem = helpMenuItems.find(item => item.name === selectedItemName);

  return (
    <>
      {/* Navigation Sidebar */}
      <nav className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 md:mb-0 md:mr-4">
        <ul className="space-y-2">
          {helpMenuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setSelectedItemName(item.name)}
                className={`
                  w-full text-left py-2 px-3 rounded-md transition-colors duration-200
                  ${selectedItemName === item.name
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-500'
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
      <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 lg:p-8 overflow-y-auto">
        {selectedItem ? selectedItem.content : <p className="text-gray-700 dark:text-gray-300">Select an item from the menu.</p>}
      </div>
    </>
  );
}
