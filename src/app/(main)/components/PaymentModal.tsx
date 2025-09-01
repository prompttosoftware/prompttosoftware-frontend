'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Loader2 } from 'lucide-react'; // For a better spinner

import { logger } from '@/lib/logger';
import { StripeWrapper } from '@/components/StripeWrapper';
import { useAuth } from '@/hooks/useAuth';
import { createPaymentIntent } from '@/lib/payments';
import { SavedCardsList } from './SavedCardsList';
import { SavedCardConfirmation } from './SavedCardConfirmation';
import PaymentFormContent from './PaymentFormContent';
import { useTutorialStore } from '@/store/tutorialStore';

export function PaymentModal() {
  // Store state
  const {
    isOpen,
    closePaymentModal: storeCloseModal,
    clientSecret,
    setClientSecret,
    amount,
    setAmount,
    step,
    setStep,
    clearState,
    onClose,
    onSuccess,
  } = usePaymentModalStore();
  
  const isTutorialActive = useTutorialStore((state) => state.isActive);

  // Local state
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [saveCard, setSaveCard] = useState(true);

  const prevIsOpenRef = useRef(isOpen);
  const { isAuthenticated } = useAuth();

  // Modal open/close effects
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      clearState(); // Clear store state on close
      if (onClose) {
        onClose();
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, clearState, onClose]);

  const validateAmount = useCallback((currentAmount: number): boolean => {
    if (currentAmount <= 0) {
      toast.error('Amount is required.');
      return false;
    }
    if (currentAmount < 0.5) {
      toast.error('Minimum amount is $0.50.');
      return false;
    }
    if (currentAmount > 10000) {
      toast.error('Maximum amount is $10,000.00.');
      return false;
    }
    return true;
  }, []);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const cleanedValue = rawValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      const numValue = parseFloat(cleanedValue);
      setAmount(isNaN(numValue) ? 0 : numValue);
    },
    [setAmount],
  );

  const handleInitiatePaymentProcess = useCallback(async () => {
    if (!validateAmount(amount)) {
      return;
    }

    setIsLoadingPaymentIntent(true);

    if (!isAuthenticated) {
      toast.error('Authentication required. Please log in again.');
      setIsLoadingPaymentIntent(false);
      return;
    }

    try {
      const payload = { amount: Math.round(amount * 100), currency: 'usd' };
      const { clientSecret: newClientSecret } = await createPaymentIntent(payload);

      // CRITICAL CHECK: Only proceed if we have a client secret
      if (newClientSecret) {
        setClientSecret(newClientSecret);
        setStep('confirm_card');
      } else {
        // This handles cases where the API returns a 200 OK but no secret
        throw new Error('Failed to retrieve payment details from server.');
      }
    } catch (error) {
      logger.error('Failed to create Payment Intent.', { error });
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : 'An unexpected error occurred. Please try again.';
      toast.error(message || 'Failed to initialize payment.');
      // We DON'T change the step, keeping the user on the amount page.
    } finally {
      setIsLoadingPaymentIntent(false);
    }
  }, [amount, validateAmount, isAuthenticated, setClientSecret, setStep]);

  const resetToAmountStep = useCallback(() => {
    setClientSecret(null);
    setStep('add_amount');
  }, [setClientSecret, setStep]);

  const handlePaymentConfirmed = (intentId: string) => {
    if (onSuccess) {
      onSuccess({ paymentIntentId: intentId, amount: amount });
    }

    // 2. Now, simply close the modal.
    storeCloseModal();
  };

  const renderContent = () => {
    if (step === 'add_amount') {
      return (
        <>
          <div className="grid gap-6 py-4 overflow-y-auto max-h-[60vh] px-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="5.00"
                  value={amount === 0 ? '' : amount.toString()}
                  onChange={handleAmountChange}
                  data-testid="choose-amount-input"
                  className="pl-7 bg-input placeholder:text-muted-foreground text-card-foreground"
                  required
                  maxLength={3}
                />
              </div>
            </div>

            <SavedCardsList
              selectedCardId={selectedCardId}
              onCardSelect={setSelectedCardId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={storeCloseModal} disabled={isLoadingPaymentIntent}>
              Cancel
            </Button>
            <Button onClick={handleInitiatePaymentProcess} disabled={amount <= 0 || isLoadingPaymentIntent} data-testid="payment-next-button">
              {isLoadingPaymentIntent && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (step === 'confirm_card' && clientSecret) {
      return (
        <StripeWrapper>
          {selectedCardId === 'new_card' ? (
            <PaymentFormContent
              clientSecret={clientSecret}
              amount={amount}
              showSaveCardOption={true}
              saveCardForFuture={saveCard}
              setSaveCardForFuture={setSaveCard}
              closeModal={storeCloseModal}
              resetAddFundsStep={resetToAmountStep}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          ) : (
            <SavedCardConfirmation
              selectedCardId={selectedCardId!}
              amount={amount}
              clientSecret={clientSecret}
              onBack={resetToAmountStep}
              onClose={storeCloseModal}
              isLoading={isLoadingPaymentIntent}
              setIsLoading={setIsLoadingPaymentIntent}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          )}
        </StripeWrapper>
      );
    }

    return (
      <div className="py-4 text-center text-destructive">
        An unexpected error occurred. Please close this window and try again.
        <div className="mt-4">
          <Button variant="outline" onClick={resetToAmountStep}>
            Go Back
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={storeCloseModal}
    >
      <DialogContent 
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Add Funds</DialogTitle>
          <DialogDescription>
            {step === 'add_amount'
              ? 'Enter an amount and select your payment method.'
              : 'Confirm your payment details.'}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
