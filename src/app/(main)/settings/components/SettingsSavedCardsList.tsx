// src/app/(main)/components/SettingsSavedCardsList.tsx

'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserSavedCards } from '@/hooks/useUserSavedCards';
import { api } from '@/lib/api';
import { SavedCard } from '@/types/payments';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; // Assuming a toast library for notifications

// Reusable display component for card details
const CardDisplay = ({ card }: { card: SavedCard }) => (
  <div className="flex items-center gap-4">
    <CreditCard className="h-6 w-6 text-muted-foreground" />
    <div className="flex flex-col">
      <span className="font-medium">
        {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
      </span>
      <span className="text-sm text-muted-foreground">
        Expires {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
      </span>
    </div>
  </div>
);

export function SettingsSavedCardsList() {
  const queryClient = useQueryClient();
  const { data: savedCards, isLoading, isError, error } = useUserSavedCards();

  const { mutate: deleteCard, isPending: isDeleting } = useMutation({
    mutationFn: (cardId: string) => api.deleteSavedCard(cardId),
    onSuccess: () => {
      toast.success('Card deleted successfully.');
      // Refetch the cards list to show the change
      queryClient.invalidateQueries({ queryKey: ['savedCards'] });
    },
    onError: (err) => {
      toast.error('Failed to delete card.', {
        description: err.message,
      });
    },
  });

  const { mutate: setDefaultCard, isPending: isSettingDefault } = useMutation({
    mutationFn: (cardId: string) => api.setDefaultSavedCard(cardId),
    onSuccess: (updatedCards) => {
      toast.success('Default card updated.');
      // For a smoother UX, directly update the cache with the new list from the API
      queryClient.setQueryData(['savedCards'], updatedCards);
    },
    onError: (err) => {
      toast.error('Failed to set default card.', {
        description: err.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded-md text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading saved cards...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border rounded-md text-sm text-destructive bg-destructive/10">
        Error loading cards: {error.message}
      </div>
    );
  }

  if (!savedCards || savedCards.length === 0) {
    return (
      <div className="p-4 border rounded-md text-sm text-muted-foreground">
        You have no saved cards. Add a card during your next payment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedCards.map((card) => {
        const isActionPending = isDeleting || isSettingDefault;
        return (
          <div
            key={card.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-md"
          >
            <div className="flex items-center gap-4">
              <CardDisplay card={card} />
              {card.isDefault && (
                <Badge variant="secondary">
                  <Star className="mr-1 h-3 w-3" />
                  Default
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              {!card.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDefaultCard(card.id)}
                  disabled={isActionPending}
                >
                  Set as default
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteCard(card.id)}
                disabled={isActionPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
