'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useGlobalErrorStore } from '@/store/globalErrorStore';
import { useSuccessMessageStore } from '@/store/successMessageStore'; // Import success message store
import { useRouter } from 'next/navigation';
import client from '@/lib/httpClient'; // Import the axios instance
import { AuthContext } from '@/lib/AuthContext'; // Import AuthContext
import { useContext } from 'react'; // Import useContext

const DeleteAccountButton: React.FC = () => {
  const { showConfirmation, setError } = useGlobalErrorStore();
  const router = useRouter();
  const { logout } = useContext(AuthContext); // Get logout from AuthContext

  const handleDeleteAccount = () => {
    showConfirmation(
      "Delete My Account",
      "This action is irreversible and will permanently delete your account and all associated data. To confirm, please type 'DELETE MY ACCOUNT' in the box below.",
      "DELETE MY ACCOUNT",
      async () => {
        try {
          // Perform the DELETE request to the backend
          await client.delete('/users/me');
          console.log('Account deleted successfully.');
          await logout(); // Call the logout function from AuthContext to clear state and redirect
          const { setSuccessMessage } = useSuccessMessageStore.getState(); // Get the state function
          setSuccessMessage('Your account has been successfully deleted.'); // Set success message
        } catch (error: any) {
          console.error('Failed to delete account:', error);
          let errorMessage = 'Failed to delete account.';
          let errorDescription = 'An unexpected error occurred.';
          let statusCode = undefined;

          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            statusCode = error.response.status;
            if (error.response.data && error.response.data.message) {
              errorDescription = error.response.data.message;
            } else if (error.message) {
              errorDescription = error.message;
            }

            if (statusCode >= 400 && statusCode < 500) {
              errorMessage = 'Client error during account deletion.';
            } else if (statusCode >= 500) {
              errorMessage = 'Server error during account deletion.';
            }
          } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'Network error.';
            errorDescription = 'Please check your internet connection.';
          } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = 'Application error.';
            errorDescription = error.message;
          }

          setError({
            message: errorMessage,
            description: errorDescription,
            statusCode: statusCode,
          });
        }
      },
      () => {
        console.log('Account deletion cancelled by user.');
      }
    );
  };

  return (
    <Button variant="destructive" onClick={handleDeleteAccount}>
      Delete Account
    </Button>
  );
};

export default DeleteAccountButton;
