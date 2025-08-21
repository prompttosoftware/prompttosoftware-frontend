// src/hooks/usePollForTransaction.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { Transaction } from '@/types/transactions';

interface UsePollForTransactionParams {
  paymentIntentId: string | null;
  onSuccess: () => void;
  onError: (error: Error) => void;
  pollingInterval?: number;
  timeout?: number;
}

export const usePollForTransaction = ({
  paymentIntentId,
  onSuccess,
  onError,
  pollingInterval = 3000, // Poll every 3 seconds
  timeout = 30000, // Timeout after 30 seconds
}: UsePollForTransactionParams) => {
  const queryClient = useQueryClient();
  // Use refs to store interval and timeout IDs to prevent re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to clear any existing timers
    const clearTimers = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    if (!paymentIntentId) {
      clearTimers();
      return;
    }

    logger.info(`Polling started for Payment Intent: ${paymentIntentId}`);

    // Set a timeout for the entire polling operation
    timeoutRef.current = setTimeout(() => {
      logger.warn(`Polling timed out for Payment Intent: ${paymentIntentId}`);
      clearTimers();
      onError(new Error('We received your payment, but there is a delay updating your balance. Please check again in a few minutes.'));
    }, timeout);

    // Start the polling interval
    intervalRef.current = setInterval(async () => {
      try {
        // Use fetchQuery to get fresh data without triggering a global refetch/re-render
        const transactions = await queryClient.fetchQuery<Transaction[]>({
          queryKey: ['userTransactions'],
        });

        const found = transactions.some(
          (tx) => tx.stripeEventId === paymentIntentId
        );

        if (found) {
          logger.info(`Transaction found for Payment Intent: ${paymentIntentId}. Polling successful.`);
          clearTimers();
          onSuccess();
        } else {
          logger.debug(`Transaction not yet found for ${paymentIntentId}, continuing to poll.`);
        }
      } catch (error) {
        logger.error(`Error while fetching transactions during polling for ${paymentIntentId}`, error);
        // Optional: you could decide to stop polling on fetch error
        // clearTimers();
        // onError(new Error('An error occurred while confirming your transaction.'));
      }
    }, pollingInterval);

    // Cleanup function to clear timers when the component unmounts or paymentIntentId changes
    return () => {
      logger.info(`Cleaning up polling timers for ${paymentIntentId}`);
      clearTimers();
    };
  }, [paymentIntentId, onSuccess, onError, queryClient, pollingInterval, timeout]);
};
