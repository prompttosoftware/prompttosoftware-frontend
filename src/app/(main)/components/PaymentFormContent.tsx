'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBalanceStore } from '@/store/balanceStore';
import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner'; // 1. Import toast from sonner

interface PaymentFormContentProps {
  clientSecret: string;
  amount: number;
  setClientSecret: (secret: string | null) => void;
  closeModal: () => void;
  clearStoreState: () => void;
  resetAddFundsStep: () => void;
  setSuccessMessageStore: (message: string | null) => void;
  showSaveCardOption: boolean;
  saveCardForFuture: boolean;
  setSaveCardForFuture: (value: boolean) => void;
  // 2. Remove global error props
  // clearGlobalError: () => void; 
  // setGlobalError: (error: { message: string; type?: 'error' | 'info' | 'warning' }) => void;
}

const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  clientSecret,
  amount,
  setClientSecret,
  closeModal,
  clearStoreState,
  resetAddFundsStep,
  setSuccessMessageStore,
  showSaveCardOption,
  saveCardForFuture,
  setSaveCardForFuture,
  // 2. Remove from destructuring
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const updateBalance = useBalanceStore((state) => state.updateBalance);

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
      // 3. Replace setGlobalError with toast.error
      toast.error('Stripe.js has not loaded or client secret is missing.');
      logger.error('Stripe.js not loaded or clientSecret missing for confirmation in PaymentFormContent.');
      return;
    }

    setIsProcessing(true);
    // No longer need to clear global error

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        toast.error('Card details not found. Please re-enter.');
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
        logger.error('Payment failed in PaymentFormContent', `Code: ${error.code}, Type: ${error.type}, Message: ${error.message}`);
        toast.error(error.message || 'Payment failed. Please try again.');
        resetAddFundsStep();
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Funds added successfully in PaymentFormContent!');
        
        const addedAmount = amount;
        updateBalance(addedAmount);
        setSuccessMessageStore(`Successfully added $${addedAmount.toFixed(2)} to your balance!`);
        logger.info(`Balance updated in store by: $${addedAmount.toFixed(2)}`);

        if (paymentIntent.amount && Math.round(addedAmount * 100) !== paymentIntent.amount) {
          logger.warn(`Amount mismatch detected! UI Amount: ${addedAmount}, Stripe Amount: ${paymentIntent.amount / 100}`);
        }
        
        resetAddFundsStep();
        closeModal();
        clearStoreState();
      } else {
        logger.warn(`Payment not successful in PaymentFormContent: status ${paymentIntent?.status}`);
        toast.error(`Payment could not be completed. Status: ${paymentIntent?.status}. Please try again.`);
        resetAddFundsStep();
      }
    } catch (error) {
      logger.error('An unexpected error occurred during payment confirmation in PaymentFormContent', error);
      toast.error('An unexpected error occurred during payment. Please try again.');
      resetAddFundsStep();
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
    setSuccessMessageStore,
    updateBalance,
    saveCardForFuture, // Add saveCardForFuture to dependency array
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
