import { Configuration, OpenAIApi } from 'openai';
1. **Context:** `src/app/api/projects/route.ts`
**Reason:** The `POST` and `GET` handlers in `src/app/api/projects/route.ts` use `require()` statements for importing `Configuration` and `OpenAIApi` from `openai`. This is a `typescript-eslint` rule violation (`@typescript-eslint/no-require-imports`) and causes a build error.
**Instructions:** Change the `require()` statements to `import` statements in `src/app/api/projects/route.ts`. For example, `const { Configuration, OpenAIApi } = require('openai');` should become `import { Configuration, OpenAIApi } from 'openai';`.

export async function POST(req: Request) {
  try {
    const { name, description, repository, framework } = await req.json();

    if (!name || !description || !repository || !framework) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock project creation for now
    const newProject = {
      id: 'proj_' + Math.random().toString(36).substr(2, 9), // Unique ID
      name,
      description,
      repository,
      framework,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(newProject), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Project creation failed:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Optional: Add a GET endpoint for fetching projects
export async function GET() {
  // This is a placeholder. In a real app, you'd fetch from a DB.
  const projects = [
    {
      id: 'proj_abc123',
      name: 'My First Project',
      description: 'A sample project for testing.',
      repository: 'github.com/user/repo1',
      framework: 'nextjs',
      status: 'completed',
      createdAt: '2023-01-01T12:00:00Z',
    },
    {
      id: 'proj_def456',
      name: 'Another Project',
      description: 'This is a second project.',
      repository: 'github.com/user/repo2',
      framework: 'react',
      status: 'pending',
      createdAt: '2023-02-01T12:00:00Z',
    },
  ];

  return new Response(JSON.stringify(projects), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
