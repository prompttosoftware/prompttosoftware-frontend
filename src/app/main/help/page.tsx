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
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          This application is designed to help you generate software projects from simple text prompts.
          It leverages advanced AI models to interpret your requirements and produce functional codebases,
          boilerplate, and project structures. Our goal is to streamline the development process and make it
          accessible to everyone, regardless of their coding expertise.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2 dark:text-gray-300">
          We are constantly working to improve our services, add new features, and expand the range of
          technologies we support. Your feedback is invaluable in helping us achieve this.
        </p>
      </div>
    ),
  },
  {
    name: 'GitHub',
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Understanding GitHub & Its Use in Our Application</h2>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          GitHub is a web-based platform that uses Git for version control. It's widely used by developers
          to host and review code, manage projects, and build software alongside millions of other developers.
          Think of it as a central hub where code lives, gets tracked, and is collaboratively improved.
        </p>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          In our application, GitHub serves as the primary way to receive and manage the code projects
          you generate. Once a project is created, you have the option to connect your GitHub account
          and push the generated codebase directly to a new or existing repository in your
          GitHub account. This streamlines your workflow by making your generated code immediately
          available in a version-controlled environment.
        </p>
    
        <h3 className="text-xl font-semibold mb-2">Key GitHub Concepts:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>
            <strong>Repository (Repo):</strong> A repository is the most basic element of GitHub. It's like a folder
            for your project. A repo contains all of your project's files (including documentation, images,
            and other assets), and stores each revision of every file.
          </li>
          <li>
            <strong>Cloning:</strong> When you &quot;clone&quot; a repository, you are making a complete copy of it
            from GitHub to your local machine. This allows you to work on the code using your preferred
            local development environment.
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-sm mt-2">
              <p className="font-mono text-gray-800 dark:text-gray-200">
                <span className="font-bold text-blue-600 dark:text-blue-400">Example:</span> <code className="text-sm">git clone [repository-url]</code>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                (Replace <code>[repository-url]</code> with the actual URL of your GitHub repository.)
              </p>
            </div>
          </li>
          <li>
            <strong>Committing:</strong> A commit is a snapshot of your repository at a specific point in time. Each commit
            represents a set of changes you've made to the code.
          </li>
          <li>
            <strong>Pushing:</strong> &quot;Pushing&quot; sends your committed changes from your local repository up to the remote
            repository on GitHub, making them available to others (and keeping your GitHub repo updated).
          </li>
        </ul>
    
        <h3 className="text-xl font-semibold mb-2">Where to Learn More:</h3>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          To deepen your understanding of GitHub and Git, we recommend the following resources:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>
            <a
              href="https://docs.github.com/en/get-started"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              GitHub Docs: Getting Started
            </a> - The official documentation for beginners.
          </li>
          <li>
            <a
              href="https://guides.github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              GitHub Guides
            </a> - Short, helpful guides on specific GitHub features.
          </li>
          <li>
            <a
              href="https://try.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Try Git (Codecademy)
            </a> - An interactive tutorial to learn Git basics.
          </li>
        </ul>
    
        <p className="text-gray-700 leading-relaxed dark:text-gray-300 mt-4">
          By leveraging GitHub, you can effectively manage versions of your generated code, collaborate
          with teams, and integrate seamlessly with your existing development workflows.
        </p>
      </div>
    ),
  },
  {
    name: 'Jira',
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Understanding Jira & Its Use in Our Application</h2>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Jira is a powerful work management tool that we use for planning, tracking, and releasing software.
          It's central to our agile development process, helping us manage everything from large feature
          epics to individual tasks and bug fixes.
        </p>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Within our application's context, understanding Jira is crucial for collaborating on generated
          projects. While direct integration for creating Jira tickets from our platform is a future
          enhancement, all project-related tasks, bugs, and feature developments are currently managed
          and tracked within our Jira instance.
        </p>
    
        <h3 className="text-xl font-semibold mb-2">Key Jira Concepts:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>
            <strong>Issues:</strong> The fundamental building block in Jira. An issue can represent a task,
            a bug, a story, an epic, or any other piece of work that needs to be tracked.
          </li>
          <li>
            <strong>Workflows:</strong> Issues in Jira move through a defined workflow (e.g., To Do, In Progress,
            In Review, Done). These workflows are customized to our team's process and help visualize progress.
          </li>
          <li>
            <strong>Boards:</strong> We primarily use Scrum and Kanban boards in Jira to visualize our team's
            workflow, manage sprint backlogs, and track progress during iterations.
          </li>
          <li>
            <strong>Epics, Stories, and Tasks:</strong>
            <ul className="list-circle list-inside ml-4 text-gray-600 dark:text-gray-400">
              <li><strong>Epics:</strong> Large bodies of work that can be broken down into a number of stories.</li>
              <li><strong>Stories:</strong> User-centric descriptions of functionality that will be implemented.</li>
              <li><strong>Tasks:</strong> Smaller, actionable items required to complete a story or larger piece of work.</li>
            </ul>
          </li>
          <li>
            <strong>Integrations:</strong> Jira integrates with many other tools, including GitHub, to link code
            commits and pull requests directly to Jira issues, providing seamless traceability.
          </li>
        </ul>
    
        <h3 className="text-xl font-semibold mb-2">Where to Learn More:</h3>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          To learn more about Jira and how we use it, please refer to the following resources:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>
            <a
              href="https://www.atlassian.com/software/jira/guides"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Jira Software Guides
            </a> - Official guides from Atlassian to get started with Jira.
          </li>
          <li>
            <a
              href="https://www.atlassian.com/software/jira"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Jira Software Home
            </a> - Learn more about Jira's features and capabilities.
          </li>
        </ul>
    
        <p className="text-gray-700 leading-relaxed dark:text-gray-300 mt-4">
          By understanding and utilizing Jira effectively, you contribute to a more organized and efficient
          development process for all generated projects.
        </p>
      </div>
    ),
  },
  {
    name: 'Addons',
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Project Addons and Cost</h2>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Addons extend the functionality of your generated projects, offering specialized features
          and integrations. While some basic functionalities are included in the core project generation,
          certain advanced features, integrations, or platform-specific builds are available as addons.
        </p>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Each addon contributes to the overall cost of your project generation. Costs are typically
          calculated based on the complexity and resource intensity of the addon. You'll see a clear
          breakdown of costs associated with each selected addon before confirming your project generation.
        </p>
    
        <h3 className="text-xl font-semibold mb-2">Common Addons Include:</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>
            <strong>Android Build Support:</strong>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Enables the generation of projects with full support for Android platforms, including
              Android Studio project files, Gradle configurations, and necessary SDK integrations.
              This addon is crucial for developing mobile applications targeting Android devices.
              <span className="font-semibold text-red-600 dark:text-red-400"> (Adds to project cost)</span>
            </p>
          </li>
          <li>
            <strong>Unity Engine Integration:</strong>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Provides scaffolding and integration for projects built with the Unity game engine.
              This includes setting up Unity project structures, C# scripting environments, and
              dependencies required for game or interactive experience development.
              <span className="font-semibold text-red-600 dark:text-red-400"> (Adds significantly to project cost)</span>
            </p>
          </li>
          <li>
            <strong>Advanced AI Model Integration:</strong>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Integrates more sophisticated AI models than the default, suitable for complex
              natural language processing, machine learning, or computer vision tasks.
              <span className="font-semibold text-red-600 dark:text-red-400"> (Varies in cost based on model complexity)</span>
            </p>
          </li>
        </ul>
    
        <h3 className="text-xl font-semibold mb-2">How Costs Are Determined:</h3>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Addon costs are based on several factors, including:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li><strong>Resource Usage:</strong> Computation time, API calls, and data processing.</li>
          <li><strong>Licensing:</strong> Costs associated with third-party tools or libraries.</li>
          <li><strong>Maintenance:</strong> Ongoing updates and compatibility assurance.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300 mt-4">
          Before finalizing your project, you'll be presented with a detailed summary of all
          selected addons and their respective costs.
        </p>
      </div>
    ),
  },
  {
    name: 'Billing',
    content: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Understanding Project Billing</h2>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Project costs are primarily calculated based on the complexity and resource intensity
          required to generate your desired software. This includes factors such as:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
          <li>
            <strong>Lines of Code Generated:</strong> More extensive projects with a higher volume
            of generated code will incur higher costs.
          </li>
          <li>
            <strong>Addons Utilized:</strong> Specific addons (e.g., Android Build Support, Unity
            Engine Integration) add to the base cost due to their specialized requirements and
            additional processing. You can find more details in the "Addons" section.
          </li>
          <li>
            <strong>AI Model Usage:</strong> The complexity of the AI models employed to fulfill
            your prompt and the computational resources consumed during the generation process.
          </li>
        </ul>
    
        <h3 className="text-xl font-semibold mb-2">When Funds Are Taken Out:</h3>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          Funds for project generation are deducted from your account balance *before* the
          generation process begins. This ensures that you have sufficient funds for the
          requested project. A clear cost breakdown will always be presented to you for
          confirmation prior to initiation.
        </p>
    
        <h3 className="text-xl font-semibold mb-2">Adding Funds Through Ads:</h3>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300">
          We offer an option to earn credits towards your project generations by
          watching short advertisements. Simply navigate to your 'Account' or 'Billing'
          settings, and look for the 'Watch Ads for Credits' option. The value of
          credits earned per ad will be clearly displayed. These credits are
          automatically applied to your account balance and can be used for any
          future project generation.
        </p>
        <p className="text-gray-700 leading-relaxed dark:text-gray-300 mt-2">
          This feature provides a flexible way to fund your projects, especially for
          smaller tasks or when experimenting with new ideas.
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
