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

export function PaymentModal() {
  const { isOpen, closeModal, clientSecret, setClientSecret, clearState } = usePaymentModalStore();
  const { setError, clearError } = useGlobalErrorStore();
  const { setMessage: setSuccessMessageStore } = useSuccessMessageStore();

  // Local states for amount input and step management
  const [inputAmount, setInputAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [currentModalStep, setCurrentModalStep] = useState<'input_amount' | 'confirm_card'>(
    'input_amount',
  );
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  const globalError = useGlobalErrorStore((state) => state.error); // Get global error state

  // Reset local states when modal closes or opens fresh
  useEffect(() => {
    if (!isOpen) {
      setInputAmount('');
      setSelectedPaymentMethod('card');
      setCurrentModalStep('input_amount');
      setIsLoadingPaymentIntent(false);
      clearState(); // Clear the store state
      clearError(); // Clear any global errors
      setSuccessMessageStore(null); // Clear success message on modal close
    } else {
      // If modal just opened and we have a clientSecret from previous attempt, go to confirm_card
      if (clientSecret) {
        setCurrentModalStep('confirm_card');
      } else {
        setCurrentModalStep('input_amount');
      }
    }
  }, [isOpen, clearState, clearError, setSuccessMessageStore, clientSecret]);

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
      let value = e.target.value;

      // Preserve a leading minus sign if present
      const hasLeadingMinus = value.startsWith('-');
      // Remove all characters except digits and decimal points
      value = value.replace(/[^0-9.]/g, '');

      // Ensure only one decimal point
      const parts = value.split('.');
      if (parts.length > 2) {
        value = `${parts[0]}.${parts[1]}`;
      }

      // Re-add the leading minus sign if it was present and the value is not empty
      if (hasLeadingMinus && value !== '') {
        value = '-' + value;
      }
      // Special case: if only '-' is typed, keep it as '-'
      if (e.target.value === '-') {
        value = '-';
      }

      setInputAmount(value); // Set the cleaned value

      // On change, re-validate to clear errors if user fixed input, or show new error
      // Only validate if it's a number, or a negative sign followed by nothing (e.g. '-')
      if (value && value !== '-') {
        validateAmount(value);
      } else {
        clearError(); // If input is empty or just '-', clear any existing amount errors
      }
    },
    [validateAmount, clearError],
  );

  const handleInitiatePaymentProcess = useCallback(async () => {
    logger.debug(`handleInitiatePaymentProcess called. inputAmount: ${inputAmount}, isLoadingPaymentIntent: ${isLoadingPaymentIntent}`);
    if (!validateAmount(inputAmount)) {
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
  
      const amountInCents = Math.round(parseFloat(inputAmount) * 100);
      const description = 'Funds added to account'; // Default description
  
      logger.info(
        `Attempting to create payment intent for amount: $${parseFloat(inputAmount).toFixed(2)}`,
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
        logger.info(`Payment Intent created successfully. Received clientSecret.`);
        setCurrentModalStep('confirm_card'); // Move to the next step
      } catch (error) {
        logger.error('Failed to create Payment Intent.', error);
  
        if (isAxiosError(error) && error.response) {
          setError({
            message:
              error.response.data.message || 'Error creating payment intent. Please try again.',
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
      // For now, close modal for PayPal after message
      closeModal();
    }
  }, [
    inputAmount,
    selectedPaymentMethod,
    validateAmount,
    setClientSecret,
    clearError,
    setError,
    closeModal,
    isLoadingPaymentIntent, // Added to dependency array for logger.debug
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            {currentModalStep === 'input_amount'
              ? 'Enter the amount you wish to add to your account.'
              : 'Confirm your payment details.'}
          </DialogDescription>
        </DialogHeader>

        {currentModalStep === 'input_amount' && (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="text" // Use text to allow partial input like "1." before final validation
                    placeholder="e.g., 50.00"
                    value={inputAmount}
                    onChange={handleAmountChange}
                    className="pl-8" // Add padding for the dollar sign
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label htmlFor="paymentMethod" className="text-right">
                  Method
                </Label>
                <select
                  id="paymentMethod"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as 'card' | 'paypal')}
                  className="col-span-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  <option value="card">Credit Card</option>
                  <option value="paypal" disabled>
                    PayPal (Coming Soon)
                  </option>{' '}
                  {/* PayPal disabled for now */}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeModal} disabled={isLoadingPaymentIntent}>
                Cancel
              </Button>
              <Button
                onClick={handleInitiatePaymentProcess}
                disabled={!inputAmount || isLoadingPaymentIntent}
              >
                {isLoadingPaymentIntent ? 'Processing...' : 'Next'}
              </Button>
            </DialogFooter>
          </>
        )}

        {currentModalStep === 'confirm_card' && clientSecret && (
          <>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-4 mt-4">
              <span className="font-semibold text-lg">Amount to add:</span>
              <span className="font-bold text-xl text-blue-600">
                ${parseFloat(inputAmount).toFixed(2)}
              </span>
            </div>
            <PaymentFormContent
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              closeModal={closeModal}
              clearStoreState={clearState}
              clearGlobalError={clearError}
              setGlobalError={setError}
              setSuccessMessageStore={setSuccessMessageStore}
            />
          </>
        )}
        {/* If clientSecret is null but step is confirm_card, something went wrong. */}
        {currentModalStep === 'confirm_card' && !clientSecret && (
          <div className="py-4 text-center text-red-600">
            Error: Payment details could not be loaded. Please try again.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
