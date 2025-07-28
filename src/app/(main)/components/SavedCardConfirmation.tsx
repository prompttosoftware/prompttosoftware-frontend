import React, { useCallback } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSavedCards } from '@/lib/payments';
import { SavedCard } from '@/types/payments';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface SavedCardConfirmationProps {
  selectedCardId: string;
  amount: number;
  clientSecret: string;
  onBack: () => void;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function SavedCardConfirmation({
  selectedCardId,
  amount,
  clientSecret,
  onBack,
  onClose,
  isLoading,
  setIsLoading
}: SavedCardConfirmationProps) {
  const stripe = useStripe();
  const queryClient = useQueryClient();
  const { setError } = useGlobalErrorStore();

  const { data: savedCards } = useQuery<SavedCard[]>({
    queryKey: ['savedCards'],
    queryFn: () => getSavedCards(),
  });

  const selectedCard = savedCards?.find(card => card.id === selectedCardId);

  const handleConfirmWithSavedCard = useCallback(async () => {
    if (!stripe || !clientSecret) {
      setError({ message: 'Payment processing is not ready.', type: 'error' });
      return;
    }

    setIsLoading(true);
    logger.debug('Confirming payment with saved card:', selectedCardId);

    try {
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: selectedCardId,
      });

      if (error) {
        logger.error('Payment confirmation failed:', error);
        setError({ message: error.message || 'Payment failed.', type: 'error' });
      } else {
        logger.info('Payment confirmed successfully');
        toast.success(`Successfully added $${amount.toFixed(2)} to your balance!`);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        onClose();
      }
    } catch (error) {
      logger.error('Unexpected error during payment confirmation:', error);
      setError({ message: 'An unexpected error occurred during payment.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [stripe, clientSecret, selectedCardId, amount, setError, onClose, queryClient, setIsLoading]);

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
      <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="font-semibold mb-2">Payment Summary</h3>
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Amount:</span> ${amount.toFixed(2)}</p>
          <p><span className="font-medium">Card:</span> {selectedCard.brand.charAt(0).toUpperCase() + selectedCard.brand.slice(1)} ending in {selectedCard.last4}</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleConfirmWithSavedCard} disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Confirming...
            </>
          ) : (
            `Confirm Payment - $${amount.toFixed(2)}`
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}
