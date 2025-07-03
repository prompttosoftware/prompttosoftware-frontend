import { NextResponse } from 'next/server';

export async function POST(request) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json({ message: 'Authorization code is missing.' }, { status: 400 });
  }

  try {
    // Step 1: Exchange the authorization code for an access token with GitHub
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json', // Crucial to get JSON response
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Failed to obtain GitHub access token.');
    }

    // Step 2: Use the access token to get user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        'User-Agent': 'PromptToSoftware-App', // GitHub API requires a User-Agent header
      },
    });

    const userData = await userResponse.json();

    if (userData.message && userData.documentation_url) {
      throw new Error(userData.message); // Handle GitHub API errors for user data
    }

    // Here you would typically perform your own JWT creation for your application
    // For this example, we'll just return a mock JWT or an indication of success.
    // In a real application, you'd mint a JWT, sign it, and possibly store
    // user details in your database.

    // Mock JWT creation for demonstration purposes:
    const mockJwtPayload = {
      userId: userData.id,
      username: userData.login,
      email: userData.email, // May be null if not public on GitHub
      githubAccessToken: accessToken, // In real app, only store securely or use to fetch necessary data
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hour
    };

    // In a real application, you'd use a JWT library like `jsonwebtoken`
    // For example: `const jwt = require('jsonwebtoken');`
    // `const token = jwt.sign(mockJwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });`
    // For now, we'll just base64 encode a simplified version for mock purposes.
    const mockSignedToken = btoa(JSON.stringify(mockJwtPayload)); // Base64 encode for simplicity

    return NextResponse.json({
      token: mockSignedToken,
      user: { login: userData.login, id: userData.id },
    });
  } catch (error) {
    console.error('GitHub OAuth Backend Error:', error.message);
    return NextResponse.json(
      { message: `Authentication failed: ${error.message}` },
      { status: 500 },
    );
  }
}
