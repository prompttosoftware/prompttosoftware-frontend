import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSavedCards } from '@/lib/payments';
import { SavedCard } from '@/types/payments';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, PlusCircle } from 'lucide-react';

interface SavedCardsListProps {
  selectedCardId: string;
  onCardSelect: (cardId: string) => void;
}

// A small component to render the card details nicely
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

export function SavedCardsList({ selectedCardId, onCardSelect }: SavedCardsListProps) {
  const { data: savedCards, isLoading: isLoadingCards } = useQuery<SavedCard[]>({
    queryKey: ['savedCards'],
    queryFn: getSavedCards,
    // It's good practice to keep data fresh but not refetch aggressively on window focus for this
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <div className="grid gap-2">
      <Label>Payment Method</Label>
      {isLoadingCards ? (
        <div className="p-4 border rounded-md text-sm text-muted-foreground">Loading cards…</div>
      ) : (
        <RadioGroup
          value={selectedCardId}
          onValueChange={onCardSelect}
          className="grid gap-2"
        >
          {savedCards?.map((card) => (
            <Label
              key={card.id}
              htmlFor={card.id}
              className="flex items-center justify-between p-4 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:border-primary"
            >
              <CardDisplay card={card} />
              <RadioGroupItem value={card.id} id={card.id} />
            </Label>
          ))}

          <Label
            htmlFor="new_card"
            className="flex items-center gap-4 p-4 border rounded-md cursor-pointer hover:bg-accent has-[:checked]:border-primary"
          >
            <PlusCircle className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">Add a new card</span>
            <RadioGroupItem value="new_card" id="new_card" className="ml-auto" />
          </Label>
        </RadioGroup>
      )}
    </div>
  );
}
