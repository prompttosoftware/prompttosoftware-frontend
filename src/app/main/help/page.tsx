'use client';

import React, { useState } from 'react';

interface HelpMenuItem {
  name: string;
  content: React.ReactNode;
}

const helpMenuItems: HelpMenuItem[] = [
  {
    name: 'About',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4">About This Application</h2>
        <p className="text-gray-700 leading-relaxed">
          This application is designed to help you generate software projects from simple text prompts.
          It leverages advanced AI models to interpret your requirements and produce functional codebases,
          boilerplate, and project structures. Our goal is to streamline the development process and make it
          accessible to everyone, regardless of their coding expertise.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          We are constantly working to improve our services, add new features, and expand the range of
          technologies we support. Your feedback is invaluable in helping us achieve this.
        </p>
      </div>
    ),
  },
  {
    name: 'GitHub',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4">GitHub Integration</h2>
        <p className="text-gray-700 leading-relaxed">
          Our application provides seamless integration with GitHub, allowing you to easily manage your
          generated projects. You can connect your GitHub account to directly push new projects to your
          repositories, manage existing ones, and collaborate with your team.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          To link your GitHub account, navigate to the settings page. Once connected, you will be able
          to select a repository when creating a new project.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          For more information on GitHub, visit their official website:
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">github.com</a>.
        </p>
      </div>
    ),
  },
  {
    name: 'Jira',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4">Jira Integration (Coming Soon)</h2>
        <p className="text-gray-700 leading-relaxed">
          We are planning to introduce Jira integration in the near future. This will allow you to
          automatically create issues, link them to your generated projects, and track development
          progress directly from our platform.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Stay tuned for updates on this exciting new feature that will further enhance your project management capabilities.
        </p>
      </div>
    ),
  },
  {
    name: 'Addons',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Addons</h2>
        <p className="text-gray-700 leading-relaxed">
          Enhance your experience with various addons that provide additional functionalities.
          These addons can include advanced code generation templates, integrations with other
          development tools, and specialized frameworks.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Check the 'Explore' section to discover and enable new addons. Each addon is designed
          to provide specific benefits and extend the core capabilities of the application.
        </p>
      </div>
    ),
  },
  {
    name: 'Billing',
    content: (
      <div>
        <h2 className="text-2xl font-bold mb-4">Billing and Subscriptions</h2>
        <p className="text-gray-700 leading-relaxed">
          Our pricing model is designed to be flexible, offering various subscription plans to
          suit your needs, from free tiers to premium packages with advanced features and higher usage limits.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          You can manage your subscription, view your billing history, and update your payment
          information in the 'Settings' section under 'Billing'.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          If you have any questions regarding billing, please contact our support team.
        </p>
      </div>
    ),
  },
];

export default function HelpPage() {
  const [selectedItemName, setSelectedItemName] = useState<string>(helpMenuItems[0].name);

  const selectedItem = helpMenuItems.find(item => item.name === selectedItemName);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
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
    </div>
  );
}
