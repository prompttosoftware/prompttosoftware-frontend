// src/app/api/projects/[id]/route.ts
// This file will handle operations on a specific project by ID: GET, PUT/PATCH, DELETE

import { NextRequest, NextResponse } from 'next/server';
// Assuming these service functions exist in projectsService.ts
import { getProjectById, updateProjectById, deleteProjectById } from '@/services/projectsService'; 
import { Project } from '@/types/project'; // Assuming a Project type exists

// Handler for DELETE /api/projects/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return new NextResponse('Project ID is required', { status: 400 });
    }

    console.log(`Attempting to delete project with ID: ${id}`);
    await deleteProjectById(id); // Call the service function to delete the project
    console.log(`Project with ID: ${id} deleted successfully.`);

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting project:', error);
    // More robust error handling for specific cases (e.g., project not found)
    if (error instanceof Error) {
        if (error.message.includes("not found")) { // Example: if service throws "Project not found"
            return new NextResponse(`Project not found: ${error.message}`, { status: 404 });
        }
    }
    return new NextResponse('Failed to delete project', { status: 500 });
  }
}

// Handler for GET /api/projects/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return new NextResponse('Project ID is required', { status: 400 });
    }
    const project = await getProjectById(id);
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return new NextResponse('Failed to fetch project by ID', { status: 500 });
  }
}

// Handler for PUT (update) /api/projects/:id
// This is a placeholder; actual implementation would parse request body
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return new NextResponse('Project ID is required', { status: 400 });
    }
    // Assuming the request body contains the updated project data
    const updatedData = await request.json(); 
    const updatedProject = await updateProjectById(id, updatedData); // Call service
    if (!updatedProject) {
      return new NextResponse('Project not found or update failed', { status: 404 });
    }
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return new NextResponse('Failed to update project', { status: 500 });
  }
}
