import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Define the MSW handlers for a mock API endpoint
const handlers = [
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json({ message: 'Hello from MSW!' });
  }),
];

// Set up the MSW server
const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => server.listen());

// Reset any request handlers that are declared as a part of our tests (i.e. for testing one-time requests)
// so that they don't affect other tests.
afterEach(() => server.resetHandlers());

// Stop the server after all tests
afterAll(() => server.close());

// A simple React component that fetches data and displays it
const DataFetcher: React.FC = () => {
  const [data, setData] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result.message);
      } catch (e: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Error can be of any type
        setError((e as any).message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Data: {data}</div>;
};

describe('DataFetcher component with MSW', () => {
  it('should display data fetched from a mocked API endpoint', async () => {
    render(<DataFetcher />);

    // Ensure the loading state is shown initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the data to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Data: Hello from MSW!')).toBeInTheDocument();
    });

    // Ensure the loading text is no longer present
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Override the handler for this specific test case to simulate an error
    server.use(
      http.get('https://api.example.com/data', () => {
        return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' });
      }),
    );

    render(<DataFetcher />);

    await waitFor(() => {
      expect(screen.getByText(/Error: HTTP error! status: 500/)).toBeInTheDocument();
    });
  });
});
