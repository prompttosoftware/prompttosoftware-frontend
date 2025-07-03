import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import NewProjectPage from './page'; // Adjust the import path as necessary

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
jest.mock('@/hooks/useGlobalError', () => ({
  useGlobalError: () => ({
    setError: jest.fn(),
    clearError: jest.fn(),
  }),
}));

const handlers = [
  // Default handler for success scenario based on initial page.tsx logic
  http.post('/api/projects', async ({ request }) => { // Change signature to use request directly
    console.log("MSW Handler - Request body:", await request.json()); // Can log request body here
    return HttpResponse.json(
      { projectId: 'proj_test_123', message: 'Project created successfully!' },
      { status: 201 }
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

    expect(screen.getByLabelText(/Project Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Runtime \(Hours\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Budget \(\$\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
  });

  it('displays required validation error for description', async () => {
    render(<NewProjectPage />);

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    // Wait for the validation message to appear
    await waitFor(() => {
      expect(screen.getByText(/Project description is required/i)).toBeInTheDocument();
    });
  });

  it('displays positive number validation error for Max Runtime (Hours)', async () => {
    render(<NewProjectPage />);

    const maxRuntimeInput = screen.getByLabelText(/Max Runtime \(Hours\)/i);
    fireEvent.change(maxRuntimeInput, { target: { value: '-10' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByText(/Must be a positive number/i)).toBeInTheDocument();
    });

    fireEvent.change(maxRuntimeInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Must be a positive number/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays positive number validation error for Max Budget', async () => {
    render(<NewProjectPage />);

    const maxBudgetInput = screen.getByLabelText(/Max Budget \(\$\)/i);
    fireEvent.change(maxBudgetInput, { target: { value: '-50' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByText(/Must be a positive number/i)).toBeInTheDocument();
    });

    fireEvent.change(maxBudgetInput, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Must be a positive number/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not display validation errors when inputs are valid', async () => {
    render(<NewProjectPage />);

    fireEvent.change(screen.getByLabelText(/Project Description/i), { target: { value: 'Valid description' } });
    fireEvent.change(screen.getByLabelText(/Max Runtime \(Hours\)/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Budget \(\$\)/i), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    // Wait for any potential validation message to NOT appear, or for the submission process to start
    await waitFor(() => {
      expect(screen.queryByText(/Project description is required/i)).not.toBeInTheDocument();
      expect(screen.queryAllByText(/Must be a positive number/i)).toHaveLength(0);
    }, { timeout: 1000 }); // Short timeout as we expect things to NOT appear quickly
  });
});

describe('NewProjectPage Integration Tests (MSW)', () => {
  it('handles successful project creation (201 Created)', async () => {
    const { setError: mockSetGlobalError } = require('@/hooks/useGlobalError').useGlobalError(); // Get mock instance

    render(<NewProjectPage />);

    fireEvent.change(screen.getByLabelText(/Project Description/i), { target: { value: 'A new project description' } });
    fireEvent.change(screen.getByLabelText(/Max Runtime \(Hours\)/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Max Budget \(\$\)/i), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Starting.../i })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument(); // Button text reverts after submission
      expect(mockSetGlobalError).not.toHaveBeenCalled(); // Global error should not be called on success
    });

    // The current page.tsx uses an alert for success, which is not ideal for testing.
    // We can mock window.alert or verify console logs until proper routing/feedback is implemented.
    // For now, we'll verify the button state change and lack of global error.
  });

  it('handles API validation errors (400 Bad Request)', async () => {
    const { setError: mockSetGlobalError } = require('@/hooks/useGlobalError').useGlobalError();

    server.use(
      http.post('/api/projects', async ({ request }) => {
        return HttpResponse.json(
          {
            message: 'Validation failed for one or more fields.',
            errors: {
              description: 'Description cannot contain special characters.',
              maxRuntimeHours: 'Max runtime cannot exceed 1000 hours.',
            },
          },
          { status: 400 }
        );
      })
    );

    render(<NewProjectPage />);

    fireEvent.change(screen.getByLabelText(/Project Description/i), { target: { value: 'Invalid Description!' } });
    fireEvent.change(screen.getByLabelText(/Max Runtime \(Hours\)/i), { target: { value: '1200' } });
    fireEvent.change(screen.getByLabelText(/Max Budget \(\$\)/i), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(screen.getByText(/Description cannot contain special characters./i)).toBeInTheDocument();
      expect(screen.getByText(/Max runtime cannot exceed 1000 hours./i)).toBeInTheDocument();
      expect(mockSetGlobalError).toHaveBeenCalledWith({
        message: 'Please check the form for errors.',
        type: 'warning',
      });
    });

    // Ensure other fields without errors don't show the error message.
    expect(screen.queryByText(/Must be a positive number/i)).not.toBeInTheDocument();
  });

  it('handles general API errors (500 Internal Server Error)', async () => {
    const { setError: mockSetGlobalError } = require('@/hooks/useGlobalError').useGlobalError();

    server.use(
      http.post('/api/projects', async ({ request }) => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    render(<NewProjectPage />);

    fireEvent.change(screen.getByLabelText(/Project Description/i), { target: { value: 'Valid description for server error test' } });
    fireEvent.change(screen.getByLabelText(/Max Runtime \(Hours\)/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Budget \(\$\)/i), { target: { value: '100' } });

    fireEvent.click(screen.getByRole('button', { name: /Start/i }));

    await waitFor(() => {
      expect(mockSetGlobalError).toHaveBeenCalledWith({
        message: 'Internal Server Error',
        type: 'error',
      });
    });
  });
});
