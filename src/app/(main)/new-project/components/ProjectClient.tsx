'use client';

import ProjectForm from '@/app/(main)/new-project/components/ProjectForm';
import { Project } from '@/types/project';

interface ProjectClientProps {
  initialProjectData?: Project;
}

export default function ProjectClient({ initialProjectData }: ProjectClientProps) {
  return (
    <ProjectForm initialProjectData={initialProjectData} />
  );
}
