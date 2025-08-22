'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePaymentModalStore } from '@/store/paymentModalStore';
import { toast } from 'sonner';
import { pollForTransactionPromise } from '@/lib/transactions';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function AddPaymentButton({ disabled }: { disabled?: boolean }) {
  const openModal = usePaymentModalStore((state) => state.openPaymentModal);
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const handleAddFundsClick = () => {
    openModal({
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
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-none add-payment-button"
      data-test-id="add-payment-button"
      onClick={handleAddFundsClick}
      disabled={disabled}
      aria-label="Add Payment"
    >
      <Plus className="h-5 w-5" />
    </Button>
  );
}
