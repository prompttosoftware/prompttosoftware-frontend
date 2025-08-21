'use client';

import ProjectForm from '@/app/(main)/new-project/components/ProjectForm';
import { Project } from '@/types/project';

interface ProjectClientProps {
  initialProjectData?: Project;
}

// This component's job is to take server data and set up the client environment.
export default function ProjectClient({ initialProjectData }: ProjectClientProps) {
  return (
    <ProjectForm initialProjectData={initialProjectData} />
  );
}
