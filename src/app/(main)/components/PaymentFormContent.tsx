'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBalanceStore } from '@/store/balanceStore';

import { Label } from '@/components/ui/label';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { logger } from '@/lib/logger';


// New component to encapsulate Stripe-related logic
interface PaymentFormContentProps {
  clientSecret: string | null;
  setClientSecret: (secret: string | null) => void;
  closeModal: () => void;
  clearStoreState: () => void;
  clearGlobalError: () => void;
  setGlobalError: (error: { message: string; type: 'error' | 'success' | 'info' }) => void;
  setSuccessMessageStore: (message: string | null) => void;
  // Amount and description are no longer passed down here, as they are used by the parent for payment intent creation
  // and displayed there.
}

const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  clientSecret,
  setClientSecret,
  closeModal,
  clearStoreState,
  clearGlobalError,
  setGlobalError,
  setSuccessMessageStore,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const updateBalance = useBalanceStore((state) => state.updateBalance); // Use updateBalance

  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: 'Arial, sans-serif',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
      hidePostalCode: true,
    }),
    [],
  );

  const handleCardChange = useCallback((event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  }, []);

  const handleStripeConfirmation = useCallback(async () => {
    if (!stripe || !elements || !clientSecret) {
      setGlobalError({ message: 'Stripe.js has not loaded or client secret is missing.', type: 'error' });
      logger.error('Stripe.js not loaded or clientSecret missing for confirmation in PaymentFormContent.');
      return;
    }

    setIsLoading(true);
    clearGlobalError();

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setGlobalError({ message: 'Card details not found. Please re-enter.', type: 'error' });
        logger.error('CardElement not found in PaymentFormContent.');
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        logger.error(
          'Payment failed in PaymentFormContent',
          `Code: ${error.code}, Type: ${error.type}, Message: ${error.message}`
        );
        setGlobalError({ message: error.message || 'Payment failed. Please try again.', type: 'error' });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Funds added successfully in PaymentFormContent!');
        // Assuming the amount is available from `inputAmount` which is a prop in `PaymentModal` or derived from `clientSecret`
        // For now, we'll assume a fixed amount or fetch it from paymentIntent metadata if available.
        // A more robust solution might pass the original amount from PaymentModal to PaymentFormContent.
        // For this task, let's assume paymentIntent.amount is reliable (it's in cents).
        if (paymentIntent.amount) {
          const addedAmount = paymentIntent.amount / 100; // Convert cents to dollars
          updateBalance(addedAmount);
          setSuccessMessageStore(`Successfully added $${addedAmount.toFixed(2)} to your balance!`);
          logger.info(`Balance updated in store by: $${addedAmount.toFixed(2)}`);
        } else {
          setSuccessMessageStore('Funds added successfully!');
          logger.warn('PaymentIntent amount not found. Balance may not be updated correctly.');
        }

        closeModal();
        clearStoreState();
      } else {
        logger.warn(`Payment not successful in PaymentFormContent: status ${paymentIntent?.status}`);
        setGlobalError({
          message: `Payment could not be completed. Status: ${paymentIntent?.status}. Please try again.`,
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('An unexpected error occurred during payment confirmation in PaymentFormContent', error);
      setGlobalError({
        message: 'An unexpected error occurred during payment. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [stripe, elements, clientSecret, closeModal, clearStoreState, clearGlobalError, setGlobalError, setSuccessMessageStore, updateBalance]);

  return (
    <div className="mt-4 p-3 border rounded-md shadow-sm">
      <Label
        htmlFor="card-element"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Credit or debit card
      </Label>
      <div id="card-element">
        <CardElement options={cardElementOptions} onChange={handleCardChange} />
        {cardError && <div className="text-red-500 text-sm mt-2">{cardError}</div>}
      </div>
      <DialogFooter className="mt-4"> {/* Footer added back but with margin-top */}
        <Button
          onClick={closeModal}
          variant="outline"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleStripeConfirmation}
          disabled={isLoading || !clientSecret || !stripe || !elements}
        >
          {isLoading ? 'Confirming...' : 'Confirm Payment'}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default PaymentFormContent;
