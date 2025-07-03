'use client';

import React, { useState, useMemo } from 'react';
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
import { Label } from '@/components/ui/label'; // Assuming Label is needed for the card element

export function PaymentModal() {
  const { isOpen, closeModal, amount, description } = usePaymentModalStore(); // Destructure amount and description
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal'>('card'); // State to manage selected payment method

  const stripe = useStripe();
  const elements = useElements();

  const cardElementOptions = useMemo(() => ({
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
    hidePostalCode: true, // Often handled separately or not needed for certain flows
  }), []);


  const handleConfirmPayment = async () => {
    if (selectedPaymentMethod === 'card') {
      if (!stripe || !elements) {
        // Stripe.js has not yet loaded.
        // Make sure to disable form submission until Stripe.js has loaded.
        console.error("Stripe.js has not loaded yet.");
        // You might want to show an error message to the user
        return;
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        console.error("CardElement not found.");
        return;
      }

      // In a real application, you'd create a PaymentMethod or confirm a PaymentIntent here.
      // For this task, we'll just log and close the modal.
      console.log("Attempting to process card payment...");
      // Example: const {error, paymentMethod} = await stripe.createPaymentMethod({ type: 'card', card: cardElement });
      // if (error) { console.error(error); } else { console.log(paymentMethod); }
      alert("Card payment simulated successfully!");
      closeModal();
    } else if (selectedPaymentMethod === 'paypal') {
      console.log("Proceeding with PayPal payment...");
      alert("PayPal payment simulated successfully!");
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Choose a payment method to add funds to your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {amount && ( // Only show if amount is set
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
              <span className="font-semibold text-lg">Amount to add:</span>
              <span className="font-bold text-xl text-blue-600">${parseFloat(amount).toFixed(2)}</span>
            </div>
          )}
          {description && ( // Only show if description is set
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Description:</span> {description}
            </div>
          )}
        
          <div className="mt-4">
            <Label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="mt-4 p-3 border rounded-md shadow-sm">
              <Label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
                Credit or debit card
              </Label>
              <div id="card-element">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
          )}
        
          {selectedPaymentMethod === 'paypal' && (
            <div className="mt-4 p-3 border rounded-md shadow-sm text-center">
              <p className="text-gray-600">You will be redirected to PayPal to complete your purchase.</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancel</Button>
          <Button onClick={handleConfirmPayment} disabled={!stripe || !elements}>Confirm Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
