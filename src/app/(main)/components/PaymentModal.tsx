'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
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
import PaymentFormContent from './PaymentFormContent';
import { isAxiosError } from 'axios';
import { logger } from '@/lib/logger';
import { StripeWrapper } from '@/components/StripeWrapper';
import { useAuth } from '@/hooks/useAuth';
import { createPaymentIntent } from '@/lib/payments';
import { SavedCardsList } from './SavedCardsList';
import { SavedCardConfirmation } from './SavedCardConfirmation';
import { toast } from 'sonner'; // 1. Import sonner toast

export function PaymentModal() {
  // Store state
  const isOpen = usePaymentModalStore((state) => state.isOpen);
  const storeCloseModal = usePaymentModalStore((state) => state.closePaymentModal);
  const clientSecret = usePaymentModalStore((state) => state.clientSecret);
  const setClientSecret = usePaymentModalStore((state) => state.setClientSecret);
  const amount = usePaymentModalStore((state) => state.amount);
  const setAmount = usePaymentModalStore((state) => state.setAmount);
  const step = usePaymentModalStore((state) => state.step);
  const setStep = usePaymentModalStore((state) => state.setStep);
  const clearState = usePaymentModalStore((state) => state.clearState);
  const onClose = usePaymentModalStore((state) => state.onClose);

  // Success message store
  const { setMessage: setSuccessMessageStore } = useSuccessMessageStore();


  // Local state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('new_card');
  const [saveCard, setSaveCard] = useState(true);

  const prevIsOpenRef = React.useRef(isOpen);
  const { isAuthenticated } = useAuth();

  // Modal open/close effects
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isClosing = wasOpen && !isOpen;

    if (isClosing) {
      setSelectedPaymentMethod('card');
      setIsLoadingPaymentIntent(false);
      clearState();
      setSuccessMessageStore(null);
      if (onClose) {
        onClose();
      }
    }

    prevIsOpenRef.current = isOpen;
  }, [isOpen, clearState, setSuccessMessageStore, onClose]);

  // Amount validation (now uses toasts)
  const validateAmount = useCallback((amountStr: string): boolean => {
    if (!amountStr || parseFloat(amountStr) === 0) {
      toast.error('Amount is required.');
      return false;
    }

    const amountNum = parseFloat(amountStr);

    if (isNaN(amountNum)) {
      toast.error('Amount must be a number.');
      return false;
    }
    if (amountNum <= 0) {
      toast.error('Amount must be positive.');
      return false;
    }
    if (amountNum < 0.5) {
      toast.error('Minimum amount is $0.50.');
      return false;
    }
    if (amountNum > 10000) {
      toast.error('Maximum amount is $10,000.00.');
      return false;
    }
    return true;
  }, []);

  // Simplified amount change handler
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Allow only numbers and a single decimal point
      const cleanedValue = rawValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
      setAmount(parseFloat(cleanedValue) || 0);
    },
    [setAmount],
  );

  const handleInitiatePaymentProcess = useCallback(async () => {
    logger.debug(`handleInitiatePaymentProcess called. amount: ${amount}, selectedCardId: ${selectedCardId}`);
    
    // 2. Add validation for payment method selection
    if (!selectedCardId) {
      toast.error('Please select a payment method.');
      return;
    }

    if (!validateAmount(amount.toString())) {
      logger.debug('Amount validation failed.');
      return; // The toast is shown inside validateAmount
    }

    if (selectedPaymentMethod === 'card') {
      setIsLoadingPaymentIntent(true);

      if (!isAuthenticated) {
        toast.error('Authentication required. Please log in again.');
        logger.error('No JWT token found for payment intent creation.');
        setIsLoadingPaymentIntent(false);
        return;
      }

      logger.info(`Attempting to create payment intent for amount: $${amount.toFixed(2)}`);
      
      try {
        const payload = { amount: Math.round(amount * 100), currency: 'usd' };
        const { clientSecret: newClientSecret } = await createPaymentIntent(payload);
        setClientSecret(newClientSecret);
        setStep('confirm_card');
      } catch (error) {
        logger.error('Failed to create Payment Intent.', error);

        if (isAxiosError(error) && error.response) {
          toast.error(error.response.data?.message || 'Failed to create intent due to server error');
        } else {
          toast.error('An unexpected error occurred while creating payment intent.');
        }
      } finally {
        setIsLoadingPaymentIntent(false);
      }
    } else if (selectedPaymentMethod === 'paypal') {
      toast.info('PayPal integration is not yet implemented.');
    }
  }, [
    amount,
    selectedCardId,
    selectedPaymentMethod,
    validateAmount,
    setClientSecret,
    setStep,
    isAuthenticated,
  ]);

  const resetToAmountStep = useCallback(() => {
    setClientSecret(null);
    setStep('add_amount');
  }, [setClientSecret, setStep]);

  const handleCardSelection = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    logger.debug(`Card selected: ${cardId}`);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={storeCloseModal}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 text-gray-900 backdrop-blur-md rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Add Funds</DialogTitle>
          <DialogDescription className="text-sm text-gray-700">
            {step === 'add_amount'
              ? 'Enter the amount you wish to add to your account.'
              : 'Confirm your payment details.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'add_amount' && (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-gray-700">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g., 50.00"
                    value={amount === 0 ? '' : amount.toString()}
                    onChange={handleAmountChange}
                    className="pl-8 border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="paymentMethod" className="text-right text-gray-700">
                  Method
                </Label>
                <select
                  id="paymentMethod"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as 'card' | 'paypal')}
                  className="col-span-3 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm p-2 bg-white"
                >
                  <option value="card">Credit Card</option>
                  <option value="paypal" disabled>
                    PayPal (Coming Soon)
                  </option>
                </select>
              </div>
            </div>

            <SavedCardsList
              selectedCardId={selectedCardId}
              onCardSelect={handleCardSelection}
            />

            <DialogFooter>
              <Button variant="outline" onClick={storeCloseModal} disabled={isLoadingPaymentIntent}>
                Cancel
              </Button>
              <Button
                onClick={handleInitiatePaymentProcess}
                disabled={amount === 0 || isLoadingPaymentIntent}
              >
                {isLoadingPaymentIntent && (
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {isLoadingPaymentIntent ? 'Processing...' : 'Next'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm_card' && !isLoadingPaymentIntent && (
          <StripeWrapper>
            {clientSecret ? (
              selectedCardId === 'new_card' ? (
                <PaymentFormContent
                  clientSecret={clientSecret}
                  amount={amount}
                  showSaveCardOption={true}
                  saveCardForFuture={saveCard}
                  setSaveCardForFuture={setSaveCard}
                  setClientSecret={setClientSecret}
                  closeModal={storeCloseModal}
                  clearStoreState={clearState}
                  // 3. Remove props related to global error.
                  // Your PaymentFormContent should be updated to import and use `toast` directly
                  // for its own error handling, instead of relying on these props.
                  setSuccessMessageStore={setSuccessMessageStore}
                  resetAddFundsStep={resetToAmountStep}
                />
              ) : (
                <SavedCardConfirmation
                  selectedCardId={selectedCardId}
                  amount={amount}
                  clientSecret={clientSecret}
                  onBack={resetToAmountStep}
                  onClose={storeCloseModal}
                  isLoading={isLoadingPaymentIntent}
                  setIsLoading={setIsLoadingPaymentIntent}
                />
              )
            ) : (
              <div className="py-4 text-center text-red-600">
                Error: Payment details could not be loaded. Please try again.
                <div className="mt-2">
                  <Button variant="outline" onClick={resetToAmountStep}>
                    Go Back
                  </Button>
                </div>
              </div>
            )}
          </StripeWrapper>
        )}
      </DialogContent>
    </Dialog>
  );
}
