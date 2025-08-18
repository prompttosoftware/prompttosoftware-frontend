/**
 * Request body for creating a payment intent.
 */
export interface CreatePaymentIntentRequest {
  amount: number; // Amount in the smallest currency unit (e.g., cents)
  currency: string; // e.g., "usd", "eur"
  paymentMethodId?: string; // Optional: ID of an existing payment method (e.g., card) to confirm
  returnUrl?: string; // Optional: URL to redirect after payment confirmation
  description?: string; // Optional: Description for the payment
  metadata?: { [key: string]: string }; // Optional: Custom metadata
  saveCard?: boolean; // Optional: Whether to save the card for future use
}

/**
 * Response for retrieving a list of saved cards.
 */
export interface GetSavedCardsResponse {
  cards: SavedCard[];
}

/**
 * Response for deleting a saved card.
 * Typically, a 204 No Content or success message.
 */
export interface DeleteSavedCardResponse {
  message: string;
  deletedCardId: string;
  success: boolean;
}

/**
 * Represents a generic error response from the payments API.
 */
export interface PaymentErrorResponse {
  message: string;
  statusCode: number;
  code?: string; // Optional: A specific error code (e.g., 'invalid_data', 'card_declined')
  param?: string; // Optional: The parameter that caused the error
}

/**
 * Request body for adding ad credit.
 */
export interface AddAdCreditRequest {
  amount: number; // Amount of ad credit to add
  currency: string; // Currency of the ad credit, e.g., "usd"
  paymentMethodId?: string; // Optional: ID of an existing payment method
}

/**
 * Response body for adding ad credit.
 */
export interface AddAdCreditResponse {
  message: string;
  newBalance: number; // The user's new ad credit balance
  currency: string;
  transactionId: string; // Unique ID for the credit transaction
}

// This represents a card fetched from Stripe via our backend
export interface SavedCard {
  id: string; // Stripe PaymentMethod ID (pm_...)
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CreatePaymentIntentAPIResponse {
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
  }
}
