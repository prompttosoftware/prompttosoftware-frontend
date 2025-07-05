'use client';

import React, { useState } from 'react';
import { useSavedCardsQuery } from '@/hooks/useSavedCardsQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/httpClient';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { Button } from '@/components/ui/button';
import { Card as UICard } from '@/components/ui/card'; // Avoid name collision with Card type
import { ConfirmAlertDialog } from '@/components/ui/ConfirmAlertDialog'; // Assuming this component exists
import { DialogFooter } from '@/components/ui/dialog';
import { isAxiosError } from 'axios';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/types/payments'; // Assuming Card type is defined here

const SavedCardsDisplay = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { data: savedCards, isLoading, isError, error } = useSavedCardsQuery();
  const { setError } = useGlobalErrorStore();
  const { setMessage } = useSuccessMessageStore();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      if (!token) throw new Error('Authentication token not available.');
      await httpClient.delete(`/payments/cards/${cardId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      setMessage('Card deleted successfully.');
      // Invalidate and refetch the cards list to update the UI
      queryClient.invalidateQueries(['savedCards']);
      setIsConfirmDialogOpen(false); // Close dialog on success
      setCardToDelete(null);
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response) {
        setError({
          message: err.response.data.message || 'Failed to delete card. Please try again.',
          type: 'error',
        });
      } else {
        setError({
          message: 'An unexpected error occurred during card deletion.',
          type: 'error',
        });
      }
      setIsConfirmDialogOpen(false); // Close dialog even on error
      setCardToDelete(null);
    },
  });

  const handleDeleteClick = (cardId: string) => {
    setCardToDelete(cardId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      deleteCardMutation.mutate(cardToDelete);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading saved cards...</div>;
  }

  if (isError) {
    return <div className="text-center py-4 text-red-500">Error: {error?.message || 'Failed to load saved cards.'}</div>;
  }

  return (
    <div className="space-y-4 py-2">
      {savedCards && savedCards.length > 0 ? (
        savedCards.map((card: Card) => (
          <UICard key={card.id} className="p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              {/* Placeholder for card brand icon */}
              <div className="text-xl">💳</div> 
              <div>
                <div className="font-semibold capitalize">
                  {card.brand} ending in {card.last4}
                  {card.default && <span className='ml-2 text-xs text-blue-500 font-normal'>(Default)</span>}
                </div>
                <div className="text-sm text-gray-500">Expires {format(new Date(card.expYear, card.expMonth - 1), 'MM/yy')}</div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteClick(card.id)}
              disabled={deleteCardMutation.isLoading}
              aria-label="Delete card"
            >
              {deleteCardMutation.isLoading && cardToDelete === card.id ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-r-transparent rounded-full"></span>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </UICard>
        ))
      ) : (
        <div className="text-center py-4 text-gray-500">No saved cards found.</div>
      )}

      <DialogFooter className="mt-6 flex justify-end">
        <Button variant="outline" className="w-full" onClick={() => { /* Implement add new card functionality or navigate */ }}>
          Add New Card
        </Button>
      </DialogFooter>

      <ConfirmAlertDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteCardMutation.isLoading}
      />
    </div>
  );
};

export default SavedCardsDisplay;

// TO-DO: Add New Card button should lead to the PaymentFormContent for adding a new card.
// This might involve changing the `activeTab` back to 'add_funds' and perhaps a different `addFundsStep`.
// For now, it's just a placeholder.
