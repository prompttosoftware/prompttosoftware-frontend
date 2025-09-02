export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
}

export const tutorialSteps: TutorialStep[] = [
  // --- Section 1: Introduction & Dashboard ---
  {
    id: 'welcome',
    title: 'Welcome to PromptToSoftware!',
    description: 'This quick tour will guide you through the key features to get you started.',
    position: 'center',
    disableBeacon: true,
  },
  {
    id: 'dashboard-overview',
    title: 'Your Dashboard',
    description: 'This is your mission control. At a glance, you can see your account status, monthly spending, and any active projects.',
    targetSelector: '#dashboard-stats-container',
    position: 'top',
    disableBeacon: true
  },

  // --- Section 2: Exploration ---
  {
    id: 'nav-explore',
    title: 'Explore Projects',
    description: 'Let\'s see what others are building. Click "Explore" to browse public projects created by the community.',
    targetSelector: '#nav-link-explore',
    position: 'right',
  },
  {
    id: 'explore-search',
    title: 'Find Projects',
    description: 'On the Explore page, you can use this search bar to find projects by name or technology.',
    targetSelector: '#explore-search-input',
    position: 'bottom',
  },
  {
    id: 'explore-filters',
    title: 'Sort and Filter',
    description: 'Organize projects by most recent, most starred, or oldest to find exactly what you\'re looking for.',
    targetSelector: '#explore-filters-group', // The container for your filter/sort controls
    position: 'bottom',
  },

  // --- Section 3: Project Creation ---
  {
    id: 'nav-new-project',
    title: 'Create a New Project',
    description: 'Now for the exciting part! Let\'s start creating your own project.',
    targetSelector: '#nav-link-new-project', // Your navigation link to the New Project page
    position: 'right',
  },
  {
    id: 'new-project-description',
    title: '1. Describe Your Project',
    description: 'This is the core of your request. Clearly describe the application you want to build. The more detail, the better!',
    targetSelector: '#description',
    position: 'bottom',
  },
  {
    id: 'new-project-cost-estimate',
    title: 'Estimated Cost',
    description: 'Based on your description, we\'ll provide a rough cost estimate. This will update as you add more details.',
    targetSelector: '#cost-estimate-display',
    position: 'top',
    disableBeacon: true
  },
  {
    id: 'new-project-add-repo',
    title: '2. Add Repositories',
    description: 'Click here to create a new GitHub repository for this project, or...',
    targetSelector: '[data-testid="add-new-repo-button"]',
    position: 'bottom',
  },
  {
    id: 'new-project-existing-repo',
    title: '...Use an Existing One',
    description: '...click here to select one of your existing repositories to continue working on.',
    targetSelector: '[data-testid="add-existing-repo-button"]',
    position: 'bottom',
  },
  {
    id: 'new-project-advanced-toggle',
    title: '3. Advanced Options',
    description: 'For more control, click here to reveal advanced settings like AI model selection and tool installations.',
    targetSelector: '#advanced-options-toggle',
    position: 'bottom',
  },
  {
    id: 'new-project-model-section',
    title: 'Customize AI Models',
    description: 'You can choose specific AI models for different tasks to balance cost and performance. You can also add multiple models.',
    targetSelector: '#model-select-card',
    position: 'top',
    disableBeacon: true
  },
  {
    id: 'new-project-tools',
    title: 'Install Specific Tools',
    description: 'If your project needs a specific tool or package, you can ensure it\'s installed here.',
    targetSelector: '[data-testid="add-tools-button"]',
    position: 'bottom',
  },
  {
    id: 'new-project-jira',
    title: 'Link a Jira Project',
    description: 'Optionally, you can link a Jira project to automatically create and track development tasks.',
    targetSelector: '#jira-integration-section', // Target the container for the Jira toggle/options
    position: 'top',
    disableBeacon: true
  },

  // --- Section 5: Completion ---
  {
    id: 'tutorial-finished',
    title: 'You\'re All Set!',
    description: 'You now know your way around. The next step is to add funds and create your first project. Good luck!',
    position: 'center',
    disableBeacon: true,
  },

  // --- Section 4: Billing Flow ---
  {
    id: 'nav-add-payment',
    title: 'Add Funds to Your Account',
    description: 'This is the final step. Projects consume funds to run. Click here to add your first payment.',
    targetSelector: '[data-testid="add-payment-button"]', // This could be in your header or sidebar
    position: 'bottom',
  },
];
