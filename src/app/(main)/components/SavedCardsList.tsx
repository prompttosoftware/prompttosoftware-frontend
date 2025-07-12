'use client';

import React, { useCallback, useState } from 'react';
import { SavedCard } from '@/types/payments';
import { paymentsService } from '@/services/paymentsService';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import * as FaIcons from 'react-icons/fa';
import { logger } from '@/lib/logger';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook

export function SavedCardsList() {
  // Destructure user, authLoading, and refreshUser from useAuth
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const { setError, showConfirmation } = useGlobalErrorStore();
  const { setMessage: setSuccessMessage } = useSuccessMessageStore();
  const queryClient = useQueryClient();

  // The saved cards now come directly from the user object.
  // Provide a fallback to an empty array if user or savedCards is undefined/null.
  const savedCards = user?.savedCards || [];

  // Determine overall loading state based on authLoading
  const isLoading = authLoading;

  // Determine error state: if not loading AND no user object is present, we consider it an error.
  // This implies that the authentication/user profile fetch failed or didn't return a user.
  const isError = !authLoading && !user; 

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      showConfirmation(
        'Remove Saved Card',
        'Are you sure you want to remove this card? This action cannot be undone.',
        async () => {
          setDeletingCardId(cardId);
          setSuccessMessage(null);
          setError(null);

          // Optimistically update the UI by manipulating the user's savedCards in the auth context cache
          const previousUser = queryClient.getQueryData<typeof user>(['user']); // Assuming 'user' is the query key for the user object
          queryClient.setQueryData<typeof user>(
            ['user'],
            (oldUser) => {
              if (oldUser) {
                return {
                  ...oldUser,
                  savedCards: oldUser.savedCards?.filter((card) => card.id !== cardId) || [],
                };
              }
              return oldUser;
            }
          );

          try {
            const response = await paymentsService.deleteSavedCard(cardId);
            logger.info(`Card delete response: ${response.message}`);
            setSuccessMessage(response.message || 'Card removed successfully.');
            // After successful deletion, refresh the user data from the backend
            // to ensure the useAuth's user object is completely in sync.
            await refreshUser(); 
          } catch (error: any) {
            logger.error('Failed to delete card:', error);
            setError({
              message: error.message || 'Error deleting card.',
              type: 'error',
            });
            // Rollback on error by restoring the previous user data in the cache
            if (previousUser) {
              queryClient.setQueryData(['user'], previousUser);
            }
          } finally {
            setDeletingCardId(null);
          }
        },
        {
          confirmText: 'Remove Card',
          cancelText: 'Cancel',
          onCancel: () => {
            logger.info(`Card deletion for ID ${cardId} cancelled.`);
          },
        }
      );
    },
    [setError, setSuccessMessage, showConfirmation, queryClient, refreshUser],
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

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader count={3} className="h-24" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Failed to load saved payment methods.</p>
        <p>Please try again later.</p>
      </div>
    );
  }
  
  // If not loading and no error, savedCards should be an array (possibly empty).
  const cardsToDisplay = savedCards; // savedCards is already guaranteed to be an array by the || [] fallback

  if (cardsToDisplay.length === 0) {
    return (
      <EmptyState
        title="No Saved Payment Methods"
        description="You haven't saved any payment methods yet. They will appear here after your first payment."
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {cardsToDisplay.map((card) => (
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
