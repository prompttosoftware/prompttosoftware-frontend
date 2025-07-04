export const tutorialSteps: any[] = [
  {
    target: 'body',
    content: 'Welcome to Prompt2Code! This quick tour will show you around.',
    disableBeacon: true,
    placement: 'center',
  },
  {
    target: '.profile-button',
    content: 'This is your profile button. Click here to manage your account.',
  },
  {
    target: '.balance-display',
    content: 'Your current balance is shown here. You need balance to generate code.',
  },
  {
    target: '.add-payment-button',
    content: 'Click here to add funds to your account.',
  },
  {
    target: '.side-navbar',
    content: 'This is the main navigation. You can access different features from here.',
  },
  {
    // This target will likely be more specific once the main page component is finalized
    target: 'body',
    content: 'This is where you will input your prompts to generate code. Look for the main input field once the tutorial closes.',
    placement: 'center',
  },
  {
    target: 'body',
    content: 'That\'s it for the quick tour! You can always restart the tutorial from your profile settings.',
    placement: 'center',
  },
];
