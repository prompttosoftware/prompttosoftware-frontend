import { http, HttpResponse } from 'msw';
import { ProjectStatus } from '@/types/project';

let nextProjectId = 1; // Simple counter for unique project IDs

// Define your MSW handlers here
export const handlers = [
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
      status: 'in-progress',
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

  
// Handler for GET /payments/cards
http.get('/payments/cards', () => {
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
  console.log('MSW: Returning mock saved cards');
  return HttpResponse.json({ cards: mockSavedCards }, { status: 200 });
}),

// Handler for GET /api/projects
http.get('/api/projects', () => {
  const mockProjects = Array.from({ length: 5 }).map((_, i) => ({
    id: `project-${i + 1}`,
    name: `Mock Project ${i + 1}`,
    description: `This is a mock description for project ${i + 1}. It details the purpose and goals of the project.`,
    status: i % 2 === 0 ? 'active' : 'completed', // Alternating status
    repositoryUrl: `https://github.com/mockuser/project-${i + 1}`,
    costToDate: parseFloat((Math.random() * 10000).toFixed(2)),
    totalRuntime: Math.floor(Math.random() * 86400000 * 5), // Up to 5 days in milliseconds
    progress: parseFloat((Math.random() * 100).toFixed(1)),
    githubStars: Math.floor(Math.random() * 1000),
    createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
  }));
  return HttpResponse.json(mockProjects, { status: 200 });
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
  ];
