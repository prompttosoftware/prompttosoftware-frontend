// src/app/api/auth/e2e-login/route.ts

import { NextResponse } from 'next/server';

/**
 * This is a mock E2E login endpoint.
 * In a real application, this would securely authenticate
 * the user against a database and generate a real JWT.
 * For E2E tests, we bypass complex logic for speed and predictability.
 */
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // For E2E tests, we define a hardcoded test user.
    // In a more sophisticated setup, you might fetch these from environment
    // variables or a dedicated test user management system.
    if (username === process.env.E2E_TEST_USERNAME && password === process.env.E2E_TEST_PASSWORD) {
      // Mock a session token. In a real app, this would be a signed JWT.
      const sessionToken = 'mock-e2e-session-token-1234567890';

      return NextResponse.json({
        sessionToken,
        user: {
          id: 'e2e-test-user-id',
          email: username,
          isNewUser: false,
          balance: 1000, // Starting balance for test user
          username: 'E2E Test User',
          role: 'user',
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Invalid E2E credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('E2E login error:', error);
    return NextResponse.json({ message: 'Internal server error during E2E login' }, { status: 500 });
  }
}
