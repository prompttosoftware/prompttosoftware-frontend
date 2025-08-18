// lib/payments.ts
import { CreatePaymentIntentAPIResponse, CreatePaymentIntentRequest, CreatePaymentIntentResponse, SavedCard } from '@/types/payments';
import { httpClient } from '@/lib/httpClient';
import { FAKE_CARDS } from '@/lib/dev/fakeData';

export async function createPaymentIntent(
  payload: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {

    if (
        process.env.NEXT_PUBLIC_FAKE_AUTH === 'true' &&
        process.env.NODE_ENV === 'development'
    ) {
        return {
            clientSecret: process.env.NEXT_PUBLIC_STRIPE_TEST_CLIENT_SECRET as string,
            paymentIntentId: '',
            amount: 5,
            currency: 'usd',
            status: 'requires_confirmation',
        }
    }

    const { data } = await httpClient.post<
        CreatePaymentIntentRequest,
        CreatePaymentIntentAPIResponse
    >('/payments/create-intent', payload);
    return data;
}

// Fetch saved payment methods from our backend
  export async function getSavedCards(): Promise<SavedCard[]> {
    if (
        process.env.NEXT_PUBLIC_FAKE_AUTH === 'true' &&
        process.env.NODE_ENV === 'development'
    ) {
        return FAKE_CARDS;
    }
    const { data } = await httpClient.get<SavedCard[]>('/payments/cards');
    return data;
  }

  // Detach a saved payment method via our backend
  export async function deleteSavedCard(cardId: string): Promise<{ message: string }> {
    const { data } = await httpClient.delete<{ message: string }>(`/payments/cards/${cardId}`);
    return data;
  }
