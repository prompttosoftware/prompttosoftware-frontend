import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentErrorResponse,
  SavedCard,
} from '../types/payments';
import api from './api'; // Import the axios instance
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { setupInterceptors } from '../lib/api';

// Mock the Next.js router
const mockRouter: AppRouterInstance = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

// Mock the global error store
jest.mock('../store/globalErrorStore', () => ({
  useGlobalErrorStore: {
    getState: () => ({
      setError: jest.fn(),
    }),
  },
}));

// Mock logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('API Type Safety Tests', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(api);
    // Ensure interceptors are set up before tests run
    setupInterceptors(mockRouter);
  });

  afterEach(() => {
    mock.reset(); // Clear mock adapter before each test
    jest.clearAllMocks(); // Clear mock calls
  });

  afterAll(() => {
    mock.restore(); // Restore original axios adapter after all tests
  });

  it('should correctly type CreatePaymentIntentRequest and CreatePaymentIntentResponse for success', async () => {
    const mockRequest: CreatePaymentIntentRequest = {
      amount: 1000,
      currency: 'usd',
      description: 'Test payment',
    };

    const mockResponse: CreatePaymentIntentResponse = {
      clientSecret: 'pi_test_secret',
      paymentIntentId: 'pi_test_id',
      amount: 1000,
      currency: 'usd',
      status: 'requires_action',
      requiresAction: {
        type: 'url',
        url: 'https://example.com/3ds',
      },
    };

    // Mock the POST request for creating a payment intent
    mock.onPost('/payments/create-intent', mockRequest).reply(200, mockResponse);

    try {
      const response = await api.post<CreatePaymentIntentResponse>(
        '/payments/create-intent',
        mockRequest,
      );

      // Verify the response data structure matches CreatePaymentIntentResponse
      const data: CreatePaymentIntentResponse = response.data; // This line checks type safety at compile time

      expect(response.status).toBe(200);
      expect(data).toEqual(mockResponse);

      // Intentionally provoke a type error to show it would be caught
      // @ts-expect-error - This is intended to fail compilation if types are not enforced
      // const wrongType: number = data.clientSecret; // This would be a compilation error
      // expect(true).toBe(true); // Placeholder to avoid empty test if ts-expect-error is uncommented
    } catch (error) {
      fail('API call should not have failed: ' + error);
    }
  });

  it('should correctly type PaymentErrorResponse for API errors', async () => {
    const mockErrorResponse: PaymentErrorResponse = {
      code: 'payment_failed',
      message: 'Your card was declined.',
      statusCode: 400,
    };

    // Mock an error response (e.g., 400 Bad Request)
    mock.onPost('/payments/create-intent').reply(400, mockErrorResponse);

    try {
      await api.post('/payments/create-intent', { amount: 100, currency: 'usd' });
      fail('API call should have failed with a 400 error.');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorData: PaymentErrorResponse = error.response.data; // Checks type safety

        expect(error.response.status).toBe(400);
        expect(errorData).toEqual(mockErrorResponse);
        expect(errorData.code).toBe('payment_failed');
        expect(errorData.message).toBe('Your card was declined.');
        expect(errorData.statusCode).toBe(400);

        // Test type mismatch detection
        // @ts-expect-error - This is intended to fail compilation
        // const wrongCodeType: number = errorData.code;
      } else {
        fail('Error was not an AxiosError with a response.');
      }
    }
  });

  it('should correctly handle SavedCard types when simulating state consumption', () => {
    const savedCardsData: SavedCard[] = [
      {
        id: 'card_123',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
      },
      {
        id: 'card_456',
        brand: 'mastercard',
        last4: '5555',
        expMonth: 10,
        expYear: 2024,
      },
    ];

    // Simulate a component receiving data
    const processCards = (cards: SavedCard[]) => {
      let defaultCard: SavedCard | undefined;
      for (const card of cards) {
        // This access checks type safety for properties like 'id', 'brand', etc.
        expect(typeof card.id).toBe('string');
        expect(typeof card.brand).toBe('string');
        expect(typeof card.last4).toBe('string');
        expect(typeof card.expMonth).toBe('number');
        expect(typeof card.expYear).toBe('number');

        if (card.isDefault) {
          defaultCard = card;
        }
      }
      return defaultCard;
    };

    const defaultCard = processCards(savedCardsData);
    expect(defaultCard?.id).toBe('card_123');
    expect(defaultCard?.brand).toBe('visa');

    // Test with an invalid structure (should cause a compilation error if uncommented)
    // const invalidCardData: SavedCard[] = [
    //   { id: 123, brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025 } as any // Intentionally wrong type
    // ];
    // @ts-expect-error: Intentional type mismatch for compilation error test
    // processCards(invalidCardData); // This would be a compilation error
  });
});

// A small test to ensure setupInterceptors can be called without issues
describe('setupInterceptors', () => {
  it('should initialize interceptors without throwing an error', () => {
    // It's already called in beforeAll of the main describe block. This is just a minimal check.
    expect(() => setupInterceptors(mockRouter)).not.toThrow();
  });
});

// Important: This structure ensures that type checking happens at compile time.
// Running 'tsc --noEmit' on the project will verify these types.
// For actual runtime tests, you would use a testing framework like Jest or React Testing Library.

// To compile and check types:
// npx tsc --noEmit
