import React, { useCallback } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { getSavedCards } from '@/lib/payments';
import { SavedCard } from '@/types/payments';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { logger } from '@/lib/logger';
import { useBalanceStore } from '@/store/balanceStore';
import { Loader2 } from 'lucide-react';

interface SavedCardConfirmationProps {
  selectedCardId: string;
  amount: number;
  clientSecret: string;
  onBack: () => void;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setSuccessMessageStore: (message: string | null) => void;
  clearStoreState: () => void;
}

export function SavedCardConfirmation({
  selectedCardId,
  amount,
  clientSecret,
  onBack,
  onClose,
  isLoading,
  setIsLoading,
  setSuccessMessageStore,
  clearStoreState,  
}: SavedCardConfirmationProps) {
  const stripe = useStripe();
  const updateBalance = useBalanceStore((state) => state.updateBalance);

  const { data: savedCards } = useQuery<SavedCard[]>({
    queryKey: ['savedCards'],
    queryFn: () => getSavedCards(),
  });

  const selectedCard = savedCards?.find(card => card.id === selectedCardId);

  const handleConfirmWithSavedCard = useCallback(async () => {
    if (!stripe || !clientSecret) {
      logger.error('Stripe.js not loaded or clientSecret missing.');
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selectedCardId,
      });

      if (error) {
        logger.error('Saved card payment confirmation failed:', error);
        onBack(); // Go back to amount step on failure
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Payment confirmed successfully with saved card.');
        updateBalance(amount);
        setSuccessMessageStore(`Successfully added $${amount.toFixed(2)} to your balance!`);
        onClose();
        clearStoreState();
      } else {
        logger.warn(`Payment not successful: status ${paymentIntent?.status}`);
        onBack();
      }
    } catch (err) {
      logger.error('Unexpected error during payment confirmation:', err);
      onBack();
    } finally {
      setIsLoading(false);
    }
  }, [
    stripe,
    clientSecret,
    selectedCardId,
    amount,
    onClose,
    onBack,
    setIsLoading,
    updateBalance,
    setSuccessMessageStore,
    clearStoreState,
  ]);

  if (!selectedCard) {
    return (
      <div className="py-4 text-center text-red-600">
        Error: Selected card could not be found. Please try again.
        <div className="mt-2">
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="mb-6 p-4 border rounded-lg bg-secondary/50">
        <h3 className="font-semibold mb-2">Payment Summary</h3>
        <div className="space-y-1 text-sm text-secondary-foreground">
          <p>
            <span className="font-medium">Amount:</span> ${amount.toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Card:</span>{' '}
            {selectedCard.brand.charAt(0).toUpperCase() + selectedCard.brand.slice(1)} ending in{' '}
            {selectedCard.last4}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleConfirmWithSavedCard} disabled={isLoading || !stripe}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Confirming...' : `Confirm Payment`}
        </Button>
      </DialogFooter>
    </div>
  );
}
