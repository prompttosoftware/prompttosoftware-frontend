'use client';

import React, { useState, useEffect } from 'react';
import { tutorialSteps, TutorialStep } from '@/lib/tutorialSteps';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { usePaymentModalStore } from '@/store/paymentModalStore';

interface TutorialOverlayProps {
  onTutorialComplete: () => void;
}

const TUTORIAL_COMPLETED_KEY = 'prompt2code_tutorial_completed';

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onTutorialComplete }) => {
  const { openModal: openPaymentModal } = usePaymentModalStore(); // Destructure openModal as openPaymentModal
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [showGitHubPrompt, setShowGitHubPrompt] = useState(false);
  const [showGitHubInfo, setShowGitHubInfo] = useState(false);
  const [showTutorialComplete, setShowTutorialComplete] = useState(false);

  useEffect(() => {
    // Check if tutorial has been completed before
    const tutorialCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!tutorialCompleted) {
      setIsTutorialActive(true);
    }
  }, []);

  const currentStep = tutorialSteps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // End of regular tutorial steps, show GitHub prompt
      setShowGitHubPrompt(true);
    }
  };

  const handleGitHubFamiliarity = (familiar: boolean) => {
    setShowGitHubPrompt(false);
    if (familiar) {
      setShowGitHubInfo(true);
    } else {
      // If not familiar, skip GitHub info and go straight to tutorial complete
      setShowTutorialComplete(true);
    }
  };

  const handleGitHubInfoClose = () => {
    setShowGitHubInfo(false);
    setShowTutorialComplete(true);
  };

  const handleAddFundsClick = () => {
    openPaymentModal();
    completeTutorial(); // Keep this to mark tutorial as complete after opening payment modal
  };

  const completeTutorial = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setIsTutorialActive(false);
    setShowTutorialComplete(false);
    onTutorialComplete();
  };

  if (!isTutorialActive) {
    return null;
  }

  if (showTutorialComplete) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutorial Complete!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Now you're ready to add funds to start your projects!
          </DialogDescription>
          <DialogFooter>
            <Button onClick={handleAddFundsClick}>Add funds</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (showGitHubInfo) {
    // Reusing content/components from Help page's GitHub section - Placeholder for now
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GitHub Information</DialogTitle>
            <DialogDescription>
              <p className="text-gray-700">
                Prompt2Code integrates seamlessly with GitHub. Here’s why that’s great:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2">
                <li><strong>Version Control:</strong> Keep track of every change to your code.</li>
                <li><strong>Collaboration:</strong> Work easily with others on projects.</li>
                <li><strong>Showcase:</strong> Share your generated projects with the world.</li>
                <li><strong>Deployment:</strong> Deploy your applications directly from GitHub.</li>
              </ul>
              <p className="mt-4 text-gray-700">
                Learn more about GitHub <a href="https://github.com/features" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">here</a>.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGitHubInfoClose}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (showGitHubPrompt) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Question</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you familiar with GitHub?
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => handleGitHubFamiliarity(true)}>Yes</Button>
            <Button onClick={() => handleGitHubFamiliarity(false)} variant="secondary">No</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular tutorial step display (simplified - will need actual UI to target elements)
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{currentStep?.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {currentStep?.description}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={handleNextStep}>Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialOverlay;
