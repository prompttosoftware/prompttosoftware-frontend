'use client';

import React, { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore'; // Import success message store
import { httpClient } from '@/lib/httpClient'; // Import the axios instance
import { AuthContext } from '@/lib/AuthContext'; // Import AuthContext
import { logger } from '@/utils/logger'; // Import logger
import { AxiosError } from 'axios'; // Import AxiosError type
import { api } from '@/lib/api';

const DeleteAccountButton: React.FC = () => {
  const { showConfirmation, setError, setConfirmationLoading } = useGlobalErrorStore();
  const { logout } = useContext(AuthContext); // Get logout from AuthContext
  const { setMessage: setSuccessMessage } = useSuccessMessageStore(); // Get setSuccessMessage from store hook

  const handleDeleteAccount = () => {
    showConfirmation(
      'Delete My Account',
      "This action is irreversible and will permanently delete your account and all associated data. To confirm, please type 'DELETE MY ACCOUNT' in the box below.",
      async () => {
        setConfirmationLoading(true); // Set loading before async action
        try {
          // Perform the DELETE request to the backend
          await api.deleteAccount(); 
          logger.info('Account deleted successfully.');
          logout(); // Call the logout function from AuthContext to clear state and redirect
          setSuccessMessage('Your account has been successfully deleted.'); // Set success message
        } catch (error: unknown) {
          logger.error('Failed to delete account:', error); // Use logger.error
          let errorMessage = 'Failed to delete account.';
          let errorDescription = 'An unexpected error occurred.';
          let statusCode: number | undefined = undefined;

          if (error instanceof AxiosError && error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            statusCode = error.response.status;
            if (
              error.response.data &&
              typeof error.response.data === 'object' &&
              'message' in error.response.data
            ) {
              errorDescription = (error.response.data as { message: string }).message;
            } else if (error.message) {
              errorDescription = error.message;
            }

            if (statusCode >= 400 && statusCode < 500) {
              errorMessage = 'Client error during account deletion.';
            } else if (statusCode >= 500) {
              errorMessage = 'Server error during account deletion.';
            }
          } else if (error instanceof AxiosError && error.request) {
            // The request was made but no response was received
            errorMessage = 'Network error.';
            errorDescription = 'Please check your internet connection.';
          } else if (error instanceof Error) {
            // Something happened in setting up the request that triggered an Error
            errorMessage = 'Application error.';
            errorDescription = error.message;
          }

          setError({
            message: errorMessage,
            description: errorDescription,
            statusCode: statusCode,
          });
        } finally {
          setConfirmationLoading(false); // Clear loading after action completes
        }
      },
      {
        // options object
        confirmPhrase: 'DELETE MY ACCOUNT',
        onCancel: () => {
          logger.info('Account deletion cancelled by user.'); // Use logger.info
        },
      },
    );
  };

  return (
    <Button variant="destructive" onClick={handleDeleteAccount}>
      Delete Account
    </Button>
  );
};

export default DeleteAccountButton;
