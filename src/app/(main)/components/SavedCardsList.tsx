import React, { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavedCards, deleteSavedCard } from '@/lib/payments';
import { SavedCard } from '@/types/payments';
import { Label } from '@/components/ui/label';
import { CardSelectionItem } from './CardSelectionItem';
import { AddNewCardButton } from './AddNewCardButton';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface SavedCardsListProps {
  selectedCardId: string;
  onCardSelect: (cardId: string) => void;
}

export function SavedCardsList({ selectedCardId, onCardSelect }: SavedCardsListProps) {
  const queryClient = useQueryClient();
  const { setError, showConfirmation } = useGlobalErrorStore();
  
  const { data: savedCards, isLoading: isLoadingCards, error } = useQuery<SavedCard[]>({
    queryKey: ['savedCards'],
    queryFn: () => getSavedCards(),
  });

  // Mutation for deleting cards
  const { mutate: deleteCard, isPending: isDeleting } = useMutation({
    mutationFn: (cardId: string) => deleteSavedCard(cardId),
    onSuccess: (data, cardId) => {
      toast.success(data.message || 'Card removed successfully.');
      // If the deleted card was selected, switch to new card
      if (selectedCardId === cardId) {
        onCardSelect('new_card');
      }
      queryClient.invalidateQueries({ queryKey: ['savedCards'] });
      logger.info(`Successfully deleted card ${cardId}`);
    },
    onError: (error: any) => {
      logger.error('Failed to delete card:', error);
      setError({ message: error.message || 'Error deleting card.', type: 'error' });
    },
  });

  const handleDeleteCard = useCallback(
    (cardId: string, event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent card selection when clicking delete
      showConfirmation(
        'Remove Saved Card',
        'Are you sure you want to remove this card?',
        () => deleteCard(cardId),
      );
    },
    [showConfirmation, deleteCard],
  );

  if (error) {
    return (
      <div className="grid gap-2 py-4">
        <Label className="text-gray-700">Payment Method</Label>
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
          <p className="text-sm text-red-600">Failed to load saved cards. You can still add a new card.</p>
          <div className="mt-2">
            <AddNewCardButton
              isSelected={selectedCardId === 'new_card'}
              onClick={() => onCardSelect('new_card')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2 py-4">
      <Label className="text-gray-700">Payment Method</Label>
      
      <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
        {isLoadingCards && <p className="text-sm text-gray-500">Loading cards…</p>}

        {savedCards?.map((card) => (
          <CardSelectionItem
            key={card.id}
            card={card}
            isSelected={selectedCardId === card.id}
            onClick={() => onCardSelect(card.id)}
            onDelete={handleDeleteCard}
            isDeleting={isDeleting}
          />
        ))}

        <AddNewCardButton
          isSelected={selectedCardId === 'new_card'}
          onClick={() => onCardSelect('new_card')}
        />
      </div>
    </div>
  );
}
