'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { tutorialSteps } from '@/lib/tutorialSteps';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { logger } from '@/utils/logger';
import { TUTORIAL_COMPLETED_KEY } from '@/lib/AuthContext';
import { useTutorialStore } from '@/store/tutorialStore';

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

const useTrackedElement = (selector: string | null | undefined) => {
  const [element, setElement] = useState<Element | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isFinding, setIsFinding] = useState(true);

  // Step 1: Poll to find the element in the DOM.
  useLayoutEffect(() => {
    if (!selector) {
      setIsFinding(false);
      setElement(null);
      return;
    }
    
    setIsFinding(true);
    setElement(null); // Reset element on selector change
    setRect(null); // Reset rect

    let attempts = 0;
    const maxAttempts = 50;
    
    const intervalId = setInterval(() => {
      const foundElement = document.querySelector(selector);
      if (foundElement) {
        clearInterval(intervalId);
        setElement(foundElement); // Element is found, trigger the next effect
      } else {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(intervalId);
          logger.error(`Tutorial target not found after ${maxAttempts} attempts for selector: "${selector}"`);
          setIsFinding(false); // Stop trying
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [selector]);

  // Step 2: Once element is found, scroll to it and wait for it to be visible.
  useLayoutEffect(() => {
    if (!element) return;

    // Use an IntersectionObserver to know when the scroll has finished and the element is in view.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Now that it's visible, get its final position and show the overlay.
        setRect(element.getBoundingClientRect());
        setIsFinding(false);
        observer.disconnect(); // We're done, so clean up.
      }
    });

    observer.observe(element);
    
    // Trigger the scroll
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    return () => observer.disconnect();
  }, [element]);


  // Step 3: Keep the rect updated if the user scrolls or resizes.
  useLayoutEffect(() => {
    if (!element) return;

    const updateRect = () => {
      setRect(element.getBoundingClientRect());
    };
    
    // Initial measurement after it's in view
    updateRect();

    document.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      document.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [element, isFinding]); // Re-attach listeners if element changes or we stop finding

  return { rect, isFinding };
};

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const { isActive, start: startTutorial, end: endTutorial } = useTutorialStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null); // Ref to measure the popover itself

  // Check if tutorial should start
  useEffect(() => {
    const hasCompleted = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
    if (!hasCompleted) {
      startTutorial(); // 3. Set global state to true
    }
  }, [startTutorial]);

  // Ensure state is cleaned up if the component unmounts unexpectedly
  useEffect(() => {
    return () => {
      endTutorial();
    };
  }, [endTutorial]);

  const currentStep = isActive ? tutorialSteps[currentStepIndex] : null;
  const { rect, isFinding } = useTrackedElement(currentStep?.targetSelector);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      finishTutorial();
    }
  };

  const finishTutorial = () => {
    localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
    endTutorial(); // 4. Set global state to false
    onComplete();
  };

  if (!isActive || !currentStep || isFinding) {
    return null;
  }

  // A step is centered if its position is 'center' or if it lacks a target selector.
  const isCenteredStep = currentStep.position === 'center' || !currentStep.targetSelector;
  
  if (currentStep.targetSelector && !rect) {
    logger.warn(`Skipping tutorial step "${currentStep.id}" because its target was not found or is not visible.`);
    return null;
  }

  const isLastStep = currentStepIndex === tutorialSteps.length - 1;
  const shouldShowNextButton = currentStep.disableBeacon || isCenteredStep;

  const PopoverContent = (
    <>
      <button
        onClick={finishTutorial}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-popover-foreground"
        aria-label="Skip tutorial"
      >
        <X size={18} />
      </button>
      <h3 className="mb-2 text-lg font-bold text-popover-foreground">{currentStep.title}</h3>
      <p className="text-sm text-popover-foreground">{currentStep.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-popover-foreground">
          Step {currentStepIndex + 1} of {tutorialSteps.length}
        </span>
        {shouldShowNextButton ? (
          <Button onClick={handleNext}>{isLastStep ? 'Finish' : 'Next'}</Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Click the highlighted element to continue
          </span>
        )}
      </div>
    </>
  );

  if (isCenteredStep) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" >
        <div ref={popoverRef} className="relative w-96 max-w-[calc(100vw-2rem)] rounded-lg bg-popover p-6 shadow-2xl">
          {PopoverContent}
        </div>
      </div>
    );
  }

  const getPopoverPosition = () => {
    if (!rect || !popoverRef.current) return {};

    const popoverRect = popoverRef.current.getBoundingClientRect();
    const { innerWidth: vw, innerHeight: vh } = window;
    const margin = 15;

    let pos = currentStep.position || 'bottom';
    let styles: React.CSSProperties = {};

    // Attempt to position based on the desired 'pos'
    const positions = {
      bottom: {
        top: rect.bottom + margin,
        left: rect.left + rect.width / 2 - popoverRect.width / 2,
      },
      top: {
        top: rect.top - popoverRect.height - margin,
        left: rect.left + rect.width / 2 - popoverRect.width / 2,
      },
      left: {
        top: rect.top + rect.height / 2 - popoverRect.height / 2,
        left: rect.left - popoverRect.width - margin,
      },
      right: {
        top: rect.top + rect.height / 2 - popoverRect.height / 2,
        left: rect.right + margin,
      },
    };

    // Check if the desired position is out of bounds and try to correct it
    if (pos === 'bottom' && positions.bottom.top + popoverRect.height > vh) pos = 'top';
    if (pos === 'top' && positions.top.top < 0) pos = 'bottom';
    if (pos === 'right' && positions.right.left + popoverRect.width > vw) pos = 'left';
    if (pos === 'left' && positions.left.left < 0) pos = 'right';

    styles = positions[pos as keyof typeof positions];
    
    // Final boundary checks for left/right overflow
    let leftValue: number;

    if (typeof styles.left === 'string') {
      leftValue = parseFloat(styles.left);
    } else {
      leftValue = styles.left!;
    }

    if (!isNaN(leftValue)) {
      if (leftValue < margin) {
        styles.left = margin;
      }
      if (leftValue + popoverRect.width > vw - margin) {
        styles.left = vw - popoverRect.width - margin;
      }
    }
    
    return styles;
  };
  
  const popoverStyle = getPopoverPosition();
  const targetRect = rect || { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 };

  return (
    <>
      <style>{beaconStyles}</style>

      <div
        className="fixed inset-0 z-[9998] transition-all duration-300 ease-in-out"
        style={{
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          clipPath: `inset(${targetRect.top - 10}px calc(100% - ${targetRect.right + 10}px) calc(100% - ${targetRect.bottom + 10}px) ${targetRect.left - 10}px round 8px)`,
          pointerEvents: 'none',
        }}
      />

      {!currentStep.disableBeacon && (
        <div
            className="fixed z-[9999] cursor-pointer"
            style={{
                top: targetRect.top - 10,
                left: targetRect.left - 10,
                width: targetRect.width + 20,
                height: targetRect.height + 20,
            }}
            onClick={() => {
                console.log('overlay on click called');
                const targetElement = document.querySelector<HTMLElement>(currentStep.targetSelector!);
                if (targetElement) {
                    // Find the primary interactive element *inside* the target
                    const interactiveChild = targetElement.querySelector<HTMLElement>(
                        'input, button, a, [role="button"]'
                    );

                    if (interactiveChild) {
                        interactiveChild.focus();
                        interactiveChild.click();
                    } else {
                        // Fallback for elements that are clickable containers
                        targetElement.click();
                    }
                }
                setTimeout(handleNext, 50);
            }}
        />
      )}
      
      {!currentStep.disableBeacon && rect && (
        <div
          className="tutorial-beacon fixed z-[9998] h-4 w-4 rounded-full bg-blue-500 shadow-lg pointer-events-none"
          style={{
            top: rect.top + rect.height / 2 - 8,
            left: rect.left + rect.width / 2 - 8,
          }}
        />
      )}
      
      <div
        ref={popoverRef}
        className="fixed z-[9999] w-80 max-w-[calc(100vw-2rem)] rounded-lg bg-popover p-4 shadow-2xl"
        style={{ ...popoverStyle, pointerEvents: 'auto' }}
      >
        {PopoverContent}
      </div>
    </>
  );
};

export default TutorialOverlay;
