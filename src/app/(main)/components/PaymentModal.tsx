'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Added useCallback
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { useSuccessMessageStore } from '@/store/successMessageStore'; // Import success message store
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input'; // Import Input component

import { Label } from '@/components/ui/label';
import PaymentFormContent from './PaymentFormContent'; // Import the new PaymentFormContent
import { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '@/types/payments'; // Import payment types
import { httpClient } from '@/lib/httpClient';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { isAxiosError } from 'axios';

import { logger } from '@/lib/logger';
import { StripeWrapper } from '@/components/StripeWrapper';

export function PaymentModal() {
  // Destructure state and actions from the payment modal store
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
  const onSuccess = usePaymentModalStore((state) => state.onSuccess);
  const onGoToPaymentProvider = usePaymentModalStore((state) => state.onGoToPaymentProvider);
  const setPaymentModalState = usePaymentModalStore((state) => state.setPaymentModalState);

  // Destructure error handling from global error store
  const { setError, clearError } = useGlobalErrorStore();
  // Destructure success message setter from success message store
  const { setMessage: setSuccessMessageStore } = useSuccessMessageStore();

  // Local state for payment method selection (not part of main flow logic managed by store)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  
  const globalError = useGlobalErrorStore((state) => state.error); // Get global error state
  const prevIsOpenRef = React.useRef(isOpen);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // Effect to handle modal open/close and general state resetting
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    const isClosing = wasOpen && !isOpen;

    if (isClosing) { // When modal is closing
      // Clear all states (local and store) to ensure a clean slate for next open
      if (selectedPaymentMethod !== 'card') {
        setSelectedPaymentMethod('card');
      }
      if (isLoadingPaymentIntent !== false) {
        setIsLoadingPaymentIntent(false);
      }
      clearState(); // Clears all Zustand store states
      clearError(); // Clear any global errors
      setSuccessMessageStore(null); // Clear success message
      if (onClose) { // Execute the callback passed via store, if any
        onClose();
      }
    } else { // When modal is opening
      // Determine the initial step based on clientSecret, and update local state accordingly
      // The store's openPaymentModal action already sets the 'step' property based on clientSecret existence
      // So, simply ensure that the amount is also correctly set if transitioning directly to confirm_card
      if (clientSecret && amount === 0) {
        // This scenario should ideally be handled by openPaymentModal setting both clientSecret and amount
        // However, this acts as a safeguard. If clientSecret comes from a redirect with a specific amount,
        // that amount should be set in the store before the modal opens.
        // For testing setup, we'll ensure 'amount' is passed to openPaymentModal
        // in tests that set clientSecret.
        // If we are in confirm_card and amount is 0, it means it was not correctly passed on open.
        // This is a safety catch, though the ideal fix is to ensure the amount is passed when calling openPaymentModal.
        logger.warn('Opened to confirm_card with clientSecret but amount is 0. This might lead to unexpected behavior.');
      }
    }
    // Update ref after checks
    prevIsOpenRef.current = isOpen;
  }, [isOpen, clearState, clearError, setSuccessMessageStore, onClose, clientSecret, amount]);

// Log global errors when they change
useEffect(() => {
  if (globalError) {
    logger.debug('Global error detected in PaymentModal:', globalError);
  }
}, [globalError]);

  const validateAmount = useCallback(
    (amountStr: string): boolean => {
      clearError(); // Clear any previous global errors

      if (!amountStr) {
        setError({ message: 'Amount is required.', type: 'error' });
        return false;
      }

      const amount = parseFloat(amountStr);

      if (isNaN(amount)) {
        setError({ message: 'Amount must be a number.', type: 'error' });
        return false;
      }

      if (amount <= 0) {
        setError({ message: 'Amount must be positive.', type: 'error' });
        return false;
      }
      // Stripe minimum amount is 0.50 USD in most cases. Let's enforce a minimum for now.
      // Assuming currency is USD.
      if (amount < 0.5) {
        setError({ message: 'Minimum amount is $0.50.', type: 'error' });
        return false;
      }

      // Optional: Max amount to prevent abuse or huge transactions
      if (amount > 10000) {
        setError({ message: 'Maximum amount is $10,000.00.', type: 'error' });
        return false;
      }

      return true;
    },
    [clearError, setError],
  );

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value; // Get the raw value from the input
      let cleanedValue = rawValue; // Start with raw value, will be cleaned for `setAmount` indirectly
  
      // Validate the raw input first to catch non-numeric errors before cleaning for display
      if (rawValue && rawValue !== '-') {
        validateAmount(rawValue); // This should set error for 'abc' or '12a'
      } else {
        clearError(); // If input is empty or just '-', clear any existing amount errors
      }
  
      // Now, proceed with cleaning the value for display to the user
      const hasLeadingMinus = cleanedValue.startsWith('-');
      cleanedValue = cleanedValue.replace(/[^0-9.]/g, '');
  
      const parts = cleanedValue.split('.');
      if (parts.length > 2) {
        cleanedValue = `${parts[0]}.${parts[1]}`;
      }
  
      if (hasLeadingMinus && cleanedValue !== '') {
        cleanedValue = '-' + cleanedValue;
      }
      if (e.target.value === '-') { // retain single minus if it's the only char
        cleanedValue = '-';
      }
      
      // Update the amount in the store. Convert to number, or 0 if empty/invalid.
      setAmount(parseFloat(cleanedValue) || 0);
    },
    [validateAmount, clearError, setAmount], // Add setAmount to dependencies
  );

  const handleInitiatePaymentProcess = useCallback(async () => {
    logger.debug(`handleInitiatePaymentProcess called. amount: ${amount}, isLoadingPaymentIntent: ${isLoadingPaymentIntent}`);
    // Validate the amount from the store
    if (!validateAmount(amount.toString())) {
      logger.debug('Amount validation failed.');
      return; // validateAmount already sets the error message
    }
    // Only proceed for card payments for sending intent
    if (selectedPaymentMethod === 'card') {
      setIsLoadingPaymentIntent(true);
      clearError();
  
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError({ message: 'Authentication required. Please log in again.', type: 'error' });
        logger.error('No JWT token found for payment intent creation.');
        setIsLoadingPaymentIntent(false);
        return;
      }
  
      const amountInCents = Math.round(amount * 100);
      const description = 'Funds added to account'; // Default description
  
      logger.info(
        `Attempting to create payment intent for amount: $${amount.toFixed(2)}`,
      );
      try {
        const requestBody: CreatePaymentIntentRequest = {
          amount: amountInCents,
          currency: 'usd',
          description: description,
        };
  
        logger.debug('Sending request to /payments/create-intent with:', requestBody);
        const response = await httpClient.post<
          CreatePaymentIntentRequest,
          CreatePaymentIntentResponse
        >('/payments/create-intent', requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const { clientSecret: newClientSecret } = response;
        setClientSecret(newClientSecret);
        setStep('confirm_card'); // Move to the next step using store's setStep
        logger.info(`Payment Intent created successfully. Received clientSecret.`);
      } catch (error) {
        logger.error('Failed to create Payment Intent.', error);
  
        // Error handling remains similar
        if (isAxiosError(error) && error.response) {
          setError({
            message:
              error.response.data?.message || 'Failed to create intent due to server error',
            type: 'error',
          });
        } else {
          setError({
            message: 'An unexpected error occurred while creating payment intent.',
            type: 'error',
          });
        }
      } finally {
        logger.debug('Finished create payment intent process. Setting isLoadingPaymentIntent to false.');
        setIsLoadingPaymentIntent(false);
      }
    } else if (selectedPaymentMethod === 'paypal') {
      logger.info('Proceeding with PayPal payment (simulated) - PayPal not integrated yet.');
      setError({ message: 'PayPal integration is not yet implemented.', type: 'info' });
      storeCloseModal(); // Use store's closeModal
    }
  }, [
    amount, // Use amount from store
    selectedPaymentMethod,
    validateAmount,
    setClientSecret,
    setStep, // Add setStep to dependencies
    clearError,
    setError,
    storeCloseModal, // Use storeCloseModal in dependencies
    isLoadingPaymentIntent,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={storeCloseModal}> {/* Use storeCloseModal */}
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

        {step === 'confirm_card' && clientSecret && (
          <StripeWrapper>
          <>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-4 mt-4">
              <span className="font-semibold text-lg">Amount to add:</span>
              <span className="font-bold text-xl text-blue-600">${amount.toFixed(2)}</span>
            </div>
            <PaymentFormContent
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              closeModal={storeCloseModal}
              clearStoreState={clearState}
              clearGlobalError={clearError}
              setGlobalError={setError}
              setSuccessMessageStore={setSuccessMessageStore}
              resetAddFundsStep={() => setStep('add_amount')}
              isConfirmingPayment={isConfirmingPayment}
              setIsConfirmingPayment={setIsConfirmingPayment}
            />
          </>
          </StripeWrapper>
        )}

        {step === 'confirm_card' && !clientSecret && (
          <div className="py-4 text-center text-red-600">
            Error: Payment details could not be loaded. Please try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
