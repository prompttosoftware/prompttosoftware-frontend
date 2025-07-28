import React from 'react';
import { FaPlusCircle } from 'react-icons/fa';

interface AddNewCardButtonProps {
  isSelected: boolean;
  onClick: () => void;
}

export function AddNewCardButton({ isSelected, onClick }: AddNewCardButtonProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition hover:shadow-sm
                  ${isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'}`}
    >
      <div className="flex items-center gap-4">
        <FaPlusCircle className="text-gray-500 w-6 h-6" />
        <span className="font-medium">Add a new card</span>
      </div>
      
      {isSelected && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-600">Selected</span>
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      )}
    </div>
  );
}
