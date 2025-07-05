// src/app/api/projects/route.ts
// This file will handle operations on the collection of projects: GET all, POST new

import { NextRequest, NextResponse } from 'next/server';
// Assuming these service functions exist in projectsService.ts
import { getAllProjects, createProject } from '@/services/projectsService'; 
import { ProjectFormData } from '@/types/project'; // Assuming ProjectFormData for project creation

// Handler for GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    console.log('Attempting to fetch all projects.');
    const projects = await getAllProjects(); // Call the service function to get all projects
    console.log(`Fetched ${projects.length} projects.`);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    return new NextResponse('Failed to fetch projects', { status: 500 });
  }
}

// Handler for POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const projectData: ProjectFormData = await request.json(); // Assuming request body matches ProjectFormData
    console.log('Attempting to create a new project:', projectData.description);
    const newProject = await createProject(projectData); // Call the service function to create project
    console.log('Project created successfully with ID:', newProject.id);
    return NextResponse.json(newProject, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse('Failed to create project', { status: 500 });
  }
}
