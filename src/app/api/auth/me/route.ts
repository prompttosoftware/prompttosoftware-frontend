import { NextResponse } from 'next/server';

export async function GET() {
  // Return a mock user profile. In a real application, this would fetch from a database or authentication service.
  const userProfile = {
    id: 'mock-user-123',
    email: 'user@example.com',
    name: 'Mock User',
    balance: 1234.56, // Example balance
    // Add other relevant user fields as per src/types/auth.ts UserProfile
    isLoggedIn: true,
  };

  return NextResponse.json(userProfile);
}
