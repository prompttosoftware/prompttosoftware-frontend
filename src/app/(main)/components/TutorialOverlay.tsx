'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { tutorialSteps } from '@/lib/tutorialSteps';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { logger } from '@/utils/logger';
import { TUTORIAL_COMPLETED_KEY } from '@/lib/AuthContext';

// A little bit of CSS for our pulsating beacon effect.
// You can also move this to your global CSS file.
const beaconStyles = `
  @keyframes beacon-pulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.5); opacity: 1; }
  }
  .tutorial-beacon {
    animation: beacon-pulse 1.5s infinite ease-in-out;
  }
`;

interface TutorialOverlayProps {
  onComplete: () => void;
}

// A custom hook to get element dimensions and handle window resizing
const useElementRect = (selector: string | null | undefined) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    // Use querySelector instead of getElementById
    const element = document.querySelector(selector);

    if (!element) {
      logger.warn(`Tutorial target element not found for selector: "${selector}"`);
      setRect(null);
      return;
    }

    const updateRect = () => {
      setRect(element.getBoundingClientRect());
    };

    updateRect(); // Initial measurement

    // Observers are great for handling layout shifts after initial render
    const observer = new ResizeObserver(updateRect);
    observer.observe(document.body);

    window.addEventListener('resize', updateRect);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateRect);
    };
  }, [selector]);

  return rect;
};

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  logger.info('Tutorial is showing...');
  
  // Check if tutorial should start
  useEffect(() => {
    const hasCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!hasCompleted) {
      setIsActive(true);
    }
  }, []);
  
  const currentStep = isActive ? tutorialSteps[currentStepIndex] : null;
  const rect = useElementRect(currentStep?.targetSelector);

  // Handle clicks on target elements to advance tutorial
  useEffect(() => {
    if (!currentStep || !currentStep.targetSelector || currentStep.disableBeacon) {
      return;
    }

    const handleTargetClick = (event: Event) => {
      const target = event.target as Element;
      const targetElement = document.querySelector(currentStep.targetSelector!);
      
      if (targetElement && (targetElement === target || targetElement.contains(target))) {
        // Small delay to let the click action complete
        setTimeout(() => {
          handleNext();
        }, 100);
      }
    };

    document.addEventListener('click', handleTargetClick, true);
    return () => document.removeEventListener('click', handleTargetClick, true);
  }, [currentStep, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    setIsActive(false);
    onComplete();
  };
  
  logger.info(`isActive: ${isActive}; currentStep: ${currentStep}; rect: ${rect}`);
  
  if (!isActive || !currentStep) {
    return null;
  }

  // A step is centered if its position is 'center' or if it lacks a target selector.
  const isCenteredStep = currentStep.position === 'center' || !currentStep.targetSelector;
  
  // If a selector is provided but the element isn't found, we skip rendering this step.
  if (currentStep.targetSelector && !rect) {
    logger.error(`Skipping tutorial step "${currentStep.id}" because its target was not found.`);
    // You could automatically advance here, but for now, we'll just show nothing to avoid getting stuck.
    return null;
  }
  
  const isLastStep = currentStepIndex === tutorialSteps.length - 1;

  // Determine if we should show the next button
  const shouldShowNextButton = currentStep.disableBeacon || isCenteredStep;

  // Reusable popover content for both modal and spotlight views
  const PopoverContent = (
    <>
      <button
        onClick={finishTutorial}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700"
        aria-label="Skip tutorial"
      >
        <X size={18} />
      </button>
      <h3 className="mb-2 text-lg font-bold text-gray-800">{currentStep.title}</h3>
      <p className="text-sm text-gray-600">{currentStep.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">
          Step {currentStepIndex + 1} of {tutorialSteps.length}
        </span>
        {shouldShowNextButton && (
          <Button onClick={handleNext}>{isLastStep ? 'Finish' : 'Next'}</Button>
        )}
        {!shouldShowNextButton && (
          <span className="text-xs text-gray-400 italic">
            Click the highlighted element to continue
          </span>
        )}
      </div>
    </>
  );

  // Path 1: Render a centered modal
  if (isCenteredStep) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative w-96 max-w-[calc(100vw-2rem)] rounded-lg bg-white p-6 shadow-2xl">
          {PopoverContent}
        </div>
      </div>
    );
  }

  // Calculate popover position - use default rect if not available
  const targetRect = rect || { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 };
  
  let popoverTop = targetRect.top + targetRect.height + 15; // Default to bottom
  let popoverLeft = targetRect.left + targetRect.width / 2;
  let popoverTransform = 'translateX(-50%)';

  if (currentStep.position === 'top') {
    popoverTop = targetRect.top - 15;
    popoverTransform = 'translate(-50%, -100%)';
  } else if (currentStep.position === 'left') {
    popoverTop = targetRect.top + targetRect.height / 2;
    popoverLeft = targetRect.left - 15;
    popoverTransform = 'translate(-100%, -50%)';
  } else if (currentStep.position === 'right') {
    popoverTop = targetRect.top + targetRect.height / 2;
    popoverLeft = targetRect.left + targetRect.width + 15;
    popoverTransform = 'translateY(-50%)';
  }

  return (
    <>
      <style>{beaconStyles}</style>
      
      {/* The Beacon: a pulsating dot to draw attention */}
      {!currentStep.disableBeacon && rect && (
        <div
          className="tutorial-beacon fixed z-[9999] h-4 w-4 rounded-full bg-blue-500 shadow-lg"
          style={{
            top: rect.top + rect.height / 2 - 8, // Center vertically on the element
            left: rect.left + rect.width / 2 - 8, // Center horizontally
          }}
        />
      )}
      
      {/* The Overlay: creates the spotlight effect */}
      <div
        className="fixed inset-0 z-[9998] transition-all duration-300 ease-in-out"
        style={{
          boxShadow: '0 0 0 5000px rgba(0, 0, 0, 0.6)',
          clipPath: `inset(${targetRect.top - 10}px calc(100% - ${targetRect.right + 10}px) calc(100% - ${targetRect.bottom + 10}px) ${targetRect.left - 10}px round 8px)`,
          pointerEvents: 'none',
        }}
      />
      
      {/* Invisible clickable area over the target element to ensure clicks work */}
      {rect && !currentStep.disableBeacon && (
        <div
          className="fixed z-[9999] cursor-pointer"
          style={{
            top: rect.top - 10,
            left: rect.left - 10,
            width: rect.width + 20,
            height: rect.height + 20,
            pointerEvents: 'auto',
          }}
          onClick={() => {
            // Forward the click to the actual target element
            const targetElement = document.querySelector(currentStep.targetSelector!);
            if (targetElement) {
              (targetElement as HTMLElement).click();
            }
          }}
        />
      )}
      
      {/* The Popover: positioned tutorial content */}
      <div
        className="fixed z-[9999] w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-white p-4 shadow-2xl"
        style={{
          top: `${popoverTop}px`,
          left: `${popoverLeft}px`,
          transform: popoverTransform,
        }}
      >
        {PopoverContent}
      </div>
    </>
  );
};

export default TutorialOverlay;
