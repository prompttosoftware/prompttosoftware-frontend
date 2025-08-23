// src/lib/transactions.ts
import { QueryClient } from '@tanstack/react-query';
import { Transaction } from '@/types/transactions';
import { logger } from '@/lib/logger';
import { api } from './api';

interface PollForTransactionParams {
  paymentIntentId: string;
  queryClient: QueryClient;
  pollingInterval?: number;
  timeout?: number;
}

export const pollForTransactionPromise = ({
  paymentIntentId,
  queryClient,
  pollingInterval = 3000, // 3 seconds
  timeout = 30000, // 30 seconds
}: PollForTransactionParams): Promise<void> => {
  
  // Return a new Promise. This is the key to using it with toast.promise
  return new Promise((resolve, reject) => {
    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    console.log('polling started');
    const clearTimers = () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Set a timeout for the entire operation
    timeoutId = setTimeout(() => {
      clearTimers();
      logger.warn(`Polling timed out for Payment Intent: ${paymentIntentId}`);
      reject(new Error('We received your payment, but there is a delay updating your balance. Please check again in a few minutes.'));
    }, timeout);

    // Start the polling interval
    intervalId = setInterval(async () => {
      console.log('polling interval started');
      try {
        const transactions = await queryClient.fetchQuery<Transaction[]>({
          queryKey: ['userTransactions'],
          queryFn: api.listUserTransactions
        });
        console.log(transactions.length + ' transactions found.');

        const found = transactions.some(
          (tx) => tx.stripeEventId === paymentIntentId
        );

        console.log('Found matching transactions: ' + found);

        if (found) {
          console.log('Found transactions!');
          logger.info(`Transaction found for Payment Intent: ${paymentIntentId}. Resolving promise.`);
          clearTimers();
          resolve(); // The promise succeeds!
        }
        // If not found, the interval will simply run again.
      } catch (error) {
        console.log('Error while polling for transactions. ' + JSON.stringify(error));
        logger.error(`Error fetching transactions during polling for ${paymentIntentId}`, error);
        clearTimers();
        reject(new Error('An error occurred while confirming your transaction.')); // The promise fails.
      }
    }, pollingInterval);
  });
};
