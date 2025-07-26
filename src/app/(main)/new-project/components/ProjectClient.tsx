'use client';

import ProjectForm from '@/app/(main)/new-project/components/ProjectForm';
import { AuthProvider } from '@/lib/AuthContext';
import { UserProfile } from '@/types/auth';
import { Project } from '@/types/project';

interface ProjectClientProps {
  user: UserProfile;
  initialProjectData?: Project; // For the edit mode case
}

// This component's job is to take server data and set up the client environment.
export default function ProjectClient({ user, initialProjectData }: ProjectClientProps) {
  return (
    // We provide the AuthContext here, hydrated with the user from the server.
    <AuthProvider initialData={user}>
      {/* Now ProjectForm can safely use the useAuth() hook. */}
      <ProjectForm initialProjectData={initialProjectData} />
    </AuthProvider>
  );
}
