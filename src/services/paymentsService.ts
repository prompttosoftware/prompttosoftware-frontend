import { httpClient } from '@/lib/httpClient'; // Using the pre-configured axios instance
import { logger } from '@/utils/logger';
import { setGlobalError } from '@/store/globalErrorStore';
import { AxiosError } from 'axios';
import { DeleteSavedCardResponse, CreatePaymentIntentRequest, CreatePaymentIntentResponse, AddAdCreditRequest, AddAdCreditResponse, GetSavedCardsResponse } from '../types/payments';

export class PaymentsService {
  /**
   * Fetches a list of saved payment cards for the current user.
   * @returns A promise that resolves with an array of SavedCard objects or rejects with an error.
   */
  public async getSavedCards(): Promise<GetSavedCardsResponse> {
    try {
      logger.info('Attempting to fetch saved cards.');
      const response = await httpClient.get<GetSavedCardsResponse>('/api/payments/cards');
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
        `/api/payments/cards/${cardId}`,
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
      });

      // Re-throw the error to allow calling components to handle it further
      throw new Error(errorMessage);
    }
  }

  /**
   * Creates a payment intent for a new transaction.
   * @param data The request body for creating a payment intent.
   * @returns A promise that resolves with the CreatePaymentIntentResponse or rejects with an error.
   */
  public async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      logger.info('Attempting to create payment intent.', data);
      const response = await httpClient.post<CreatePaymentIntentResponse>('/api/payments/create-intent', data);
      logger.info('Successfully created payment intent:', response.data);
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to create payment intent.';
      let errorDetails: any = null;

      if (error instanceof AxiosError) {
        errorDetails = error.response?.data || error.message;
        errorMessage += ` ${errorDetails.message || error.message}`;
        logger.error('API Error during payment intent creation:', error, errorDetails);
      } else if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
        logger.error('Unexpected error during payment intent creation:', error);
      } else {
        logger.error('Unknown error during payment intent creation:', error);
      }

      setGlobalError({
        message: errorMessage,
        type: 'error',
      });

      throw new Error(errorMessage);
    }
  }

  /**
   * Adds ad credit to the user's account.
   * @param data The request body for adding ad credit.
   * @returns A promise that resolves with the AddAdCreditResponse or rejects with an error.
   */
  public async addAdCredit(data: AddAdCreditRequest): Promise<AddAdCreditResponse> {
    try {
      logger.info('Attempting to add ad credit.', data);
      const response = await httpClient.post<AddAdCreditResponse>('/api/ads/credit', data);
      logger.info('Successfully added ad credit:', response.data);
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to add ad credit.';
      let errorDetails: any = null;

      if (error instanceof AxiosError) {
        errorDetails = error.response?.data || error.message;
        errorMessage += ` ${errorDetails.message || error.message}`;
        logger.error('API Error during adding ad credit:', error, errorDetails);
      } else if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
        logger.error('Unexpected error during adding ad credit:', error);
      } else {
        logger.error('Unknown error during adding ad credit:', error);
      }

      setGlobalError({
        message: errorMessage,
        type: 'error',
      });

      throw new Error(errorMessage);
    }
  }
}

// Export an instance of the service for direct use
export const paymentsService = new PaymentsService();
