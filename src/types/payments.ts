/**
 * Represents a single saved payment card.
 */
export interface SavedCard {
  id: string; // Unique identifier for the card
  brand: string; // e.g., "visa", "mastercard"
  last4: string; // Last four digits of the card number
  expiryMonth: number; // Expiration month (1-12)
  expiryYear: number; // Expiration year (YYYY)
  fingerprint?: string; // Optional: unique identifier for the card number
  cardHolderName?: string; // Optional: Name of the card holder
  isDefault?: boolean; // Optional: Indicates if this is the user's default card
}

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
 * Response body for creating a payment intent.
 * This typically includes a client secret for client-side payment confirmation.
 */
export interface CreatePaymentIntentResponse {
  clientSecret: string; // The client secret to be used with the payment client SDK
  paymentIntentId: string; // Unique ID of the payment intent
  amount: number;
  currency: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled';
  requiresAction?: {
    type: 'url' | 'redirect';
    url: string;
  }; // Optional: For 3D secure or other actions
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
