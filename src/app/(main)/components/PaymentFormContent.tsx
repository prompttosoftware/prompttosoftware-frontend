'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBalanceStore } from '@/store/balanceStore';

import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentFormContentProps {
  clientSecret: string;
  amount: number;
  setClientSecret: (secret: string | null) => void;
  closeModal: () => void; // Still needed for closing the *entire* modal on success
  clearStoreState: () => void;
  resetAddFundsStep: () => void; // New prop to reset the step in PaymentModal
  clearGlobalError: () => void;
  setGlobalError: (error: { message: string; type?: 'error' | 'info' | 'warning' }) => void;
  setSuccessMessageStore: (message: string | null) => void;
  showSaveCardOption: boolean;
  saveCardForFuture: boolean;
  setSaveCardForFuture: (value: boolean) => void;
}

const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  clientSecret,
  amount,
  setClientSecret,
  closeModal,
  clearStoreState,
  resetAddFundsStep,
  clearGlobalError,
  setGlobalError,
  setSuccessMessageStore,
  showSaveCardOption,
  saveCardForFuture,
  setSaveCardForFuture,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const updateBalance = useBalanceStore((state) => state.updateBalance); // Use updateBalance
  
  // Log the state of Stripe, Elements, and Client Secret when component renders or dependencies change
  logger.debug(`PaymentFormContent rendered. clientSecret: ${!!clientSecret}, stripe: ${!!stripe}, elements: ${!!elements}`);

  const [isProcessing, setIsProcessing] = useState(false);
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
      setGlobalError({
        message: 'Stripe.js has not loaded or client secret is missing.',
        type: 'error',
      });
      logger.error(
        'Stripe.js not loaded or clientSecret missing for confirmation in PaymentFormContent.',
      );
      return;
    }

    setIsProcessing(true);
    clearGlobalError();

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setGlobalError({ message: 'Card details not found. Please re-enter.', type: 'error' });
        logger.error('CardElement not found in PaymentFormContent.');
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
        setup_future_usage: saveCardForFuture ? 'off_session' : undefined,
      });

      logger.info('Confirm card payment.', `Intent: ${JSON.stringify(paymentIntent)}`);

      if (error) {
        logger.error(
          'Payment failed in PaymentFormContent',
          `Code: ${error.code}, Type: ${error.type}, Message: ${error.message}`,
        );
        setGlobalError({
          message: error.message || 'Payment failed. Please try again.',
          type: 'error',
        });
        resetAddFundsStep(); // Reset the add funds step on error
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Funds added successfully in PaymentFormContent!');
        
        const addedAmount = amount;
        updateBalance(addedAmount);
        setSuccessMessageStore(`Successfully added $${addedAmount.toFixed(2)} to your balance!`);
        logger.info(`Balance updated in store by: $${addedAmount.toFixed(2)}`);

        if (paymentIntent.amount && Math.round(addedAmount * 100) !== paymentIntent.amount) {
          logger.warn(
            `Amount mismatch detected! UI Amount: ${addedAmount}, Stripe Amount: ${paymentIntent.amount / 100}`,
          );
        }
        
        resetAddFundsStep(); // Reset the add funds step if payment succeeded
        closeModal(); // Still close the modal on successful payment
        clearStoreState(); // Clear all payment modal related state
      } else {
        logger.warn(
          `Payment not successful in PaymentFormContent: status ${paymentIntent?.status}`,
        );
        setGlobalError({
          message: `Payment could not be completed. Status: ${paymentIntent?.status}. Please try again.`,
          type: 'error',
        });
        resetAddFundsStep(); // Reset the add funds step on non-success status
      }
    } catch (error) {
      logger.error(
        'An unexpected error occurred during payment confirmation in PaymentFormContent',
        error,
      );
      setGlobalError({
        message: 'An unexpected error occurred during payment. Please try again.',
        type: 'error',
      });
      resetAddFundsStep(); // Reset the add funds step on error
    } finally {
      setIsProcessing(false);
    }
  }, [
    stripe,
    elements,
    clientSecret,
    closeModal,
    amount,
    clearStoreState,
    resetAddFundsStep,
    clearGlobalError,
    setGlobalError,
    setSuccessMessageStore,
    updateBalance,
  ]);

  return (
    <div className="mt-4 p-3 border rounded-md shadow-sm">
      <Label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
        Credit or debit card
      </Label>
      <div id="card-element">
        <CardElement options={cardElementOptions} onChange={handleCardChange} />
        {cardError && <div className="text-red-500 text-sm mt-2">{cardError}</div>}
      </div>
      {/* --- NEW: "Save Card" Checkbox --- */}
        {showSaveCardOption && (
            <div className="flex items-center space-x-2 my-4">
                <Checkbox
                    id="save-card"
                    checked={saveCardForFuture}
                    onCheckedChange={(checked) => setSaveCardForFuture(Boolean(checked))}
                />
                <label htmlFor="save-card" className="text-sm font-medium leading-none">
                    Save this card for future use
                </label>
            </div>
        )}
      <DialogFooter className="mt-4">
        <Button onClick={closeModal} variant="outline" disabled={isProcessing}>
          Cancel
        </Button>
        <Button
          onClick={handleStripeConfirmation}
          disabled={isProcessing || !stripe || !elements}
          className="relative flex items-center justify-center min-w-[8rem]"
        >
          {isProcessing && (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isProcessing ? 'Confirming...' : 'Confirm Payment'}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default PaymentFormContent;
