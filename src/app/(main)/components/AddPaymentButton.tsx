'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePaymentModalStore } from '@/store/paymentModalStore';

export default function AddPaymentButton() {
  const openModal = usePaymentModalStore((state) => state.openPaymentModal);

  return (
    <Button
      variant="outline"
      className="flex items-center space-x-2 px-4 py-2 add-payment-button"
      data-test-id="add-payment-button" // Added for tutorial step targeting
      onClick={() => {
        openModal({}); // Call openModal to set isOpen to true
        console.log('Add Payment button clicked');
      }}
    >
      <Plus className="h-4 w-4" />
      <span>Add Payment</span>
    </Button>
  );
}
