import * as PaymentsModule from './paymentsService';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers'; // Import your MSW handlers
import { HttpResponse, http } from 'msw'; // Import http and HttpResponse
import { httpClient } from '../lib/httpClient'; // Import the httpClient
import { setGlobalError } from '../store/globalErrorStore';

// Mock logger to prevent console output during tests
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock setGlobalError to prevent side effects in tests
jest.mock('../store/globalErrorStore', () => ({
  setGlobalError: jest.fn(),
}));

const server = setupServer(...handlers);

describe('PaymentsService Integration Tests', () => {
  let paymentsService: PaymentsModule.PaymentsService; // Declare paymentsService here

  // Before all tests, start the MSW server
  beforeAll(() => {
    server.listen();
    // Instantiate the service before tests run
    paymentsService = new PaymentsModule.PaymentsService();
    // Set a default authorization header for httpClient for all tests
    // This mimics a logged-in state for API calls.
    httpClient.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token';
  });

  // After each test, reset any request handlers that are overridden in individual tests
  afterEach(() => {
    server.resetHandlers();
    // Clear mock calls
    (setGlobalError as jest.Mock).mockClear();
  });

  // After all tests, stop the MSW server
  afterAll(() => {
    server.close();
    // Clean up the authorization header
    delete httpClient.defaults.headers.common['Authorization'];
  });

  describe('getSavedCards', () => {
    it('should fetch saved cards successfully', async () => {
      const result = await paymentsService.getSavedCards();
      expect(result.cards).toBeInstanceOf(Array);
      expect(result.cards.length).toBeGreaterThan(0);
      expect(result.cards[0]).toHaveProperty('id');
      expect(result.cards[0]).toHaveProperty('brand');
      expect(result.cards[0]).toHaveProperty('last4');
    });

    it('should fetch an empty list of cards when none are available', async () => {
      // Override the default handler for this specific test case
      server.use(
        http.get('/api/payments/cards', () => {
          return HttpResponse.json({ cards: [] });
        })
      );

      const result = await paymentsService.getSavedCards();
      expect(result.cards).toEqual([]);
    });


    it('should handle API error gracefully when fetching cards', async () => {
      // Override the default handler to return an error for this specific test
      server.use(
        http.get('/api/payments/cards', () => {
          return HttpResponse.json({ message: 'Failed to retrieve cards due to a server error.' }, { status: 500 });
        })
      );

      await expect(paymentsService.getSavedCards()).rejects.toThrow('Failed to fetch saved cards. Failed to retrieve cards due to a server error.');
      expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Failed to fetch saved cards.'),
        type: 'error',
      }));
    });

    it('should handle unauthorized access when fetching cards', async () => {
      // Temporarily remove the auth token to simulate unauthorized access
      delete httpClient.defaults.headers.common['Authorization'];

      await expect(paymentsService.getSavedCards()).rejects.toThrow(
        'Failed to fetch saved cards. Request failed with status code 401'
      );
      expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Failed to fetch saved cards.'),
        type: 'error',
        details: expect.stringContaining('Request failed with status code 401')
      }));

      // Restore the auth token for subsequent tests
      httpClient.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token';
    });
  });

  describe('deleteSavedCard', () => {
    it('should delete a saved card successfully', async () => {
      const cardIdToDelete = 'card_123abc'; // Use an ID that isn't a special error case
      const result = await paymentsService.deleteSavedCard(cardIdToDelete);
      expect(result).toEqual({
        message: `Card ${cardIdToDelete} deleted successfully.`,
        deletedCardId: cardIdToDelete,
        success: true,
      });
    });

    it('should handle card not found error during deletion', async () => {
      const cardIdNotFound = 'card_not_found';
      await expect(paymentsService.deleteSavedCard(cardIdNotFound)).rejects.toThrow(
        `Failed to delete card with ID: ${cardIdNotFound}. Request failed with status code 404`
      );
      expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining(`Failed to delete card with ID: ${cardIdNotFound}.`),
        type: 'error',
        details: expect.stringContaining('Request failed with status code 404')
      }));
    });

    it('should handle general API error during deletion', async () => {
      const cardIdError = 'card_error_delete';
      await expect(paymentsService.deleteSavedCard(cardIdError)).rejects.toThrow(
        `Failed to delete card with ID: ${cardIdError}. Request failed with status code 500`
      );
      expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining(`Failed to delete card with ID: ${cardIdError}.`),
        type: 'error',
        details: expect.stringContaining('Request failed with status code 500')
      }));
    });

    it('should handle unauthorized access when deleting a card', async () => {
      // Temporarily remove the auth token to simulate unauthorized access
      delete httpClient.defaults.headers.common['Authorization'];
      const cardId = 'any_card_id';

      await expect(paymentsService.deleteSavedCard(cardId)).rejects.toThrow(
        `Failed to delete card with ID: ${cardId}. Request failed with status code 401`
      );
      expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining(`Failed to delete card with ID: ${cardId}.`),
        type: 'error',
        details: expect.stringContaining('Request failed with status code 401')
      }));

      // Restore the auth token for subsequent tests
      httpClient.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token';
    });
  });

describe('createPaymentIntent', () => {
  it('should create a payment intent successfully', async () => {
    const amount = 10000; // Example amount in cents (e.g., $100.00)
    const currency = 'usd';
    const paymentMethodId = 'pm_card_visa'; // Example mock payment method ID
    const description = 'Test payment intent';

    const result = await paymentsService.createPaymentIntent({ amount, currency, paymentMethodId, description });

    expect(result).toHaveProperty('clientSecret');
    expect(result).toHaveProperty('paymentIntentId');
    expect(result.amount).toBe(amount);
    expect(result.currency).toBe(currency);
    expect(result.status).toBe('requires_action');
    expect(result).toHaveProperty('requiresAction');
    expect(result.requiresAction).toHaveProperty('url');
  });

  it('should handle generic payment intent creation failure (400)', async () => {
    const amount = 1313; // Amount configured in MSW to simulate generic failure
    const currency = 'usd';
    const paymentMethodId = 'pm_card_test';
    const description = 'Test generic failure';

    await expect(paymentsService.createPaymentIntent({ amount, currency, paymentMethodId, description })).rejects.toThrow(
      'Failed to create payment intent. Payment intent creation failed: Invalid amount or details.'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to create payment intent.'),
      type: 'error',
      details: expect.stringContaining('Invalid amount or details.'),
    }));
  });

  it('should handle card decline failure (402)', async () => {
    const amount = 50000; // Amount configured in MSW to simulate card decline
    const currency = 'usd';
    const paymentMethodId = 'pm_card_charge_fail'; // Payment method ID configured in MSW for decline
    const description = 'Test card decline';

    await expect(paymentsService.createPaymentIntent({ amount, currency, paymentMethodId, description })).rejects.toThrow(
      'Failed to create payment intent. Payment declined by card issuer.'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to create payment intent.'),
      type: 'error',
      details: expect.stringContaining('Payment declined by card issuer.'),
    }));
  });

  it('should handle internal server error during intent creation (500)', async () => {
    const amount = 99999; // Amount configured in MSW to simulate server error
    const currency = 'usd';
    const paymentMethodId = 'pm_card_test';
    const description = 'Test server error';

    await expect(paymentsService.createPaymentIntent({ amount, currency, paymentMethodId, description })).rejects.toThrow(
      'Failed to create payment intent. Internal server error during payment intent creation.'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to create payment intent.'),
      type: 'error',
      details: expect.stringContaining('Internal server error during payment intent creation.'),
    }));
  });

  it('should handle unauthorized access when creating a payment intent', async () => {
    // Temporarily remove the auth token to simulate unauthorized access
    delete httpClient.defaults.headers.common['Authorization'];
    const amount = 1000;
    const currency = 'usd';
    const paymentMethodId = 'pm_card_test';
    const description = 'Test unauthorized';

    await expect(paymentsService.createPaymentIntent({ amount, currency, paymentMethodId, description })).rejects.toThrow(
      'Failed to create payment intent. Request failed with status code 401'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to create payment intent.'),
      type: 'error',
      details: expect.stringContaining('Request failed with status code 401')
    }));

    // Restore the auth token for subsequent tests
    httpClient.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token';
  });
});

describe('addAdCredit', () => {
  it('should add ad credit successfully', async () => {
    const amount = 1000; // Example amount
    const currency = 'usd'; // Example currency
    
    const result = await paymentsService.addAdCredit({ amount, currency });

    expect(result).toHaveProperty('newBalance');
    expect(result).toHaveProperty('creditedAmount');
    expect(result.creditedAmount).toBe(1000); // Fixed amount in MSW handler
    expect(result.newBalance).toBeDefined();
  });

  it('should handle ad credit failure (400)', async () => {
    const amount = 999; // Amount configured in MSW to simulate failure
    const currency = 'usd';
    
    await expect(paymentsService.addAdCredit({ amount, currency })).rejects.toThrow(
      'Failed to add ad credit. Ad credit failed: Invalid ad session or ad not fully watched.'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to add ad credit.'),
      type: 'error',
      details: expect.stringContaining('Invalid ad session or ad not fully watched.'),
    }));
  });

  it('should handle internal server error during ad credit (500)', async () => {
    const amount = 555; // Amount configured in MSW to simulate server error
    const currency = 'usd';
    
    await expect(paymentsService.addAdCredit({ amount, currency })).rejects.toThrow(
      'Failed to add ad credit. Internal server error while processing ad credit.'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to add ad credit.'),
      type: 'error',
      details: expect.stringContaining('Internal server error while processing ad credit.'),
    }));
  });

  it('should handle unauthorized access when adding ad credit', async () => {
    // Temporarily remove the auth token to simulate unauthorized access
    delete httpClient.defaults.headers.common['Authorization'];
    const amount = 1000; // Any amount will do as auth check happens first
    const currency = 'usd';
    
    await expect(paymentsService.addAdCredit({ amount, currency })).rejects.toThrow(
      'Failed to add ad credit. Request failed with status code 401'
    );
    expect(setGlobalError).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.stringContaining('Failed to add ad credit.'),
      type: 'error',
      details: expect.stringContaining('Request failed with status code 401')
    }));

    // Restore the auth token for subsequent tests
    httpClient.defaults.headers.common['Authorization'] = 'Bearer mock-jwt-token';
  });
});
});
