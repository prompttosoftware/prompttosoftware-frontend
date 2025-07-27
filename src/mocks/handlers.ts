import { http, HttpResponse } from 'msw';
import { ProjectStatus } from '@/types/project';
import { CreatePaymentIntentRequest, CreatePaymentIntentResponse, PaymentErrorResponse } from '@/types/payments';
import { AddAdCreditRequest, AdCreditResponse } from '@/types/ads';

let nextProjectId = 1; // Simple counter for unique project IDs

// Define your MSW handlers here
export const handlers = [
  // Auth Handlers
  // POST /auth/github - Login via GitHub
  http.post('/auth/github', async ({ request }) => {
    const { code } = await request.json() as Record<string, any>;

    if (code === 'valid_github_code') {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/100000?v=4',
        githubId: 'github-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      console.log('MSW: /auth/github success with code:', code);
      return HttpResponse.json({ jwtToken: 'mock-jwt-token', user: mockUser }, { status: 200 });
    } else if (code === 'invalid_github_code') {
      console.log('MSW: /auth/github invalid code:', code);
      return HttpResponse.json({ message: 'Invalid GitHub authorization code' }, { status: 400 });
    } else {
      console.log('MSW: /auth/github unhandled code:', code);
      return HttpResponse.json({ message: 'Unhandled GitHub authorization code' }, { status: 400 });
    }
  }),

  // GET /auth/me - Get current user profile
  http.get('/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader === 'Bearer mock-jwt-token') {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: 'https://avatars.githubusercontent.com/u/100000?v=4',
        githubId: 'github-123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      console.log('MSW: /auth/me success');
      return HttpResponse.json(mockUser, { status: 200 });
    } else {
      console.log('MSW: /auth/me unauthenticated');
      return HttpResponse.json({ message: 'Unauthorized: No valid token provided' }, { status: 401 });
    }
  }),

  // POST /auth/logout - Logout user
  http.post('/auth/logout', () => {
    console.log('MSW: /auth/logout success');
    return HttpResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  }),

  // DELETE /users/me - Delete current user account
  http.delete('/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader === 'Bearer mock-jwt-token') {
      console.log('MSW: /users/me success');
      return HttpResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
    } else {
      console.log('MSW: /users/me unauthorized');
      return HttpResponse.json({ message: 'Unauthorized: No valid token provided for account deletion' }, { status: 401 });
    }
  }),

  // Example handler from msw.test.tsx, moved here
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json({ message: 'Hello from MSW!' });
  }),

  // Handler for GET /projects/:id/status
  http.get('/projects/:id/status', ({ params }) => {
    const { id } = params;

    // Mock ProjectStatus data
    const mockStatus: ProjectStatus = {
      id: `status-${id}`,
      projectId: id as string,
      status: 'running',
      progress: Math.floor(Math.random() * 100), // Random progress
      message: 'Project is running smoothly.',
      updatedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      elapsedTime: Math.floor(Math.random() * 10000) + 100, // Random elapsed time
      cost: parseFloat((Math.random() * 1000).toFixed(2)), // Random cost
      pendingSensitiveRequest: Math.random() > 0.7, // Randomly true/false
    };

    return HttpResponse.json(mockStatus, { status: 200 });
  }),

  
// Handler for GET /api/payments/cards
http.get('/api/payments/cards', ({ request }) => {
  const url = new URL(request.url);
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== 'Bearer mock-jwt-token') {
    console.warn('MSW: Unauthorized attempt to get saved cards');
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const mockType = url.searchParams.get('mockType'); // Allows simulating different scenarios

  if (mockType === 'empty') {
    console.log('MSW: Returning empty mock saved cards list');
    return HttpResponse.json({ cards: [] }, { status: 200 });
  } else if (mockType === 'error') {
    console.warn('MSW: Returning error for saved cards request');
    return HttpResponse.json(
      { message: 'Failed to retrieve cards due to a server error.' },
      { status: 500 }
    );
  } else {
    const mockSavedCards = [
      {
        id: 'card_123abc',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
      {
        id: 'card_456def',
        brand: 'mastercard',
        last4: '5555',
        expiryMonth: 10,
        expiryYear: 2024,
        isDefault: false,
      },
      {
        id: 'card_789ghi',
        brand: 'amex',
        last4: '0000',
        expiryMonth: 1,
        expiryYear: 2028,
        isDefault: false,
      },
    ];
    console.log('MSW: Returning populated mock saved cards');
    return HttpResponse.json(
  { cards: mockSavedCards },
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
  }
}),

// Handler for DELETE /payments/cards/:id
http.delete('/api/payments/cards/:id', ({ params, request }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== 'Bearer mock-jwt-token') {
    console.warn('MSW: Unauthorized attempt to delete card');
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (id === 'card_error_delete') {
    console.warn(`MSW: Simulating error deleting card ${id}`);
    return HttpResponse.json(
      { message: `Failed to delete card ${id} due to a server issue.` },
      { status: 500 }
    );
  } else if (id === 'card_not_found') {
    console.warn(`MSW: Simulating card ${id} not found`);
    return HttpResponse.json(
      { message: `Card ${id} not found.` },
      { status: 404 }
    );
  } else {
    console.log(`MSW: Successfully deleted card ${id}`);
    return new HttpResponse(null, { status: 204 }); // 204 No Content for successful deletion
  }
}),

// Handler for GET /projects/explore
http.get('/api/projects/explore', ({ request }) => {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search')?.toLowerCase() || '';
  const sortBy = url.searchParams.get('sortBy') || '';
  const sortOrder = url.searchParams.get('sortOrder') || 'desc'; // Default to desc

  let mockExploreProjects = [
    {
      id: 'explore-project-1',
      name: 'Quantum Ledger',
      description: 'A revolutionary blockchain for secure data storage with quantum-resistant encryption.',
      githubStars: 1500,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      status: 'active',
      repositoryUrl: 'https://github.com/explore/quantum-ledger',
      costToDate: 1234.56, // Add dummy data to match ProjectSummary
      totalRuntime: 7200000,
      progress: 85.5,
    },
    {
      id: 'explore-project-2',
      name: 'AI-Powered Crop Optimizer',
      description: 'Utilizes machine learning to optimize crop yields and predict agricultural conditions.',
      githubStars: 800,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      status: 'completed',
      repositoryUrl: 'https://github.com/explore/crop-optimizer',
      costToDate: 567.89,
      totalRuntime: 3600000,
      progress: 100,
    },
    {
      id: 'explore-project-3',
      name: 'NeuroLink Interface',
      description: 'Direct brain-computer interface for enhanced human-machine interaction and cognitive augmentation.',
      githubStars: 2100,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
      status: 'in-progress',
      repositoryUrl: 'https://github.com/explore/neurolink-interface',
      costToDate: 9876.54,
      totalRuntime: 14400000,
      progress: 40.2,
    },
    {
      id: 'explore-project-4',
      name: 'Eco-Friendly Waste Sorter',
      description: 'An automated system for sorting recyclable materials using advanced vision algorithms.',
      githubStars: 300,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago (most recent)
      status: 'active',
      repositoryUrl: 'https://github.com/explore/waste-sorter',
      costToDate: 234.56,
      totalRuntime: 1800000,
      progress: 90.1,
    },
    {
      id: 'explore-project-5',
      name: 'Decentralized Identity Network',
      description: 'Secure and sovereign digital identities built on a privacy-preserving blockchain.',
      githubStars: 1100,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
      status: 'pending',
      repositoryUrl: 'https://github.com/explore/decentralized-id',
      costToDate: 789.01,
      totalRuntime: 5400000,
      progress: 60.0,
    },
    {
      id: 'explore-project-6',
      name: 'Smart Urban Farming',
      description: 'Automated vertical farms using IoT sensors and AI to optimize growth conditions in cities.',
      githubStars: 950,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
      status: 'active',
      repositoryUrl: 'https://github.com/explore/urban-farming',
      costToDate: 456.78,
      totalRuntime: 2700000,
      progress: 75.3,
    },
    {
      id: 'explore-project-7',
      name: 'Open-Source Robotics Kit',
      description: 'Modular and affordable robotics kits for education and rapid prototyping.',
      githubStars: 1800,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
      status: 'completed',
      repositoryUrl: 'https://github.com/explore/robotics-kit',
      costToDate: 321.09,
      totalRuntime: 9000000,
      progress: 100,
    },
    {
      id: 'explore-project-8',
      name: 'VR Meditation App',
      description: 'Immersive virtual reality experience for guided meditation and stress reduction.',
      githubStars: 600,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
      status: 'active',
      repositoryUrl: 'https://github.com/explore/vr-meditation',
      costToDate: 876.54,
      totalRuntime: 4500000,
      progress: 50.8,
    },
  ];

  // Apply search filter
  if (searchQuery) {
    mockExploreProjects = mockExploreProjects.filter(project =>
      project.name.toLowerCase().includes(searchQuery) ||
      project.description.toLowerCase().includes(searchQuery)
    );
  }

  // Apply sorting
  if (sortBy === 'githubStars') {
    mockExploreProjects.sort((a, b) =>
      sortOrder === 'asc' ? a.githubStars - b.githubStars : b.githubStars - a.githubStars
    );
  } else if (sortBy === 'createdAt') {
    mockExploreProjects.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy === 'name') {
    mockExploreProjects.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === 'desc') {
        return nameB.localeCompare(nameA);
      }
      return nameA.localeCompare(nameB);
    });
  }

  return HttpResponse.json(mockExploreProjects, { status: 200 });
}),

// Handler for GET /api/projects/:id
http.get('/api/projects/:id', ({ params }) => {
  const { id } = params;
  const mockProject = {
    id: id as string,
    name: `Mock Project ${id}`,
    description: `Description for mock project ${id}`,
    repositoryUrl: `https://github.com/mockproject/${id}`,
    status: 'active',
    elapsedTime: Math.floor(Math.random() * 1000),
    cost: parseFloat((Math.random() * 500).toFixed(2)),
    progress: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  };
  return HttpResponse.json(mockProject, { status: 200 });
}),

// Handler for POST /api/projects (New Project creation)
http.post('/api/projects', async ({ request }) => {
  const newProjectData = await request.json();
  console.log('MSW: Received new project request:', newProjectData);

  // Simulate a successful creation
  const projectId = `project-${nextProjectId++}`;
  return HttpResponse.json(
    {
      projectId: projectId,
      message: 'Project created successfully!',
    },
    { status: 201 },
  );
}),

// Handler for POST /payments/create-intent
http.post('/api/payments/create-intent', async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== 'Bearer mock-jwt-token') {
    console.warn('MSW: Unauthorized attempt to create payment intent');
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { amount, currency, paymentMethodId, description } = (await request.json()) as CreatePaymentIntentRequest;

  if (amount === 1313) {
    // Simulate a generic payment failure for a specific amount
    return HttpResponse.json(
      {
        message: 'Payment intent creation failed: Invalid amount or details.',
        statusCode: 400,
        code: 'payment_creation_failed',
        param: 'amount',
      } as PaymentErrorResponse,
      { status: 400 },
    );
  }
  if (amount === 50000 && paymentMethodId === 'pm_card_charge_fail') {
    // Simulate a card decline or specific payment method error
    return HttpResponse.json(
      {
        message: 'Payment declined by card issuer.',
        statusCode: 402, // 402 Payment Required for declines
        code: 'card_declined',
        param: 'paymentMethodId',
      } as PaymentErrorResponse,
      { status: 402 },
    );
  }
  if (amount === 99999) {
    // Simulate a server-side error during intent creation
    return HttpResponse.json(
      {
        message: 'Internal server error during payment intent creation.',
        statusCode: 500,
        code: 'internal_server_error',
      } as PaymentErrorResponse,
      { status: 500 },
    );
  }

  // Simulate successful payment intent creation
  const paymentIntentId = `pi_${Date.now()}`;
  const clientSecret = `cs_${Date.now()}_secret`; // A mock client secret
  console.log(`MSW: Created payment intent ${paymentIntentId} for ${amount} ${currency}`);
  return HttpResponse.json(
    {
      clientSecret,
      paymentIntentId,
      amount,
      currency,
      status: 'requires_action', // Or 'requires_confirmation', 'succeeded' depending on flow
      requiresAction: {
        type: 'url',
        url: 'https://mock-3dsecure-action.com/redirect', // Mock URL for 3D Secure or similar
      },
    } as CreatePaymentIntentResponse,
    { status: 200 },
  );
}),

// Handler for POST /ads/credit
http.post('/api/ads/credit', async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== 'Bearer mock-jwt-token') {
    console.warn('MSW: Unauthorized attempt to add ad credit');
    return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { amount, currency, paymentMethodId } = (await request.json()) as AddAdCreditRequest;

  if (amount === 999) { // Simulate a failure scenario for ad credit
    return HttpResponse.json(
      {
        message: 'Ad credit failed: Invalid ad session or ad not fully watched.',
        statusCode: 400,
        code: 'ad_credit_failed',
      } as PaymentErrorResponse,
      { status: 400 },
    );
  }
  if (amount === 555) { // Simulate a server error during ad credit
    return HttpResponse.json(
      {
        message: 'Internal server error while processing ad credit.',
        statusCode: 500,
        code: 'internal_server_error',
      } as PaymentErrorResponse,
      { status: 500 },
    );
  }

  // Simulate successful ad credit
  const creditedAmount = amount || 1000; // Use provided amount or default
  const newBalance = 50000 + creditedAmount; // Example: user had 500 credits, add the amount
  console.log(`MSW: Added ${creditedAmount} to ad credit. New balance: ${newBalance}`);
  return HttpResponse.json(
    {
      newBalance,
      creditedAmount: creditedAmount,
      currency: currency || 'usd',
      transactionId: `txn_${Date.now()}`
    } as AdCreditResponse,
    { status: 200 },
  );
}),

// Add a catch-all handler at the very end to log any unhandled requests
http.all('*', ({ request }) => {
  console.error(`MSW: Unhandled request: ${request.method} ${request.url}`);
  return HttpResponse.json({ message: `Unhandled request: ${request.method} ${request.url}` }, { status: 404 });
}),
];
