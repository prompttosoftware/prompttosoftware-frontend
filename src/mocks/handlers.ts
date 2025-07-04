import { http, HttpResponse } from 'msw';
import { ProjectStatus } from '@/types/project';

// Define your MSW handlers here
export const handlers = [
  // Example handler from msw.test.tsx, moved here
  http.get('https://api.example.com/data', () => {
    return HttpResponse.json({ message: 'Hello from MSW!' });
  }),

  // Handler for GET /projects/{id}/status
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
let nextProjectId = 1; // Simple counter for unique project IDs
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
    { status: 201 }
  );
}),

// Add other handlers as needed
];
