'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { ProjectFormData, formSchema } from '@/types/project'; // Assuming you move the schema here
import { UserProfile } from '@/types/auth';
import { processProject } from '@/services/projectsService';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import AdvancedOptions from './AdvancedOptions';
import BudgetAndRuntime from './BudgetAndRuntime';
import ProjectDescription from './ProjectDescription';
import RepositoryManagement from './RepositoryManagement';

interface NewProjectFormProps {
  user: UserProfile;
}

export default function NewProjectForm({ user }: NewProjectFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isJiraGloballyLinked = user.integrations?.jira?.isLinked ?? false;

  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues: {
      description: '',
      maxRuntimeHours: 24,
      maxBudget: 500,
      githubRepositories: [],
      advancedOptions: {
        aiModels: { utility: [], low: [], medium: [], high: [], super: [], backup: [] },
        installations: [],
        jiraLinked: false,
      },
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const createdProject = await processProject(data);
      toast.success('Project created successfully!');
      // Redirect to the newly created project page
      router.push(`/projects/${createdProject.id}`);
    } catch (error) {
      console.error('Project submission failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <ProjectDescription />
            <RepositoryManagement />
            <BudgetAndRuntime />
            <AdvancedOptions isJiraGloballyLinked={isJiraGloballyLinked} />

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-[8rem]">
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Start Project'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
