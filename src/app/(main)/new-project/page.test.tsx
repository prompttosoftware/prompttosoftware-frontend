import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import NewProjectPage from './page'; // Adjust the import path as necessary
import { useGlobalError } from '@/hooks/useGlobalError'; // Added import for useGlobalError

// Mock the useRouter hook from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// Mock the useGlobalError hook
const mockSetError = jest.fn();
const mockClearError = jest.fn();

jest.mock('@/hooks/useGlobalError', () => ({
  useGlobalError: () => ({
    setError: mockSetError,
    clearError: mockClearError,
  }),
}));

const handlers = [
  // Default handler for success scenario based on initial page.tsx logic
  http.post('/api/projects', async ({ request }) => {
    // Change signature to use request directly
    console.log('MSW Handler - Request body:', await request.json()); // Can log request body here
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay
    return HttpResponse.json(
      { projectId: 'proj_test_123', message: 'Project created successfully!' },
      { status: 201 },
    );
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('NewProjectPage Unit Tests', () => {
  it('renders the form fields correctly', () => {
    render(<NewProjectPage />);

    expect(screen.getByRole('textbox', { name: /project description/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /max runtime \(hours\)/i })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /max budget \(\$\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
  });

  it('displays required validation error for description', async () => {
    render(<NewProjectPage />);

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    // Wait for the validation message to appear
    await waitFor(() => {
      expect(screen.getByText(/project description is required/i)).toBeInTheDocument();
    });
  });

  it('displays positive number validation error for Max Runtime (Hours)', async () => {
    render(<NewProjectPage />);
  
    const maxRuntimeInput = screen.getByRole('spinbutton', { name: /max runtime \(hours\)/i });
    fireEvent.change(maxRuntimeInput, { target: { value: '-10' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
  
    await waitFor(() => {
      expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument();
    });
    
    fireEvent.change(maxRuntimeInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
    
    await waitFor(() => {
      expect(screen.getAllByText(/Must be a positive number/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays positive number validation error for Max Budget', async () => {
    render(<NewProjectPage />);
  
    const maxBudgetInput = screen.getByRole('spinbutton', { name: /max budget \(\$\)/i });
    fireEvent.change(maxBudgetInput, { target: { value: '-50' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
  
    await waitFor(() => {
      expect(screen.getByText(/must be a positive number/i)).toBeInTheDocument();
    });
  
    fireEvent.change(maxBudgetInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));
  
    await waitFor(() => {
      expect(screen.getAllByText(/Must be a positive number/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not display validation errors when inputs are valid', async () => {
    render(<NewProjectPage />);

    fireEvent.change(screen.getByRole('textbox', { name: /project description/i }), {
      target: { value: 'Valid description' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max runtime \(hours\)/i }), { target: { value: '10' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max budget \(\$\)/i }), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    // Wait for any potential validation message to NOT appear, or for the submission process to start
    await waitFor(
      () => {
        expect(screen.queryByRole('paragraph', { name: /project description is required/i })).not.toBeInTheDocument();
        expect(screen.queryAllByRole('paragraph', { name: /must be a positive number/i })).toHaveLength(0);
      },
      { timeout: 1000 },
    ); // Short timeout as we expect things to NOT appear quickly
  });

  it('toggles the Advanced Options section visibility', async () => {
    render(<NewProjectPage />);

    const advancedOptionsButton = screen.getByRole('button', { name: /Advanced Options/i });
    // Get the advanced options content div using the data-testid
    let advancedOptionsContent = screen.getByTestId('advanced-options-content');

    // Initially, the content should be hidden by classes, and its inner text not visible
    expect(advancedOptionsButton).toHaveAttribute('aria-expanded', 'false');
    expect(advancedOptionsContent).toHaveClass('max-h-0');
    expect(advancedOptionsContent).toHaveClass('opacity-0');
    expect(screen.queryByText(/Utility AI Models/i)).not.toBeVisible();

    // Click to expand
    fireEvent.click(advancedOptionsButton);

    // After click, content should be visible (aria-expanded true, max-h and opacity classes removed or changed)
    await waitFor(() => {
      expect(advancedOptionsButton).toHaveAttribute('aria-expanded', 'true');
      expect(advancedOptionsContent).not.toHaveClass('max-h-0');
      expect(advancedOptionsContent).not.toHaveClass('opacity-0');
      expect(screen.getByText(/Utility AI Models/i)).toBeVisible(); // Now the text should be visible
    });

    // Click again to collapse
    fireEvent.click(advancedOptionsButton);

    // After second click, content should be hidden again
    await waitFor(() => {
      expect(advancedOptionsButton).toHaveAttribute('aria-expanded', 'false');
      expect(advancedOptionsContent).toHaveClass('max-h-0');
      expect(advancedOptionsContent).toHaveClass('opacity-0');
      expect(screen.queryByText(/Utility AI Models/i)).not.toBeVisible(); // Text should no longer be visible
    });
  });
});

describe('NewProjectPage Integration Tests (MSW)', () => {
  // Use the mockSetError defined globally for the mock
  // This cannot be destructured from useGlobalError() here as it would create a new mock.
  // We directly use the global mockSetError.

  beforeEach(() => {
    mockSetError.mockClear(); // Clear mock calls before each test
  });

  it('handles successful project creation (201 Created)', async () => {
    render(<NewProjectPage />);

    fireEvent.change(screen.getByRole('textbox', { name: /project description/i }), {
      target: { value: 'A new project description' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max runtime \(hours\)/i }), { target: { value: '5' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max budget \(\$\)/i }), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Starting.../i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument(); // Button text reverts after submission
      expect(mockSetError).toHaveBeenCalledWith(null); // Should have cleared any global errors
      expect(mockSetError).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'error' })); // No actual error messages should be set
      expect(mockSetError).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' })); // No actual warning messages should be set
    });

    // The current page.tsx uses an alert for success, which is not ideal for testing.
    // We can mock window.alert or verify console logs until proper routing/feedback is implemented.
    // For now, we'll verify the button state change and lack of global error.
  });

  it('handles API validation errors (400 Bad Request)', async () => {
    server.use(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      http.post('/api/projects', async ({ request }) => {
        return HttpResponse.json(
          {
            message: 'Validation failed for one or more fields.',
            errors: {
              description: 'Description cannot contain special characters.',
              maxRuntimeHours: 'Max runtime cannot exceed 1000 hours.',
            },
          },
          { status: 400 },
        );
      }),
    );

    render(<NewProjectPage />);

    fireEvent.change(screen.getByRole('textbox', { name: /project description/i }), {
      target: { value: 'Invalid Description!' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max runtime \(hours\)/i }), {
      target: { value: '1200' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max budget \(\$\)/i }), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Description cannot contain special characters./i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Max runtime cannot exceed 1000 hours./i)).toBeInTheDocument();
      expect(mockSetError).toHaveBeenCalledWith({
        message: 'Please check the form for errors.',
        type: 'warning',
      });
    });

    // Ensure other fields without errors don't show the error message.
    expect(screen.queryByText(/Must be a positive number/i)).not.toBeInTheDocument();
  });

  it('handles general API errors (500 Internal Server Error)', async () => {
    server.use(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      http.post('/api/projects', async ({ request }) => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }),
    );

    render(<NewProjectPage />);

    fireEvent.change(screen.getByRole('textbox', { name: /project description/i }), {
      target: { value: 'Valid description for server error test' },
    });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max runtime \(hours\)/i }), { target: { value: '10' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /max budget \(\$\)/i }), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        type: 'error',
      });
    });
  });
});
