export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean; // From existing structure
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PromptToSoftware!',
    description: 'This quick tour will show you around.',
    position: 'center',
    disableBeacon: true,
  },
  {
    id: 'add-funds',
    title: 'Add Funds',
    description: 'To generate code, you\'ll need funds. Click the "Add Funds" button to top up your balance.',
    targetSelector: '[data-test-id="add-payment-button"]', // Target the AddPaymentButton component
    position: 'bottom', // Adjusted position to be more general or suitable for a button
  },
  {
    id: 'explore-projects',
    title: 'Explore Projects Navigation',
    description: 'Click on the "Explore" tab to discover and learn from projects created by others in the community.',
    targetSelector: '#explore-tab', // Assuming an ID for the Explore tab in the SideNavBar
    position: 'right',
  },
  {
    id: 'explore-page',
    title: 'Explore Page Content',
    description: 'Welcome to the Explore page! Here you can browse and learn from various projects. Use the search and sort options to find what you need.',
    position: 'top',
  },
  {
    id: 'my-projects',
    title: 'Your Projects',
    description: 'Manage and view all your generated projects here.',
    targetSelector: '#projects-tab', // Assuming an ID for the Projects tab in the SideNavBar
    position: 'right',
  },
  {
    id: 'projects-page-content',
    title: 'Projects Page',
    description: 'This is your projects dashboard. You can view, manage, and interact with all your past and ongoing projects here.',
    position: 'top',
  },
  {
    id: 'create-project',
    title: 'Create a New Project',
    description: 'Ready to bring your ideas to life? Start a new project by clicking here.',
    targetSelector: '[data-testid="new-project-button"]', // Target the New Project link in the SideNavBar
    position: 'right', // Positioning it to the right of the SideNavBar button
  },
  {
    id: 'completed',
    title: 'Next Steps',
    description: 'You have completed the tutorial. Add funds to your account and create your first project!',
    position: 'center',
    disableBeacon: true,
  },
  
];
