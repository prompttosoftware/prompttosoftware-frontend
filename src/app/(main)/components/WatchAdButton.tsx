'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBalanceStore } from '@/store/balanceStore';
import { useGlobalError } from '@/hooks/useGlobalError';
import { logger } from '@/lib/logger'; // Import the global logger
import { httpClient } from '@/lib/httpClient'; // Import the http client
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AD_DURATION_SECONDS = 10; // Ad playback duration in seconds

const WatchAdButton: React.FC = () => {
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adCountdown, setAdCountdown] = useState(AD_DURATION_SECONDS);
  const [showAdModal, setShowAdModal] = useState(false);

  // Get authentication status from useAuth hook
  const { isAuthenticated } = useAuth();
  // Get updateBalance function from useBalanceStore
  const updateBalance = useBalanceStore((state) => state.updateBalance);
  // Get setError from useGlobalError hook
  const { setError } = useGlobalError();

  // ref for the interval to clear it on unmount or when ad completes
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle ad playback countdown
  useEffect(() => {
    // Function to handle the ad credit API call
    const handleAdCredit = async () => {
      // Get token from localStorage
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError({ message: 'Authentication token not found. Please log in.', type: 'error' });
        logger.warn('Ad credit attempt failed: Authentication token not found.');
        return;
      }
      logger.info('Attempting to credit ad...');
      try {
        const response = await httpClient.post(
          '/ads/credit',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        // Assuming the API returns newBalance and creditedAmount
        const { newBalance, creditedAmount } = response.data;
        updateBalance(newBalance);
        // Display confirmation message (e.g., using a toast or alert)
        alert(`Ad playback complete! You have been credited ${creditedAmount} tokens.`);
        logger.info(
          `Ad credited successfully. Credited amount: ${creditedAmount}, New balance: ${newBalance}`,
        );
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Failed to credit ad. Please try again.';
        console.error('Error crediting ad:', error); // Keep console.error for immediate debug visibility
        setError({ message: errorMessage, type: 'error' });
        logger.error(`Error crediting ad: ${errorMessage}`, error);
      }
    };

    if (isAdPlaying && adCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isAdPlaying && adCountdown === 0) {
      // Ad has finished playing
      setIsAdPlaying(false);
      setShowAdModal(false);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      handleAdCredit(); // Call API to credit the ad
    }

    // Cleanup on unmount or if dependencies change
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isAdPlaying, adCountdown, updateBalance, setError]);

  const handleClick = () => {
    if (!isAuthenticated) {
      setError({ message: 'You must be logged in to watch ads.', type: 'warning' });
      logger.warn('Ad playback initiation failed: User not authenticated.');
      return;
    }

    setIsAdPlaying(true);
    setShowAdModal(true);
    setAdCountdown(AD_DURATION_SECONDS);
    logger.info('Ad playback started.');
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className="
                flex items-center justify-center
                w-10 h-10 md:w-12 md:h-12 rounded-lg
                bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                text-white font-bold
                transition-colors duration-200 ease-in-out
                shadow-md
              "
              aria-label="Watch Ad"
              disabled={isAdPlaying} // Disable button while ad is playing
            >
              AD
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Watch an ad to earn credits for your account balance.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
            <h2 className="text-2xl font-bold mb-4">Ad Playing...</h2>
            <p className="text-lg">Please wait {adCountdown} seconds.</p>
            {/* Visual representation of an ad */}
            <div className="my-4 p-4 bg-gray-200 rounded-md">
              <p className="text-gray-600">Your Ad Content Here</p>
              <p className="text-sm text-gray-500">(Imagine a video playing)</p>
            </div>
            {/* Spinner or progress bar can be added here */}
            {/* For now, just a message */}
            {adCountdown > 0 && <p className="text-sm text-gray-700">Do not close this window.</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default WatchAdButton;
