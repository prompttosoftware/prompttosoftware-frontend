import React from 'react';
import { SavedCard } from '@/types/payments';

// SavedCardsList should now be a purely presentational component,
// receiving cards as a prop from its parent (e.g., PaymentsPage).
// Loading, error, and empty states are handled by the parent.
export function SavedCardsList({ cards }: { cards: SavedCard[] }) {
  // The parent component (e.g., PaymentsPage) is responsible for handling
  // loading, error, and empty states before rendering SavedCardsList.
  // Therefore, no internal checks for these conditions are needed here.
  // We assume 'cards' is an array, potentially empty if no cards are available.

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold mb-4">Your Saved Payment Methods</h2>
      {cards.map((card) => (
        <div key={card.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-lg">{card.brand}</span>
            <span className="text-gray-600">**** **** **** {card.last4}</span>
          </div>
          <div className="text-sm text-gray-500">
            Expires: {card.expiryMonth}/{card.expiryYear}
          </div>
        </div>
      ))}
    </div>
  );
};

// No default export as it's now a named export.
