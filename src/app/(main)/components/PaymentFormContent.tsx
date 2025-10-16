'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { usePostHog } from 'posthog-js/react';

interface PaymentFormContentProps {
  clientSecret: string;
  amount: number;
  closeModal: () => void;
  resetAddFundsStep: () => void;
  showSaveCardOption: boolean;
  saveCardForFuture: boolean;
  setSaveCardForFuture: (value: boolean) => void;
  onPaymentConfirmed: (paymentIntentId: string) => void;
}

const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  clientSecret,
  amount,
  closeModal,
  resetAddFundsStep,
  showSaveCardOption,
  saveCardForFuture,
  setSaveCardForFuture,
  onPaymentConfirmed
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const posthog = usePostHog();

  logger.debug(`PaymentFormContent rendered. clientSecret: ${!!clientSecret}, stripe: ${!!stripe}, elements: ${!!elements}`);

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const cardElementOptions = useMemo(
    () => ({
      style: {
        base: {
          fontSize: '16px',
          color: 'var(--popover-foreground)',
          fontFamily: 'Arial, sans-serif',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: 'var(--popover-foreground)',
          iconColor: 'var(--popover-foreground)',
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
        logger.info('Payment confirmed on client. Handing off to parent for polling.');

        posthog?.capture('funds_added', {
          amount: amount, // The amount in cents or dollars, be consistent
          currency: 'usd', // Or whatever your currency is
          save_card_selected: saveCardForFuture,
        });

        onPaymentConfirmed(paymentIntent.id);
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
    amount,
    posthog,
    resetAddFundsStep,
    saveCardForFuture,
    onPaymentConfirmed
  ]);

  return (
    <div className="mt-4 p-3 border rounded-md shadow-sm">
      <Label htmlFor="card-element" className="block text-sm font-medium text-popover-foreground mb-2">
        Credit or debit card
      </Label>
      <div id="card-element">
        <CardElement options={cardElementOptions} onChange={handleCardChange} id="stripe-card-element-form" />
        {cardError && <div className="text-destructive text-sm mt-2">{cardError}</div>}
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
          data-testid="confirm-payment-button"
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
