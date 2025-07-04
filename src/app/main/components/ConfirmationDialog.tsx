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
import { Loader2 } from 'lucide-react'; // Assuming Loader2 is from lucide-react (common for UI icons)

const ConfirmationDialog: React.FC = () => {
  const { confirmationDialog, hideConfirmation } = useGlobalErrorStore();
  const [inputValue, setInputValue] = useState('');
  
  // Determine if the confirm button should be enabled
  const isConfirmButtonEnabled = useMemo(() => {
    if (!confirmationDialog) return false;
    // If isLoading, the button should be disabled
    if (confirmationDialog.isLoading) return false;
    // If there's a confirmPhrase, enable button only when input matches
    if (confirmationDialog.confirmPhrase) {
      return inputValue === confirmationDialog.confirmPhrase;
    }
    // Otherwise, enable button by default for simple confirmations
    return true;
  }, [inputValue, confirmationDialog]);

  useEffect(() => {
    // Reset input value when dialog opens or changes
    if (confirmationDialog && confirmationDialog.isOpen) {
      setInputValue('');
    }
  }, [confirmationDialog]);

  if (!confirmationDialog || !confirmationDialog.isOpen) {
    return null;
  }

  const handleConfirm = () => {
    // The button's disabled state already handles the logic, but an extra check here is harmless.
    if (isConfirmButtonEnabled) { // Only proceed if the button is enabled
      confirmationDialog.onConfirm();
      // Do not hide confirmation here; it will be hidden by the caller after API response.
    }
  };

  const handleCancel = () => {
    if (!confirmationDialog.isLoading) { // Allow cancel only if not loading
      if (confirmationDialog.onCancel) {
        confirmationDialog.onCancel();
      }
      hideConfirmation();
    }
  };

  const showConfirmPhraseInput = !!confirmationDialog.confirmPhrase;

  return (
    <Dialog open={confirmationDialog.isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{confirmationDialog.title}</DialogTitle>
          <DialogDescription>{confirmationDialog.message}</DialogDescription>
        </DialogHeader>
        {showConfirmPhraseInput && (
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              To confirm, please type &quot;
              <span className="font-semibold text-foreground">
                {confirmationDialog.confirmPhrase}
              </span>
              &quot; in the box below.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="confirm-input">Confirmation Phrase</Label>
              <Input
                id="confirm-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmationDialog.confirmPhrase}
                disabled={confirmationDialog.isLoading} // Disable input during loading
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={confirmationDialog.isLoading}>
            {confirmationDialog.cancelText || 'Cancel'}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmButtonEnabled}
          >
            {confirmationDialog.confirmText || 'Confirm'}
            {confirmationDialog.isLoading && (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
