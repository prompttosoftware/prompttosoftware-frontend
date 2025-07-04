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
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useBalanceStore } from '@/store/balanceStore'; // Import the balance store

import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/api';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { isAxiosError } from 'axios';
import { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '@/types/payments';
import { logger } from '@/lib/logger';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

type PaymentStep = 'initial' | 'cardConfirmation';

// New component to encapsulate Stripe-related logic
interface PaymentFormContentProps {
  amount: string | null;
  description: string | null;
  clientSecret: string | null;
  setClientSecret: (secret: string | null) => void;
  closeModal: () => void;
  clearStoreState: () => void; // Renamed to avoid confusion with internal state
  clearGlobalError: () => void;
  setGlobalError: (error: { message: string; type: 'error' | 'success' | 'info' }) => void;
  setSuccessMessageStore: (message: string | null) => void; // Add setSuccessMessageStore prop
}

const PaymentFormContent: React.FC<PaymentFormContentProps> = ({
  amount,
  description,
  clientSecret,
  setClientSecret,
  closeModal,
  clearStoreState,
  clearGlobalError,
  setGlobalError,
  setSuccessMessageStore, // Add setSuccessMessageStore to destructuring
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
const setBalance = useBalanceStore((state) => state.setBalance); // Get the setBalance action

  const [currentStep, setCurrentStep] = useState<PaymentStep>('initial');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  // Effect to manage step based on clientSecret when component mounts/updates
  useEffect(() => {
    if (clientSecret) {
      setCurrentStep('cardConfirmation');
    } else {
      setCurrentStep('initial');
    }
  }, [clientSecret]);

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

  const handleInitiatePaymentProcess = useCallback(async () => {
    if (selectedPaymentMethod === 'card') {
      if (!stripe || !elements) {
        logger.error('Stripe.js has not loaded yet in PaymentFormContent.');
        setGlobalError({ message: 'Stripe.js is not loaded. Please try again.', type: 'error' });
        return;
      }

      setIsLoading(true);
      clearGlobalError();

      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setGlobalError({ message: 'Authentication required. Please log in again.', type: 'error' });
        logger.error('No JWT token found for payment intent creation in PaymentFormContent.');
        setIsLoading(false);
        return;
      }

      if (!amount) {
        setGlobalError({ message: 'Payment amount is missing.', type: 'error' });
        logger.error('Payment amount is missing in PaymentFormContent.');
        setIsLoading(false);
        return;
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);

      if (amountInCents <= 0) {
        setGlobalError({ message: 'Payment amount must be greater than zero.', type: 'error' });
        logger.error('Attempted to create payment intent with non-positive amount in PaymentFormContent.');
        setIsLoading(false);
        return;
      }

      try {
        const requestBody: CreatePaymentIntentRequest = {
          amount: amountInCents,
          currency: 'usd',
          description: description || 'Funds added to account',
        };

        const response = await axiosInstance.post<
          CreatePaymentIntentRequest,
          CreatePaymentIntentResponse
        >('/payments/create-intent', requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { clientSecret: newClientSecret, paymentIntentId } = response;
        setClientSecret(newClientSecret);
        logger.info(`Payment Intent created successfully in PaymentFormContent: ${paymentIntentId}`);
        setCurrentStep('cardConfirmation');
      } catch (error) {
        logger.error('Failed to create Payment Intent in PaymentFormContent.', error);

        if (isAxiosError(error) && error.response) {
          setGlobalError({
            message:
              error.response.data.message || 'Error creating payment intent. Please try again.',
            type: 'error',
          });
        } else {
          setGlobalError({
            message: 'An unexpected error occurred while creating payment intent.',
            type: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    } else if (selectedPaymentMethod === 'paypal') {
      logger.info('Proceeding with PayPal payment (simulated) in PaymentFormContent');
      setGlobalError({ message: 'PayPal integration is not yet implemented.', type: 'info' });
      closeModal();
    }
  }, [amount, description, selectedPaymentMethod, stripe, elements, setClientSecret, closeModal, clearGlobalError, setGlobalError]); // Dependencies for useCallback

  const handleStripeConfirmation = useCallback(async () => {
    if (!stripe || !elements || !clientSecret) {
      setGlobalError({ message: 'Stripe.js has not loaded or client secret is missing.', type: 'error' });
      logger.error('Stripe.js not loaded or clientSecret missing for confirmation in PaymentFormContent.');
      return;
    }

    setIsLoading(true);
    clearGlobalError();

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setGlobalError({ message: 'Card details not found. Please re-enter.', type: 'error' });
        logger.error('CardElement not found in PaymentFormContent.');
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        logger.error('Payment failed in PaymentFormContent', error);
        setGlobalError({ message: error.message || 'Payment failed. Please try again.', type: 'error' });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Funds added successfully in PaymentFormContent!');
        setSuccessMessageStore('Funds added successfully!'); // Use dedicated success message store
        // Fetch updated user data after successful payment
        try {
          const token = localStorage.getItem('jwtToken');
          if (!token) {
            logger.error('No JWT token found for fetching user data after payment.');
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }); // Fallback to invalidation if no token
          } else {
            const userResponse = await axiosInstance.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (userResponse.data && typeof userResponse.data.balance === 'number') {
              setBalance(userResponse.data.balance);
              logger.info(`Balance updated in store to: ${userResponse.data.balance}`);
            } else {
              logger.warn('User data or balance not found in /auth/me response after payment. Invalidating query instead.');
              queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }); // Fallback to invalidation
            }
          }
        } catch (fetchError) {
          logger.error('Failed to fetch updated user data after payment in PaymentFormContent. Invalidating query instead.', fetchError);
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }); // Fallback to invalidation
        }
        closeModal();
        clearStoreState(); // Clear modal state on success
      } else {
        logger.warn(`Payment not successful in PaymentFormContent: status ${paymentIntent?.status}`);
        setGlobalError({
          message: `Payment could not be completed. Status: ${paymentIntent?.status}. Please try again.`,
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('An unexpected error occurred during payment confirmation in PaymentFormContent', error);
      setGlobalError({
        message: 'An unexpected error occurred during payment. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [stripe, elements, clientSecret, closeModal, clearStoreState, clearGlobalError, setGlobalError, setSuccessMessageStore, queryClient, setBalance]); // Dependencies for useCallback

  return (
    <>
      <div className="py-4">
        {amount && (
          <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md mb-4">
            <span className="font-semibold text-lg">Amount to add:</span>
            <span className="font-bold text-xl text-blue-600">
              ${parseFloat(amount).toFixed(2)}
            </span>
          </div>
        )}
        {description && (
          <div className="text-sm text-gray-700 mb-4">
            <span className="font-semibold">Description:</span> {description}
          </div>
        )}

        {currentStep === 'initial' && (
          <>
            <div className="mt-4">
              <Label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Payment Method
              </Label>
              <select
                id="paymentMethod"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value as 'card' | 'paypal')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="card">Credit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {selectedPaymentMethod === 'card' && (
              <div className="mt-4 p-3 border rounded-md shadow-sm text-center bg-gray-50">
                <p className="text-gray-600">You will enter card details on the next step.</p>
              </div>
            )}

            {selectedPaymentMethod === 'paypal' && (
              <div className="mt-4 p-3 border rounded-md shadow-sm text-center">
                <p className="text-gray-600">
                  You will be redirected to PayPal to complete your purchase.
                </p>
              </div>
            )}
          </>
        )}

        {currentStep === 'cardConfirmation' && selectedPaymentMethod === 'card' && (
          <div className="mt-4 p-3 border rounded-md shadow-sm">
            <Label
              htmlFor="card-element"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Credit or debit card
            </Label>
            <div id="card-element">
              <CardElement options={cardElementOptions} onChange={handleCardChange} />
              {cardError && <div className="text-red-500 text-sm mt-2">{cardError}</div>}
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeModal} disabled={isLoading}>
          Cancel
        </Button>
        {currentStep === 'initial' ? (
          <Button
            onClick={handleInitiatePaymentProcess}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? 'Processing...' : 'Next'}
          </Button>
        ) : (
          <Button
            onClick={handleStripeConfirmation}
            disabled={isLoading || !clientSecret || !stripe || !elements}
          >
            {isLoading ? 'Confirming...' : 'Confirm Payment'}
          </Button>
        )}
      </DialogFooter>
    </>
  );
};


export function PaymentModal() {
  const { isOpen, closeModal, amount, description, clientSecret, setClientSecret, clearState } =
    usePaymentModalStore();
  
  const { setError, clearError } = useGlobalErrorStore();
  const { setMessage: setSuccessMessageStore } = useSuccessMessageStore(); // Use success message store

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // The internal state (currentStep, selectedPaymentMethod, isLoading, cardError)
      // will be managed by PaymentFormContent when it unmounts or re-initializes.
      clearState(); // Clear the store state
      clearError(); // Clear any global errors
      setSuccessMessageStore(null); // Clear success message on modal close
    }
  }, [isOpen, clearState, clearError, setSuccessMessageStore]);


  const stripe = useStripe(); // These hooks are still called here.
  const elements = useElements(); // But the crucial logic now lives in a child component.

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Choose a payment method to add funds to your account.
          </DialogDescription>
        </DialogHeader>
        {stripe && elements ? (
          <PaymentFormContent
            amount={amount}
            description={description}
            clientSecret={clientSecret}
            setClientSecret={setClientSecret}
            closeModal={closeModal}
            clearStoreState={clearState}
            clearGlobalError={clearError}
            setGlobalError={setError}
            setSuccessMessageStore={setSuccessMessageStore} // Pass setSuccessMessageStore down
          />
        ) : (
          <div className="flex justify-center items-center h-40">
            <p>Loading payment form...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
