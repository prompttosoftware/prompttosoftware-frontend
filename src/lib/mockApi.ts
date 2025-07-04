import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from './api'; // Import the axios instance being used by the app
import { CreatePaymentIntentRequest, CreatePaymentIntentResponse, PaymentErrorResponse } from '@/types/payments';

const mock = new MockAdapter(api);

export const setupMockApiErrors = () => {
  // Mock for POST /payments/create-intent to simulate an API error
  mock.onPost('/payments/create-intent').reply(config => {
    const data = JSON.parse(config.data);
    const amount = data.amount;

    // Simulate a generic 500 Internal Server Error for /payments/create-intent
    if (amount === 500) { // Amount 5.00 triggers 500 error
      console.error('MOCK API: Simulating 500 Internal Server Error for /payments/create-intent');
      return [500, {
        message: 'Internal Server Error: Failed to process payment on the backend.',
        statusCode: 500,
      }];
    }

    // Simulate a 400 Bad Request error for /payments/create-intent
    if (amount === 400) { // Amount 4.00 triggers 400 error
      console.error('MOCK API: Simulating 400 Bad Request for /payments/create-intent');
      return [400, {
        message: 'Bad Request: Invalid payment data provided.',
        statusCode: 400,
        code: 'invalid_data'
      }];
    }

    // Default successful response if no error is triggered
    console.log('MOCK API: Responding with success for /payments/create-intent');
    const mockResponse: CreatePaymentIntentResponse = {
      clientSecret: 'pi_mock_success_secret',
      paymentIntentId: 'pi_mock_success_id',
      amount: amount,
      currency: 'usd',
      status: 'succeeded', // Or 'requires_action' if you want to simulate 3DS
    };
    return [200, mockResponse];
  }, 500); // Simulate network delay

  // Add other mocks here as needed for other endpoints or error types
};

export const restoreMockApi = () => {
  mock.restore();
};

// Optional: Listen for specific commands or environment variables to enable/disable mocks
if (process.env.NEXT_PUBLIC_MOCK_API_ERRORS === 'true') {
  console.warn('---- MOCK API ERRORS ARE ENABLED ----');
  setupMockApiErrors();
}
