// src/app/new-project/components/ProjectForm.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Project, ProjectFormData, formSchema } from '@/types/project';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import AdvancedOptions from './AdvancedOptions';
import BudgetAndRuntime from './BudgetAndRuntime';
import ProjectDescription from './ProjectDescription';
import RepositoryManagement from './RepositoryManagement';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

// Helper to convert Project data to ProjectFormData
// You may need to adjust this based on the exact differences in your models
const mapProjectToFormData = (project: Project): Partial<ProjectFormData> => {
    
    return {
        description: project.description,
        maxRuntimeHours: project.maxRuntime ?? 0,
        maxBudget: project.maxCost,
        githubRepositories: project.repositories,
        advancedOptions: {
            installations: project.installations,
            jiraLinked: project.useJira ?? false,
            jiraProjectKey: project.jiraProjectKey,
            aiModels: {
                utility: project.models?.utility ?? [],
                low: project.models?.low ?? [],
                medium: project.models?.medium ?? [],
                high: project.models?.high ?? [],
                super: project.models?.super ?? [],
                backup: project.models?.backup ?? [],
            },
        },
    };
};


interface ProjectFormProps {
  initialProjectData?: Project;
}

export default function ProjectForm({ initialProjectData }: ProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading } = useAuth();

  // Handle the case where auth is still resolving or has failed post-load
  if (isLoading) {
    return <div className="p-8 text-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    // This is a robust fallback if the session expires while on the page
    return <div className="p-8 text-center">Your session has expired. Please refresh.</div>;
  }
  
  // Determine if we are in "edit" mode
  const isEditMode = !!initialProjectData;
  const projectId = initialProjectData?._id;

  const isJiraGloballyLinked = user.integrations?.jira?.isLinked ?? false;

  // Set default values for the form
  // If in edit mode, use mapped data. If in create mode, use blank defaults.
  const defaultValues = useMemo(() => {
    if (isEditMode && initialProjectData) {
      return mapProjectToFormData(initialProjectData);
    }
    return {
      description: '',
      maxRuntimeHours: 24,
      maxBudget: 500,
      githubRepositories: [],
      advancedOptions: {
        aiModels: { utility: [], low: [], medium: [], high: [], super: [], backup: [] },
        installations: [],
        jiraLinked: false,
      },
    };
  }, [isEditMode, initialProjectData]);


  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues,
  });

  const onSubmit = async (data: ProjectFormData) => {
      setIsSubmitting(true);
      try {
          if (isEditMode && projectId) {
              // --- EDIT LOGIC ---
              // Use the new updateProject function
              const updatedProject = await api.updateProject(projectId, data);
              toast.success('Project updated successfully!');
              router.push(`/projects/${updatedProject._id}`);
              router.refresh(); // Good for invalidating server component cache
          } else {
              // --- CREATE LOGIC ---
              // Use the modified createProject function
              const createdProject = await api.createProject(data);
              toast.success('Project created successfully!');
              router.push(`/projects/${createdProject._id}`);
          }
      } catch (error) {
          console.error('Project submission failed:', error);
          const action = isEditMode ? 'update' : 'create';
          toast.error(error instanceof Error ? error.message : `Failed to ${action} project.`);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Add a title that changes based on the mode */}
        <h1 className="text-2xl font-bold mb-6">
            {isEditMode ? `Editing '${initialProjectData?.name}'` : 'Create a New Project'}
        </h1>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <ProjectDescription />
            <RepositoryManagement isEditing={isEditMode} />
            <BudgetAndRuntime />
            <AdvancedOptions isEditing={isEditMode} isJiraGloballyLinked={isJiraGloballyLinked} />

            <div className="pt-4">
              {/* Change button text and style based on the mode */}
              <Button type="submit" disabled={isSubmitting} className="min-w-[8rem]">
                {isSubmitting ? <LoadingSpinner size="small" /> : (isEditMode ? 'Save Changes' : 'Start Project')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
