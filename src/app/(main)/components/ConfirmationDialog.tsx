'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen?: boolean;
  title?: string;
  message?: string;
  confirmPhrase?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen: propIsOpen,
  title: propTitle,
  message: propMessage,
  confirmPhrase: propConfirmPhrase,
  confirmText: propConfirmText,
  cancelText: propCancelText,
  isLoading: propIsLoading,
  onConfirm: propOnConfirm,
  onCancel: propOnCancel,
}) => {
  const { confirmationDialog, hideConfirmation } = useGlobalErrorStore();
  const [inputValue, setInputValue] = useState('');
  
  // Use props if provided, otherwise fall back to global store
  const dialogConfig = useMemo(() => {
    if (propIsOpen !== undefined) {
      // Props mode - use provided props
      return {
        isOpen: propIsOpen,
        title: propTitle || 'Confirm Action',
        message: propMessage || 'Are you sure you want to proceed?',
        confirmPhrase: propConfirmPhrase,
        confirmText: propConfirmText,
        cancelText: propCancelText,
        isLoading: propIsLoading || false,
        onConfirm: propOnConfirm || (() => {}),
        onCancel: propOnCancel,
      };
    } else {
      // Global store mode - use store values
      return confirmationDialog;
    }
  }, [
    propIsOpen,
    propTitle,
    propMessage,
    propConfirmPhrase,
    propConfirmText,
    propCancelText,
    propIsLoading,
    propOnConfirm,
    propOnCancel,
    confirmationDialog,
  ]);
  
  // Determine if the confirm button should be enabled
  const isConfirmButtonEnabled = useMemo(() => {
    if (!dialogConfig) return false;
    // If isLoading, the button should be disabled
    if (dialogConfig.isLoading) return false;
    // If there's a confirmPhrase, enable button only when input matches
    if (dialogConfig.confirmPhrase) {
      return inputValue === dialogConfig.confirmPhrase;
    }
    // Otherwise, enable button by default for simple confirmations
    return true;
  }, [inputValue, dialogConfig]);

  useEffect(() => {
    // Reset input value when dialog opens or changes
    if (dialogConfig && dialogConfig.isOpen) {
      setInputValue('');
    }
  }, [dialogConfig]);

  if (!dialogConfig || !dialogConfig.isOpen) {
    return null;
  }

  const handleConfirm = () => {
    // The button's disabled state already handles the logic, but an extra check here is harmless.
    if (isConfirmButtonEnabled) { // Only proceed if the button is enabled
      dialogConfig.onConfirm();
      // Do not hide confirmation here; it will be hidden by the caller after API response.
    }
  };

  const handleCancel = () => {
    if (!dialogConfig.isLoading) { // Allow cancel only if not loading
      if (dialogConfig.onCancel) {
        dialogConfig.onCancel();
      }
      // Only hide confirmation if using global store
      if (propIsOpen === undefined) {
        hideConfirmation();
      }
    }
  };

  const showConfirmPhraseInput = !!dialogConfig.confirmPhrase;

  return (
    <Dialog open={dialogConfig.isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px] bg-white/90 text-gray-900 backdrop-blur-md rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>{dialogConfig.title}</DialogTitle>
          <DialogDescription>{dialogConfig.message}</DialogDescription>
        </DialogHeader>
        {showConfirmPhraseInput && (
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-700">
              To confirm, please type&nbsp;
              <span className="font-semibold text-gray-900">
                "{dialogConfig.confirmPhrase}"
              </span>
              &nbsp;in the box below.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="confirm-input" className="text-gray-700">
                Confirmation Phrase
              </Label>
              <Input
                id="confirm-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={dialogConfig.confirmPhrase}
                disabled={dialogConfig.isLoading}
                className="border border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={dialogConfig.isLoading}>
            {dialogConfig.cancelText || 'Cancel'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmButtonEnabled}
          >
            {dialogConfig.confirmText || 'Confirm'}
            {dialogConfig.isLoading && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
