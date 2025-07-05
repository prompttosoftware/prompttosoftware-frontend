import { NextRequest, NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import { httpClient } from '@/lib/httpClient'; // Use existing httpClient for backend communication

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log(`Proxying explore projects request with search: "${searchQuery}", sortBy: "${sortBy}", sortOrder: "${sortOrder}"`);

    // Call the actual backend API to get explore projects
    const response = await httpClient.get('/projects/explore', {
      params: {
        search: searchQuery,
        sortBy: sortBy,
        sortOrder: sortOrder,
      },
    });

    console.log(`Successfully fetched explore projects from backend. Status: ${response.status}`);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Error in explore projects API route:', error);
    // More detailed error handling might be needed based on error structure
    // Check if the error is an AxiosError to safely access response/request properties
    if (isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return new NextResponse(JSON.stringify(error.response.data), {
          status: error.response.status,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else if (error.request) {
        // The request was made but no response was received
        return new NextResponse('No response from backend server.', { status: 500 });
      }
    }
    // Something happened in setting up the request that triggered an Error
    // Or it's an unknown error type
    return new NextResponse('Failed to process request or an unknown error occurred.', { status: 500 });
  }
}
