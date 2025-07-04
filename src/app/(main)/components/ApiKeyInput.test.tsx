import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ApiKeyInput from './ApiKeyInput';

describe('ApiKeyInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders Input component when hasApiKeyProvided is false', () => {
    render(
      <ApiKeyInput
        hasApiKeyProvided={false}
        value=""
        onChange={mockOnChange}
        placeholder="Test API Key"
      />
    );
    const inputElement = screen.getByPlaceholderText('Test API Key');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'password');
  });

  it('displays "Protected" text when hasApiKeyProvided is true', () => {
    render(
      <ApiKeyInput
        hasApiKeyProvided={true}
        value="some_masked_value"
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter your API Key')).not.toBeInTheDocument();
  });

  it('calls onChange handler when input value changes', () => {
    render(
      <ApiKeyInput
        hasApiKeyProvided={false}
        value=""
        onChange={mockOnChange}
        placeholder="Test API Key"
      />
    );
    const inputElement = screen.getByPlaceholderText('Test API Key');
    fireEvent.change(inputElement, { target: { value: 'new_value' } });
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('displays tooltip content on hover for input field', async () => {
    const user = userEvent.setup();
    render(
      <ApiKeyInput
        hasApiKeyProvided={false}
        value=""
        onChange={mockOnChange}
        placeholder="Test API Key"
      />
    );
    const inputElement = screen.getByPlaceholderText('Test API Key');
    await user.hover(inputElement);
  
    // Verify tooltip content is displayed using data-testid
    const tooltipContent = await screen.findByTestId('tooltip-content-wrapper');
    expect(tooltipContent).toBeInTheDocument();
    expect(tooltipContent).toHaveTextContent('Once entered, your API key will be masked and handled securely.');
  
    await user.unhover(inputElement);
    jest.runAllTimers(); // Advance all timers for tooltip to disappear
    
    // Verify tooltip content is removed from the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-content-wrapper')).not.toBeInTheDocument();
    });
  });
  
  it('displays tooltip content on hover for "Protected" text', async () => {
    const user = userEvent.setup();
    render(
      <ApiKeyInput
        hasApiKeyProvided={true}
        value="some_masked_value"
        onChange={mockOnChange}
      />
    );
    const protectedText = screen.getByText('Protected');
    await user.hover(protectedText);
    act(jest.runAllTimers); // Advance timers for tooltip to appear
    
    // Verify tooltip content is displayed using data-testid
    await waitFor(() => {
      const tooltipContent = screen.getByTestId('tooltip-content-wrapper');
      expect(tooltipContent).toBeInTheDocument();
      expect(tooltipContent).toHaveTextContent('Once entered, your API key will be masked and handled securely.');
    });
    
    await user.unhover(protectedText);
    act(jest.runAllTimers); // Advance all timers for tooltip to disappear
    
    // Verify tooltip content is removed from the DOM
    await waitFor(() => {
      expect(screen.queryByTestId('tooltip-content-wrapper')).not.toBeInTheDocument();
    });
  });

  it('applies provided ID and Name to the input field', () => {
    render(
      <ApiKeyInput
        hasApiKeyProvided={false}
        value=""
        onChange={mockOnChange}
        id="test-id"
        name="test-name"
        placeholder="Test API Key" // Added placeholder for reliable querying
      />
    );
    const inputElement = screen.getByPlaceholderText('Test API Key');
    expect(inputElement).toHaveAttribute('id', 'test-id');
    expect(inputElement).toHaveAttribute('name', 'test-name');
  });
  
  it('disables the input field when disabled prop is true', () => {
    render(
      <ApiKeyInput
        hasApiKeyProvided={false}
        value=""
        onChange={mockOnChange}
        disabled={true}
        placeholder="Test API Key" // Added placeholder for reliable querying
      />
    );
    const inputElement = screen.getByPlaceholderText('Test API Key') as HTMLInputElement;
    expect(inputElement).toBeDisabled();
  });
});
