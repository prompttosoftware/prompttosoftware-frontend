import React from 'react';
import { SavedCard } from '@/types/payments';
import { FaCcMastercard, FaCcVisa, FaRegCreditCard, FaTrash } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

interface CardSelectionItemProps {
  card: SavedCard;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (cardId: string, event: React.MouseEvent) => void;
  isDeleting: boolean;
}

export function CardSelectionItem({ card, isSelected, onClick, onDelete, isDeleting }: CardSelectionItemProps) {
  const getCardIcon = (brand: string): React.ReactElement => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return <FaCcVisa className="text-blue-600 w-8 h-8" />;
      case 'mastercard':
        return <FaCcMastercard className="text-orange-500 w-8 h-8" />;
      default:
        return <FaRegCreditCard className="text-gray-500 w-8 h-8" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition hover:shadow-sm
                  ${isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'}`}
    >
      <div className="flex items-center gap-4">
        {getCardIcon(card.brand)}
        <div>
          <span className="font-medium">
            {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} ending in {card.last4}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              Expires {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear % 100}
            </span>
            {card.isDefault && (
              <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => onDelete(card.id, e)}
          disabled={isDeleting}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <FaTrash className="h-3 w-3" />
        </Button>
        
        {isSelected && (
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        )}
      </div>
    </div>
  );
}
