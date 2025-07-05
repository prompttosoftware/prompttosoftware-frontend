// __mocks__/@stripe/react-stripe-js.ts
import React from 'react';
import { mockStripe, mockStripeElements } from './stripe-js';
import { StripeContext, ElementsContext } from '@stripe/react-stripe-js/dist/react-stripe-js.cjs'; // This import path might be brittle, check react-stripe-js package exports if issues

// Mock the useStripe hook
export const useStripe = jest.fn(() => mockStripe);

// Mock the useElements hook
export const useElements = jest.fn(() => mockStripeElements);

// Mock the Elements component
// This component provides the context for useStripe and useElements.
// In tests, we can simply render its children directly or provide a simplified context.
export const Elements = ({ children, stripe, options }: any) => {
  // In a testing environment, we don't need the actual Stripe context.
  // We can just render the children, as useStripe and useElements are mocked globally.
  // If you need to test option passing, you might augment this.
  return React.createElement(React.Fragment, null, children);
};
Elements.displayName = 'Elements';

// If you need to mock specific context values for some tests,
// you might consider providing a more detailed mock context here.
// For most cases, mocking the hooks themselves is sufficient.
// export const StripeProvider = ({ children }: { children: React.ReactNode }) => (
//   <StripeContext.Provider value={mockStripe as any}>
//     <ElementsContext.Provider value={mockStripeElements as any}>
//       {children}
//     </ElementsContext.Provider>
//   </StripeContext.Provider>
// );

// Export any other components or hooks you might use if necessary, e.g., CardElement, etc.
export const CardElement = jest.fn(() => React.createElement('div', null, 'Mock CardElement'));
export const PwaConfirmButton = jest.fn(() => React.createElement('button', null, 'Mock PwaConfirmButton'));
export const AdyenCheckout = jest.fn(() => React.createElement('div', null, 'Mock AdyenCheckout'));
export const Fincode = jest.fn(() => React.createElement('div', null, 'Mock Fincode'));
export const IdealBankElement = jest.fn(() => React.createElement('div', null, 'Mock IdealBankElement'));
export const AuBankAccountElement = jest.fn(() => React.createElement('div', null, 'Mock AuBankAccountElement'));
export const PaymentElement = jest.fn(() => React.createElement('div', null, 'Mock PaymentElement'));
export const LinkAuthenticationElement = jest.fn(() => React.createElement('div', null, 'Mock LinkAuthenticationElement'));
export const AddressElement = jest.fn(() => React.createElement('div', null, 'Mock AddressElement'));
export const ExpressCheckoutElement = jest.fn(() => React.createElement('div', null, 'Mock ExpressCheckoutElement'));
export const PaymentRequestButtonElement = jest.fn(() => React.createElement('div', null, 'Mock PaymentRequestButtonElement'));
export const AffirmElement = jest.fn(() => React.createElement('div', null, 'Mock AffirmElement'));
export const AfterpayClearpayMessageElement = jest.fn(() => React.createElement('div', null, 'Mock AfterpayClearpayMessageElement'));
export const AfterpayClearpayButtonsElement = jest.fn(() => React.createElement('div', null, 'Mock AfterpayClearpayButtonsElement'));
export const KlarnaElement = jest.fn(() => React.createElement('div', null, 'Mock KlarnaElement'));
export const PayPalMessageElement = jest.fn(() => React.createElement('div', null, 'Mock PayPalMessageElement'));
export const PayPalButtonsElement = jest.fn(() => React.createElement('div', null, 'Mock PayPalButtonsElement'));
export const AubecsDebitElement = jest.fn(() => React.createElement('div', null, 'Mock AubecsDebitElement'));
export const BancontactElement = jest.fn(() => React.createElement('div', null, 'Mock BancontactElement'));
export const EpsElement = jest.fn(() => React.createElement('div', null, 'Mock EpsElement'));
export const GiropayElement = jest.fn(() => React.createElement('div', null, 'Mock GiropayElement'));
export const GrabpayElement = jest.fn(() => React.createElement('div', null, 'Mock GrabpayElement'));
export const OxxoElement = jest.fn(() => React.createElement('div', null, 'Mock OxxoElement'));
export const P24Element = jest.fn(() => React.createElement('div', null, 'Mock P24Element'));
export const SepaDebitElement = jest.fn(() => React.createElement('div', null, 'Mock SepaDebitElement'));
export const SofortElement = jest.fn(() => React.createElement('div', null, 'Mock SofortElement'));
export const WeChatPayElement = jest.fn(() => React.createElement('div', null, 'Mock WeChatPayElement'));
export const CvcElement = jest.fn(() => React.createElement('div', null, 'Mock CvcElement'));
export const CardNumberElement = jest.fn(() => React.createElement('div', null, 'Mock CardNumberElement'));
export const CardExpiryElement = jest.fn(() => React.createElement('div', null, 'Mock CardExpiryElement'));
export const IbanElement = jest.fn(() => React.createElement('div', null, 'Mock IbanElement'));
