import { NextRequest, NextResponse } from 'next/server';

// In-memory store for project statuses
// In a real application, this would come from a database or a persistent store.
const projectStatuses: {
  [key: string]: { elapsedTime: number; cost: number; progress: number; status: string };
} = {};

// Function to simulate dynamic project status updates
function getOrCreateProjectStatus(projectId: string) {
  if (!projectStatuses[projectId]) {
    // Initialize a new project status
    projectStatuses[projectId] = {
      elapsedTime: 0,
      cost: 0,
      progress: 0,
      status: 'pending',
    };
  }
  return projectStatuses[projectId];
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const projectId = params.id; // Access projectId from context.params
  const projectStatus = getOrCreateProjectStatus(projectId);

  // Simulate progress
  if (projectStatus.progress < 100) {
    projectStatus.elapsedTime += 1; // Increment elapsed time by 1 second
    projectStatus.cost += 0.5; // Increment cost

    // Gradually increase progress
    if (projectStatus.progress < 25) {
      projectStatus.progress += Math.random() * 5; // Faster initial progress
      projectStatus.status = 'in_progress';
    } else if (projectStatus.progress < 75) {
      projectStatus.progress += Math.random() * 2; // Moderate progress
      projectStatus.status = 'in_progress';
    } else {
      projectStatus.progress += Math.random() * 0.5; // Slower progress near completion
      projectStatus.status = 'in_progress';
    }

    projectStatus.progress = Math.min(projectStatus.progress, 100); // Cap at 100
  } else {
    projectStatus.status = 'completed';
  }

  // Return the current status
  // Ensure the returned object matches the ProjectStatus type from src/types/project.ts
  const responseData = {
    id: `status-${projectId}`, // Unique ID for this status record
    projectId: projectId,
    status: projectStatus.status as any, // Cast to any to satisfy the type for now, will refine if issues
    progress: Math.floor(projectStatus.progress),
    message: `Project ${projectId} is ${projectStatus.status}.`,
    elapsedTime: projectStatus.elapsedTime,
    cost: projectStatus.cost,
    pendingSensitiveRequest: false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(), // In a real app, this would be the actual creation time
  };

  return NextResponse.json(responseData, { status: 200 });
}

// Optional: Add a POST or PUT handler if you need to update status from client
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   // Logic to update status based on body
//   return NextResponse.json({ message: 'Status updated' });
// }
