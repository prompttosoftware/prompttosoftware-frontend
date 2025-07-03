'use client';

import { Button } from '@/components/ui/button';
import { usePaymentModalStore } from '@/store/paymentModalStore';

export function AddPaymentButton() {
  const { openModal } = usePaymentModalStore();

  return (
    <Button onClick={openModal} className="w-full justify-start text-left">
      Add Funds
    </Button>
  );
}
