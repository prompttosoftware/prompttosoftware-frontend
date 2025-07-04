'use client'; // This component needs to be client-side due to hooks like useEffect, useState, useAuth.

import React, { useState, useEffect } from 'react';
import { SavedCardsList } from '../../../../components/payments/SavedCardsList/SavedCardsList';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState'; // Make sure EmptyState is imported
import { useAuth } from '../../../../hooks/useAuth';
import { useGlobalError } from '../../../../hooks/useGlobalError';
import { httpClient } from '../../../../lib/httpClient';
import { SavedCard } from '../../../types/payments'; // Assuming SavedCard is defined here

export default function PaymentsPage() {
  const { isAuthenticated, getAccessToken } = useAuth();
  const { addError } = useGlobalError();

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedCards = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        // Potentially redirect or show a different message if not logged in
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Authentication token not available.");
        }

        const response = await httpClient.get<SavedCard[]>('/payments/cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSavedCards(response.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch saved cards.';
        addError(errorMessage);
        setError(errorMessage);
        setSavedCards([]); // Clear any old data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedCards();
  }, [isAuthenticated, getAccessToken, addError]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        <p>Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      {savedCards.length > 0 ? (
        <SavedCardsList cards={savedCards} />
      ) : (
        <EmptyState message="No saved payment methods found." />
      )}
    </div>
  );
}
