'use client';

import React, { useCallback, useState } from 'react'; // Keep useState for deletingCardId
import { SavedCard } from '@/types/payments';
import { paymentsService } from '@/services/paymentsService'; // Still needed for handleDeleteCard
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as FaIcons from 'react-icons/fa';
import { logger } from '@/lib/logger';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import { useSavedCardsQuery } from '@/hooks/useSavedCardsQuery'; // Import the hook
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

export function SavedCardsList() {
  const { data: savedCards, isLoading, isError, error } = useSavedCardsQuery(); // Use the hook
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const { setError, showConfirmation } = useGlobalErrorStore();
  const { setMessage: setSuccessMessage } = useSuccessMessageStore();
  const queryClient = useQueryClient(); // Initialize query client

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      showConfirmation({
        title: 'Remove Saved Card',
        message: 'Are you sure you want to remove this card? This action cannot be undone.',
        confirmText: 'Remove Card',
        cancelText: 'Cancel',
        onConfirm: async () => {
          setDeletingCardId(cardId);
          setSuccessMessage(null); // Clear previous success messages
          setError(null); // Clear previous errors

          // Optimistically update the UI
          const previousSavedCards = queryClient.getQueryData<SavedCard[]>(['savedCards']);
          queryClient.setQueryData<SavedCard[]>(
            ['savedCards'],
            (oldCards) => oldCards?.filter((card) => card.id !== cardId) || []
          );

          try {
            const response = await paymentsService.deleteSavedCard(cardId);
            logger.info(`Card delete response: ${response.message}`);
            setSuccessMessage(response.message || 'Card removed successfully.');
            // Invalidate the query to refetch fresh data or rely on optimistic update
            queryClient.invalidateQueries({ queryKey: ['savedCards'] });
          } catch (error: any) {
            logger.error('Failed to delete card:', error);
            setError({
              message: error.message || 'Error deleting card.',
              type: 'error',
            });
            // Rollback on error
            if (previousSavedCards) {
              queryClient.setQueryData(['savedCards'], previousSavedCards);
            }
          } finally {
            setDeletingCardId(null);
          }
        },
        onCancel: () => {
          logger.info(`Card deletion for ID ${cardId} cancelled.`);
        },
      });
    },
    [setError, setSuccessMessage, showConfirmation, queryClient],
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
        <SkeletonLoader count={3} className="h-24" />
      </div>
    );
  }
  
  if (isError || !savedCards) { // Check for error first, or if data is unexpectedly null/undefined
    return (
      <div className="text-center text-red-500 py-8">
        <p>Failed to load saved payment methods.</p>
        <p>Please try again later.</p>
      </div>
    );
  }
  
  if (savedCards.length === 0) { // Now savedCards is guaranteed to be an array
    return (
      <EmptyState
        title="No Saved Payment Methods"
        description="You haven't saved any payment methods yet. They will appear here after your first payment."
      />
    );
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
            disabled={deletingCardId === card.id}
          >
            {deletingCardId === card.id ? 'Deleting...' : 'Delete'}
          </Button>
        </Card>
      ))}
    </div>
  );
}
