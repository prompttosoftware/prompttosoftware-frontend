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

  // Add other handlers as needed
];
