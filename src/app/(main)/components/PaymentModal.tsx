'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
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
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { isAxiosError } from 'axios';

import { logger } from '@/lib/logger';
import { StripeWrapper } from '@/components/StripeWrapper';
import { useAuth } from '@/hooks/useAuth';
import { createPaymentIntent, getSavedCards } from '@/lib/payments';
import { useStripe } from '@stripe/react-stripe-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SavedCard } from '@/types/payments';
import { FaCcMastercard, FaCcVisa, FaPlusCircle, FaRegCreditCard } from 'react-icons/fa';
import { toast } from 'sonner';

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

  // Destructure error handling from global error store
  const { setError, clearError } = useGlobalErrorStore();
  // Destructure success message setter from success message store
  const { setMessage: setSuccessMessageStore } = useSuccessMessageStore();

  // Local state for payment method selection (not part of main flow logic managed by store)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  
  const globalError = useGlobalErrorStore((state) => state.error); // Get global error state
  const prevIsOpenRef = React.useRef(isOpen);
  const { isAuthenticated } = useAuth();

  const stripe = useStripe(); // Get stripe instance for confirming saved card payments
  const queryClient = useQueryClient();

  // --- NEW: State for managing card selection and saving ---
  const [selectedCardId, setSelectedCardId] = useState<string>('new_card');
  const [saveCard, setSaveCard] = useState(true);

  // --- NEW: Fetch saved cards when the modal is open ---
  const { data: savedCards, isLoading: isLoadingCards } = useQuery<SavedCard[]>({
    queryKey: ['savedCards'],
    queryFn: () => getSavedCards(),
    enabled: isOpen, // Only fetch when the modal is open
  });

  // Effect to set the default selected card once cards are loaded
  useEffect(() => {
    if (savedCards && savedCards.length > 0) {
      const defaultCard = savedCards.find((c) => c.isDefault) || savedCards[0];
      setSelectedCardId(defaultCard.id);
    } else {
      setSelectedCardId('new_card');
    }
  }, [savedCards]);
  
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

  // --- UPDATED: Confirmation flow for saved cards ---
  const handleConfirmWithSavedCard = useCallback(async () => {
    if (!stripe || !clientSecret) {
        setError({ message: 'Payment processing is not ready.', type: 'error' });
        return;
    }
    setIsLoadingPaymentIntent(true);
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: selectedCardId,
    });

    if (error) {
      setError({ message: error.message || 'Payment failed.', type: 'error' });
      resetToAmountStep();
    } else {
      toast.success(`Successfully added $${amount.toFixed(2)} to your balance!`);
      // Update balance, close modal, etc.
      queryClient.invalidateQueries({ queryKey: ['user'] }); // To refresh balance
      storeCloseModal();
    }
    setIsLoadingPaymentIntent(false);
  }, [stripe, clientSecret, selectedCardId, amount, setError, storeCloseModal, queryClient]);

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
  
      if (!isAuthenticated) {
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
        const payload = { amount: Math.round(amount * 100), currency: 'usd' };
        const { clientSecret: newClientSecret } = await createPaymentIntent(payload);
        setClientSecret(newClientSecret);
        setStep('confirm_card'); // Always go to confirmation step
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

  const resetToAmountStep = useCallback(() => {
    setClientSecret(null); // Explicitly clear the secret
    setStep('add_amount');   // Go back to the first step
  }, [setClientSecret, setStep]);

  const getCardIcon = (brand: string): React.ReactElement => {
          switch (brand.toLowerCase()) {
        case 'visa':
          return <FaCcVisa className="text-blue-600 w-8 h-8" />;
        case 'mastercard':
          return <FaCcMastercard className="text-orange-500 w-8 h-8" />;
        default:
          return <FaRegCreditCard className="text-gray-500 w-8 h-8" />;
      }
    };

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

            {/* --- Scrollable Card Selection UI --- */}
            <div className="grid gap-2 py-4">
              <Label className="text-gray-700">Payment Method</Label>

              {/* scrollable container */}
              <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                {isLoadingCards && <p className="text-sm text-gray-500">Loading cards…</p>}

                {savedCards?.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition
                                ${selectedCardId === card.id
                                  ? 'border-blue-500 ring-2 ring-blue-500'
                                  : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <div className="flex items-center gap-4">
                      {getCardIcon(card.brand)}
                      <span>
                        {card.brand} ending in {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                <div
                  onClick={() => setSelectedCardId('new_card')}
                  className={`flex items-center p-3 border rounded-md cursor-pointer transition
                              ${selectedCardId === 'new_card'
                                ? 'border-blue-500 ring-2 ring-blue-500'
                                : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <div className="flex items-center gap-4">
                    <FaPlusCircle className="text-gray-500 w-6 h-6" />
                    <span>Add a new card</span>
                  </div>
                </div>
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
          {/* --- NEW: Conditional Rendering for Confirmation --- */}
            {selectedCardId === 'new_card' ? (
              <PaymentFormContent
                clientSecret={clientSecret}
                amount={amount}
                showSaveCardOption={true} // Tell the form to show the checkbox
                saveCardForFuture={saveCard}
                setSaveCardForFuture={setSaveCard}
                setClientSecret={setClientSecret}
                closeModal={storeCloseModal}
                clearStoreState={clearState}
                clearGlobalError={clearError}
                setGlobalError={setError}
                setSuccessMessageStore={setSuccessMessageStore}
                resetAddFundsStep={resetToAmountStep}
              />
            ) : (
              <DialogFooter>
                <Button variant="outline" onClick={resetToAmountStep} disabled={isLoadingPaymentIntent}>Back</Button>
                <Button onClick={handleConfirmWithSavedCard} disabled={isLoadingPaymentIntent}>
                  {isLoadingPaymentIntent ? 'Confirming...' : `Confirm Payment with Visa ${savedCards?.find(c => c.id === selectedCardId)?.last4}`}
                </Button>
              </DialogFooter>
            )}
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
