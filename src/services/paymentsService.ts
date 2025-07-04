import { httpClient } from '../lib/httpClient'; // Using the pre-configured axios instance
import { logger } from '../utils/logger';
import { setGlobalError } from '../store/globalErrorStore';
import { AxiosError } from 'axios';
import { DeleteSavedCardResponse } from '../types/payments';

import { GetSavedCardsResponse } from '../types/payments'; // Import GetSavedCardsResponse type

export class PaymentsService {
  /**
   * Fetches a list of saved payment cards for the current user.
   * @returns A promise that resolves with an array of SavedCard objects or rejects with an error.
   */
  public async getSavedCards(): Promise<GetSavedCardsResponse> {
    try {
      logger.info('Attempting to fetch saved cards.');
      const response = await httpClient.get<GetSavedCardsResponse>('/payments/cards');
      logger.info('Successfully fetched saved cards:', response.data);
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to fetch saved cards.';
      let errorDetails: any = null;

      if (error instanceof AxiosError) {
        errorDetails = error.response?.data || error.message;
        errorMessage += ` ${errorDetails.message || error.message}`;
        logger.error('API Error during fetching saved cards:', error, errorDetails);
      } else if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
        logger.error('Unexpected error during fetching saved cards:', error);
      } else {
        logger.error('Unknown error during fetching saved cards:', error);
      }

      setGlobalError({
        message: errorMessage,
        type: 'error',
        details: errorDetails,
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Deletes a specific saved payment card.
   * @param cardId The unique ID of the card to delete.
   * @returns A promise that resolves with a success confirmation or rejects with an error.
   */
  public async deleteSavedCard(cardId: string): Promise<DeleteSavedCardResponse> {
    try {
      logger.info(`Attempting to delete card with ID: ${cardId}`);
      // The backend expects a 204 No Content for a successful deletion.
      // Axios resolves the promise for 2xx status codes.
      const response = await httpClient.delete<DeleteSavedCardResponse>(
        `/payments/cards/${cardId}`,
      );
      logger.info(`Successfully deleted card with ID: ${cardId}`, response.data);
      return {
        message: `Card ${cardId} deleted successfully.`,
        deletedCardId: cardId,
        success: true,
      };
    } catch (error) {
      let errorMessage = `Failed to delete card with ID: ${cardId}.`;
      let errorDetails: any = null;

      if (error instanceof AxiosError) {
        errorDetails = error.response?.data || error.message;
        errorMessage += ` ${errorDetails.message || error.message}`;
        logger.error('API Error during card deletion:', error, errorDetails);
      } else if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
        logger.error('Unexpected error during card deletion:', error);
      } else {
        logger.error('Unknown error during card deletion:', error);
      }

      // Set global error for UI display
      setGlobalError({
        message: errorMessage,
        type: 'error',
        details: errorDetails,
      });

      // Re-throw the error to allow calling components to handle it further
      throw new Error(errorMessage);
    }
  }
}

// Export an instance of the service for direct use
export const paymentsService = new PaymentsService();
