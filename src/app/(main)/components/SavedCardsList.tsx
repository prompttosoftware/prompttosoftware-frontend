'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

export function SavedCardsList() {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const { setError } = useGlobalErrorStore();
  const { setMessage: setSuccessMessage } = useSuccessMessageStore();

  const fetchSavedCards = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await paymentsService.getSavedCards();
      setSavedCards(response.cards);
    } catch (error: any) {
      logger.error('Failed to fetch saved cards:', error);
      setError({
        message: error.message || 'Error fetching saved cards.',
        type: 'error',
      });
      setSavedCards([]); // Clear cards on error
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    fetchSavedCards();
  }, [fetchSavedCards]);

  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      if (!confirm('Are you sure you want to delete this saved card?')) {
        return;
      }

      setDeletingCardId(cardId);
      setError(null); // Clear previous errors
      setSuccessMessage(null); // Clear previous success messages
      try {
        const response = await paymentsService.deleteSavedCard(cardId);
        logger.info(`Card delete response: ${response.message}`);
        setSuccessMessage(response.message);
        // Re-fetch the list to ensure UI is synchronized
        fetchSavedCards();
      } catch (error: any) {
        logger.error('Failed to delete card:', error);
        setError({
          message: error.message || 'Error deleting card.',
          type: 'error',
        });
      } finally {
        setDeletingCardId(null);
      }
    },
    [fetchSavedCards, setError, setSuccessMessage],
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

  if (savedCards.length === 0) {
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
