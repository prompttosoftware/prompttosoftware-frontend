export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean; // From existing structure
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Prompt2Code!',
    description: 'This quick tour will show you around.',
    targetSelector: 'body',
    position: 'center',
    disableBeacon: true,
  },
  {
    id: 'add-funds',
    title: 'Add Funds',
    description: 'To generate code, you\'ll need funds. Click the "Add Funds" button to top up your balance.',
    targetSelector: '[data-test-id="add-payment-button"]', // Target the AddPaymentButton component
    position: 'right', // Adjusted position to be more general or suitable for a button
  },
  {
    id: 'watch-ads',
    title: 'Earn Free Funds with Ads',
    description: 'You can also earn free funds by watching short ads. Look for the "Watch Ad" button.',
    targetSelector: '[data-tutorialid="watch-ad-button"]', // Updated to target data-tutorialid
    position: 'bottom',
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
    targetSelector: '[data-tutorialid="explore-controls-container"]',
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
    targetSelector: '[data-tutorialid="projects-page-container"]', // Placeholder - to be refined by Epic_ProjectManagementAndCreation.txt for main projects list container
    position: 'top',
  },
  {
    id: 'create-project',
    title: 'Create a New Project',
    description: 'Ready to bring your ideas to life? Start a new project by clicking here.',
    targetSelector: '[data-testid="new-project-button"]', // Target the New Project link in the SideNavBar
    position: 'right', // Positioning it to the right of the SideNavBar button
  },
  
];
