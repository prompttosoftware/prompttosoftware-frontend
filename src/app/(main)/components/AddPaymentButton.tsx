'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react'; // Assuming Plus icon is desired, though not used in original snippet. Re-adding for consistency with initial task.
import { usePaymentModalStore } from '@/store/paymentModalStore';

// No longer needs props, remove interface
// interface AddPaymentButtonProps {
//   // Add any props if needed
// }

export default function AddPaymentButton() {
  // No longer takes props AddPaymentButton({}: AddPaymentButtonProps)
  const openModal = usePaymentModalStore((state) => state.openModal); // Get the openModal function from the store

  return (
    <Button
      variant="outline" // Assuming original styling from previous subtask.
      className="flex items-center space-x-2 px-4 py-2 add-payment-button" // Assuming original styling from previous subtask.
      onClick={() => {
        openModal(); // Call openModal to set isOpen to true
        console.log('Add Payment button clicked');
      }}
    >
      <Plus className="h-4 w-4" /> {/* Assuming Plus icon is desired for consistency. */}
      <span>Add Payment</span>
    </Button>
  );
}
