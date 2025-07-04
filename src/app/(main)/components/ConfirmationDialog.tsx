'use client';

import React, { useState, useEffect } from 'react';
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

const ConfirmationDialog: React.FC = () => {
  const { confirmationDialog, hideConfirmation } = useGlobalErrorStore();
  const [inputValue, setInputValue] = useState('');
  const [isConfirmButtonEnabled, setIsConfirmButtonEnabled] = useState(false);

  useEffect(() => {
    // If there's a confirmPhrase, enable button only when input matches
    // Otherwise, enable button by default for simple confirmations
    if (confirmationDialog) {
      setIsConfirmButtonEnabled(
        confirmationDialog.confirmPhrase ? inputValue === confirmationDialog.confirmPhrase : true, // No phrase means button is always enabled
      );
    } else {
      // Reset state when dialog is closed
      setInputValue('');
      setIsConfirmButtonEnabled(false);
    }
  }, [inputValue, confirmationDialog]);

  if (!confirmationDialog || !confirmationDialog.isOpen) {
    return null;
  }

  const handleConfirm = () => {
    // If there's a confirmPhrase, check for match, otherwise proceed directly
    if (!confirmationDialog.confirmPhrase || inputValue === confirmationDialog.confirmPhrase) {
      confirmationDialog.onConfirm();
      hideConfirmation();
    }
  };

  const handleCancel = () => {
    if (confirmationDialog.onCancel) {
      confirmationDialog.onCancel();
    }
    hideConfirmation();
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
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {confirmationDialog.cancelText || 'Cancel'}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!isConfirmButtonEnabled}>
            {confirmationDialog.confirmText || 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
