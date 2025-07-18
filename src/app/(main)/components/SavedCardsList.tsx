'use client';

import React, { useCallback } from 'react';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import * as FaIcons from 'react-icons/fa';
import { logger } from '@/lib/logger';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SavedCard } from '@/types/payments';
import { deleteSavedCard, getSavedCards } from '@/lib/payments';
import { toast } from 'sonner';

// This is the component that will display in the settings page.
export function SavedCardsList() {
  const queryClient = useQueryClient();
  const { setError, showConfirmation } = useGlobalErrorStore();

  const { data: savedCards, isLoading, isError } = useQuery<SavedCard[]>({
    queryKey: ['savedCards'], // Unique key for this query
    queryFn: () => getSavedCards(),
  });

  // UPDATED: Use useMutation for deleting cards to handle state changes and optimistic updates.
  const { mutate: deleteCard, isPending: isDeleting } = useMutation({
    mutationFn: (cardId: string) => deleteSavedCard(cardId),
    onSuccess: (data, cardId) => {
      toast.success(data.message || 'Card removed successfully.');
      // Invalidate the query to refetch the list of cards from the server.
      queryClient.invalidateQueries({ queryKey: ['savedCards'] });
      logger.info(`Successfully deleted card ${cardId}`);
    },
    onError: (error: any) => {
      logger.error('Failed to delete card:', error);
      setError({ message: error.message || 'Error deleting card.', type: 'error' });
    },
  });

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      showConfirmation(
        'Remove Saved Card',
        'Are you sure you want to remove this card?',
        () => deleteCard(cardId),
      );
    },
    [showConfirmation, deleteCard],
  );

  const getCardIcon = (brand: string): React.ReactElement => {
        switch (brand.toLowerCase()) {
      case 'visa':
        return <FaIcons.FaCcVisa className="text-blue-600 w-8 h-8" />;
      case 'mastercard':
        return <FaIcons.FaCcMastercard className="text-orange-500 w-8 h-8" />;
      default:
        return <FaIcons.FaRegCreditCard className="text-gray-500 w-8 h-8" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader count={2} className="h-24" />
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Error" description="Could not load payment methods. Please try again later." />;
  }

  if (!savedCards || savedCards.length === 0) {
    return <EmptyState title="No Saved Cards" description="Add a payment method during your next transaction." />;
  }

  return (
    <div className="space-y-4">
      {savedCards.map((card) => (
        <Card key={card.id} className="flex items-center justify-between p-4 shadow-sm">
          <div className="flex items-center space-x-4">
            {getCardIcon(card.brand)}
            <div>
              <CardTitle className="text-lg font-semibold capitalize">
                {card.brand} ending in {card.last4}
              </CardTitle>
              <CardDescription>
                Expires {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear % 100}
              </CardDescription>
              {card.isDefault && (
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => handleDeleteCard(card.id)}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </Card>
      ))}
    </div>
  );
}
