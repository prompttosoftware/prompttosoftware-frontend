// __mocks__/@stripe/stripe-js.ts
import { Stripe, StripeElements, StripeElementsOptions, PaymentIntent, SetupIntent } from '@stripe/stripe-js';

// Define some mock PaymentIntent and SetupIntent data for various scenarios
export const mockPaymentIntentSuccess: PaymentIntent = {
  id: 'pi_mock_success_id',
  client_secret: 'pi_mock_success_secret',
  amount: 1000,
  currency: 'usd',
  status: 'succeeded',
  // Minimal required properties for PaymentIntent
  object: "payment_intent",
  livemode: false,
  shipping: null,
  automatic_payment_methods: null,
  capture_method: "automatic",
  confirmation_method: "automatic",
  created: 1678886400, // Example timestamp
  customer: null,
  description: null,
  last_payment_error: null,
  latest_charge: null,
  metadata: {},
  next_action: null,
  payment_method: "pm_mock_success",
  payment_method_options: {},
  payment_method_types: ["card"],
  receipt_email: null,
  review: null,
  setup_future_usage: null,
  source: null,
  transfer_data: null,
  transfer_group: null,
  application: null,
  application_fee_amount: null,
  invoice: null,
  on_behalf_of: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  transfer_display_text: null,
  usage: "off_session",
};

export const mockPaymentIntentRequiresAction: PaymentIntent = {
  ...mockPaymentIntentSuccess,
  id: 'pi_mock_requires_action_id',
  client_secret: 'pi_mock_requires_action_secret',
  status: 'requires_action',
  next_action: {
    type: 'use_stripe_sdk',
    use_stripe_sdk: {
      stripe_js: 'https://mock-stripe-js-url.com',
    },
  },
};

export const mockPaymentMethodCreationSuccess = {
  paymentMethod: {
    id: "pm_mock_success_card",
    type: "card",
    card: {
      brand: "visa",
      last4: "4242",
      exp_month: 12,
      exp_year: 2024,
    },
    billing_details: {
      email: "test@example.com",
    },
  },
  error: undefined,
};

export const mockPaymentMethodCreationFailure = (code: string, message: string) => ({
  paymentMethod: undefined,
  error: {
    type: "card_error",
    code,
    message,
    param: "card",
  },
});

export const mockConfirmPaymentFailure = (code: string, message: string) => ({
  paymentIntent: undefined,
  error: {
    type: "card_error",
    code,
    message,
    param: "card",
  },
});

export const mockConfirmPaymentSuccess = (paymentIntent: PaymentIntent = mockPaymentIntentSuccess) => ({
  paymentIntent,
  error: undefined,
});

export const mockStripeElements = {
  create: jest.fn(() => ({
    mount: jest.fn(),
    unmount: jest.fn(),
    on: jest.fn(),
    removeEventListener: jest.fn(),
    update: jest.fn(),
    // Add other methods that might be called on an Element
  })),
  getElement: jest.fn(() => ({
      mount: jest.fn(),
      unmount: jest.fn(),
      on: jest.fn(),
      removeEventListener: jest.fn(),
      update: jest.fn(),
  })),
  // Mock for idealBank, auBankAccount, etc. if needed
} as unknown as StripeElements;

export const mockStripe = {
  elements: jest.fn((options?: StripeElementsOptions) => {
    // Logic for handling options if necessary, e.g., for appearance
    return mockStripeElements;
  }),
  confirmCardPayment: jest.fn((clientSecret: string, data?: any, options?: any) => {
    // Simulate different responses based on clientSecret or other data
    if (clientSecret === 'pi_mock_declined_secret') {
      return Promise.resolve(mockConfirmPaymentFailure('card_declined', 'Your card was declined.'));
    }
    if (clientSecret === 'pi_mock_insufficient_funds_secret') {
      return Promise.resolve(mockConfirmPaymentFailure('card_declined', 'Your card has insufficient funds.'));
    }
    if (clientSecret === 'pi_mock_processing_error_secret') {
      return Promise.resolve(mockConfirmPaymentFailure('processing_error', 'An error occurred while processing your card.'));
    }
    if (clientSecret === 'pi_mock_requires_action_secret') {
      return Promise.resolve(mockConfirmPaymentSuccess(mockPaymentIntentRequiresAction));
    }
    return Promise.resolve(mockConfirmPaymentSuccess());
  }),
  confirmPayment: jest.fn((clientSecret: string, data?: any) => {
    if (clientSecret === 'pi_mock_declined_secret') {
      return Promise.resolve(mockConfirmPaymentFailure('card_declined', 'Your card was declined.'));
    }
    if (clientSecret === 'pi_mock_insufficient_funds_secret') {
      return Promise.resolve(mockConfirmPaymentFailure('card_declined', 'Your card has insufficient funds.'));
    }
    if (clientSecret === 'pi_mock_processing_error_secret') {
      return Promise.resolve(mockConfirmPaymentFailure('processing_error', 'An error occurred while processing your card.'));
    }
    if (clientSecret === 'pi_mock_requires_action_secret') {
      return Promise.resolve(mockConfirmPaymentSuccess(mockPaymentIntentRequiresAction));
    }
    return Promise.resolve(mockConfirmPaymentSuccess());
  }),
  createPaymentMethod: jest.fn((type: string, element: any, data?: any) => {
    // Simulate different responses based on data, e.g., specific card numbers
    if (data?.card?.number === '4000000000000002') { // Example for a specific decline
      return Promise.resolve(mockPaymentMethodCreationFailure('incorrect_cvc', 'Your card\'s security code is incorrect.'));
    }
    if (data?.card?.number === '4000000000000003') { // Example for another decline
      return Promise.resolve(mockPaymentMethodCreationFailure('expired_card', 'Your card has expired.'));
    }
    return Promise.resolve(mockPaymentMethodCreationSuccess);
  }),
  // Mock other Stripe methods as needed, e.g., retrievePaymentIntent, handleCardAction, etc.
  retrievePaymentIntent: jest.fn((clientSecret: string) => Promise.resolve({
    paymentIntent: mockPaymentIntentSuccess,
    error: undefined,
  })),
  // Mock setupIntents related methods if your app uses them
  confirmCardSetup: jest.fn((clientSecret: string, data: any) => Promise.resolve({
    setupIntent: {
      id: 'si_mock_success',
      client_secret: clientSecret,
      status: 'succeeded',
    } as SetupIntent,
    error: undefined,
  })),
  confirmSetup: jest.fn((clientSecret: string, data: any) => Promise.resolve({
    setupIntent: {
      id: 'si_mock_success',
      client_secret: clientSecret,
      status: 'succeeded',
    } as SetupIntent,
    error: undefined,
  })),
  createToken: jest.fn(() => Promise.resolve({
    token: { id: 'tok_mock_success' }, error: undefined
  })),
} as unknown as Stripe;

export const loadStripe = jest.fn(() => Promise.resolve(mockStripe));
