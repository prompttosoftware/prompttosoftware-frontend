import React, { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { tutorialSteps } from '@/lib/tutorialSteps'; // Import predefined tutorial steps
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook

const TutorialOverlay: React.FC = () => {
  const { showTutorial, setShowTutorial } = useAuth(); // Get showTutorial and setShowTutorial from AuthContext
  const [stepIndex, setStepIndex] = useState(0);

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status, index, type } = data;

      if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        setStepIndex(0); // Reset step index
        setShowTutorial(false); // Hide the tutorial overlay via AuthContext
        localStorage.setItem('prompt2code_tutorial_completed', 'true'); // Set flag in localStorage
      } else if (type === 'step:after') {
        const nextIndex = index + (data.action === 'prev' ? -1 : 1);
        setStepIndex(nextIndex);
      }
    },
    [setShowTutorial],
  );

  if (!showTutorial || tutorialSteps.length === 0) {
    // Use showTutorial from AuthContext
    return null;
  }

  return (
    <Joyride
      steps={tutorialSteps} // Use imported tutorialSteps
      run={showTutorial}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      disableScrollParentFix
      callback={handleJoyrideCallback}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tutorial',
      }}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: '#fff',
          backgroundColor: '#fff',
          primaryColor: '#6366f1', // Tailwind's indigo-500
          textColor: '#1f2937', // Tailwind's gray-800
          overlayColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black overlay
        },
        tooltip: {
          borderRadius: '0.375rem', // rounded-md
          padding: '1.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
        },
        button: {
          borderRadius: '0.25rem', // rounded
          padding: '0.5rem 1rem',
          fontWeight: '600', // font-semibold
        },
        buttonSkip: {
          color: '#6b7280', // Tailwind's gray-500
        },
      }}
    />
  );
};

export default TutorialOverlay;
