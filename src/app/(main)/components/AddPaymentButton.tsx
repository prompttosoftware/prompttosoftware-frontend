'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { toast } from 'sonner';
import { pollForTransactionPromise } from '@/lib/transactions';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function AddPaymentButton() {
  const openModal = usePaymentModalStore((state) => state.openPaymentModal);
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const handleAddFundsClick = () => {
    openModal({
      // Define the onSuccess logic right here
      onSuccess: ({ paymentIntentId, amount }) => {
        const pollingPromise = pollForTransactionPromise({
          paymentIntentId,
          queryClient: queryClient,
        });

        toast.promise(pollingPromise, {
          loading: "Payment successful! We're updating your balance...",
          success: async () => {
            await refreshUser();
            queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
            return `Successfully added $${amount.toFixed(2)} to your balance!`;
          },
          error: (error) => {
            return error.message;
          },
        });
      },
    });
  };

  return (
    <Button
      variant="outline"
      className="flex items-center space-x-2 px-4 py-2 add-payment-button"
      data-test-id="add-payment-button" // Added for tutorial step targeting
      onClick={() => {
        handleAddFundsClick();
        console.log('Add Payment button clicked');
      }}
    >
      <Plus className="h-4 w-4" />
      <span>Add Payment</span>
    </Button>
  );
}
