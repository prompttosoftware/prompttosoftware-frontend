'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { StripeWrapper } from '@/components/StripeWrapper';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/api';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { isAxiosError } from 'axios';
import { CreatePaymentIntentRequest, CreatePaymentIntentResponse } from '@/types/payments';
import { logger } from '@/lib/logger';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

type PaymentStep = 'initial' | 'cardConfirmation';

export function PaymentModal() {
  const { isOpen, closeModal, amount, description, clientSecret, setClientSecret, clearState } =
    usePaymentModalStore(); // Added clearState and clientSecret from store
  const [currentStep, setCurrentStep] = useState<PaymentStep>('initial'); // New state for managing steps
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null); // State for card input errors

  const { setError, clearError } = useGlobalErrorStore();
  const queryClient = useQueryClient(); // Get queryClient

  const stripe = useStripe();
  const elements = useElements();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('initial');
      setSelectedPaymentMethod('card');
      setIsLoading(false);
      clearState(); // Clear the store state as well
      clearError(); // Clear any global errors
      setCardError(null); // Clear card errors on modal close
    } else {
      // If modal opens and clientSecret implies a previous attempt, go to confirmation step
      if (clientSecret) {
        setCurrentStep('cardConfirmation');
      } else {
        setCurrentStep('initial');
      }
    }
  }, [isOpen, clientSecret, clearState, clearError]); // Added dependencies

  const cardElementOptions = useMemo(
    () => ({
      // Use React.useMemo
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

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handleInitiatePaymentProcess = async () => {
    if (selectedPaymentMethod === 'card') {
      if (!stripe || !elements) {
        logger.error('Stripe.js has not loaded yet.');
        setError({ message: 'Stripe.js is not loaded. Please try again.', type: 'error' });
        return;
      }

      setIsLoading(true);
      clearError(); // Clear any previous errors

      const token = localStorage.getItem('jwtToken');
      if (!token) {
        setError({ message: 'Authentication required. Please log in again.', type: 'error' });
        logger.error('No JWT token found for payment intent creation.');
        setIsLoading(false);
        return;
      }

      if (!amount) {
        setError({ message: 'Payment amount is missing.', type: 'error' });
        logger.error('Payment amount is missing.');
        setIsLoading(false);
        return;
      }

      const amountInCents = Math.round(parseFloat(amount) * 100);

      if (amountInCents <= 0) {
        setError({ message: 'Payment amount must be greater than zero.', type: 'error' });
        logger.error('Attempted to create payment intent with non-positive amount.');
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
          // Corrected Axios type
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { clientSecret: newClientSecret, paymentIntentId } = response;
        setClientSecret(newClientSecret);
        logger.info(`Payment Intent created successfully: ${paymentIntentId}`);
        setCurrentStep('cardConfirmation'); // Move to the next step
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
        setIsLoading(false);
      }
    } else if (selectedPaymentMethod === 'paypal') {
      logger.info('Proceeding with PayPal payment (simulated)');
      setError({ message: 'PayPal integration is not yet implemented.', type: 'info' });
      // In a real app, you'd redirect to PayPal
      closeModal();
    }
  };

  const handleStripeConfirmation = async () => {
    if (!stripe || !elements || !clientSecret) {
      setError({ message: 'Stripe.js has not loaded or client secret is missing.', type: 'error' });
      logger.error('Stripe.js not loaded or clientSecret missing for confirmation.');
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        setError({ message: 'Card details not found. Please re-enter.', type: 'error' });
        logger.error('CardElement not found.');
        setIsLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        logger.error('Payment failed', error);
        setError({ message: error.message || 'Payment failed. Please try again.', type: 'error' });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Funds added successfully!');
        // Invalidate the user profile query to refetch balance
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        closeModal(); // Close modal on success
      } else {
        logger.warn(`Payment not successful: status ${paymentIntent?.status}`);
        setError({
          message: `Payment could not be completed. Status: ${paymentIntent?.status}. Please try again.`,
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('An unexpected error occurred during payment confirmation', error);
      setError({
        message: 'An unexpected error occurred during payment. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <StripeWrapper>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
            <DialogDescription>
              Choose a payment method to add funds to your account.
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </StripeWrapper>
    </Dialog>
  );
}
