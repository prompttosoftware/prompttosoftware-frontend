// src/app/new-project/components/ProjectForm.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Project, ProjectFormData, formSchema, Model, Provider, GithubRepository, IRepository, TestLevel, RequestType } from '@/types/project';
import { DEFAULT_MODELS } from '@/lib/data/models';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import AdvancedOptions from './AdvancedOptions';
import BudgetAndRuntime from './BudgetAndRuntime';
import ProjectDescription from './ProjectDescription';
import RepositoryManagement from './RepositoryManagement';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

// --- 1. Define a unique key for localStorage ---
const FORM_DRAFT_KEY = 'new-project-form-draft';

const DEFAULT_PROVIDER = 'openrouter' as Provider;

const createDefaultAiModels = () => {
  const levels = Object.keys(DEFAULT_MODELS) as Array<keyof typeof DEFAULT_MODELS>;
  return levels.reduce((acc, level) => {
    acc[level] = [{ 
      provider: DEFAULT_PROVIDER, 
      model: DEFAULT_MODELS[level] ?? '' 
    }];
    return acc;
  }, {} as Required<ProjectFormData['advancedOptions']['aiModels']>);
};

const mapProjectToFormData = (project: Project): Partial<ProjectFormData> => {
    const defaultModels = createDefaultAiModels();
    const finalModels = { ...defaultModels }; 

    if (project.models) {
        (Object.keys(defaultModels) as Array<keyof typeof defaultModels>).forEach(level => {
            const savedModels = project.models?.[level];
            if (savedModels && savedModels.length > 0) {
                finalModels[level] = savedModels as Model[];
            }
        });
    }

    // Map each repository from the project model to the form data model.
    const mappedRepositories = project.repositories?.map((repo: IRepository): GithubRepository => ({
        // Set type to 'existing' if a URL is present, otherwise 'new'.
        type: repo.url ? 'existing' : 'new',
        
        // Map all the common fields.
        _id: repo._id,
        url: repo.url,
        name: repo.name,
        organization: repo.organization,
        isPrivate: repo.isPrivate,
        forkUrl: repo.forkUrl,
        template: repo.template,
        tags: repo.tags,
    })) ?? [];

    return {
        description: project.description,
        maxRuntimeHours: project.maxRuntime ?? 0,
        maxBudget: project.maxCost ?? 50, 
        githubRepositories: mappedRepositories,
        advancedOptions: {
            installations: project.installations ?? [],
            jiraLinked: project.useJira ?? false,
            jiraProjectKey: project.jiraProjectKey ?? '',
            aiModels: finalModels,
            testLevel: project.testLevel ?? 'standard',
            requestType: project.requestType ?? 'auto',
        },
    };
};

interface ProjectFormProps {
  initialProjectData?: Project;
}

export default function ProjectForm({ initialProjectData }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

  const isEditMode = !!initialProjectData;
  const projectId = initialProjectData?._id;

  const defaultValues = useMemo(() => {
    if (isEditMode && initialProjectData) {
      return mapProjectToFormData(initialProjectData);
    }
    return {
      description: '',
      maxRuntimeHours: 24,
      maxBudget: 20,
      githubRepositories: [],
      advancedOptions: {
        aiModels: createDefaultAiModels(),
        installations: [],
        jiraLinked: false,
        testLevel: 'standard' as TestLevel,
        requestType: 'auto' as RequestType,
      },
    };
  }, [isEditMode, initialProjectData]);

  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
    defaultValues,
  });

  const { watch, reset } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    // This effect runs once on the client to check localStorage and signal hydration is complete.
    if (!isEditMode) {
      try {
        const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
        if (savedDraft) {
          const parsedDraft = JSON.parse(savedDraft);
          reset(parsedDraft);
        }
      } catch (error) {
        console.error("Failed to parse form draft from localStorage:", error);
      }
    }
  }, [isEditMode, reset]);

  useEffect(() => {
    // This effect is only for saving drafts in create mode.
    if (isEditMode) {
      return; // Exit early
    }

    const subscription = watch((value) => {
      try {
        localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(value));
      } catch (error) {
        console.error("Failed to save form draft to localStorage:", error);
      }
    });
    return () => subscription.unsubscribe();
    
  }, [isEditMode, watch]);

  if (isAuthLoading) {
    return <div className="p-8 text-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Your session has expired. Please refresh.</div>;
  }

  const isJiraGloballyLinked = user.integrations?.jira?.isLinked ?? false;

  const onSubmit = async (data: ProjectFormData) => {
      setIsSubmitting(true);
      try {
          if (isEditMode && projectId) {
              const updatedProject = await api.updateProject(projectId, data);
              toast.success('Project updated successfully!');
              // --- 4. Clear the draft upon successful submission ---
              localStorage.removeItem(FORM_DRAFT_KEY);
              queryClient.setQueryData(['project', updatedProject._id], updatedProject);
              queryClient.invalidateQueries({ queryKey: ['projects'] });
              
              router.push(`/projects/${updatedProject._id}`);
              router.refresh();
          } else {
              const createdProject = await api.createProject(data);
              toast.success('Project created successfully!');
              // --- 4. Clear the draft upon successful submission ---
              localStorage.removeItem(FORM_DRAFT_KEY);

              queryClient.setQueryData(['project', createdProject._id], createdProject);
              queryClient.invalidateQueries({ queryKey: ['projects'] });
              router.push(`/projects/${createdProject._id}`);
          }
      } catch (error) {
          console.error('Project submission failed:', error);
          const action = isEditMode ? 'update' : 'create';

          let errorMessage = `Failed to ${action} project.`;

          const backendMessage = (error as any)?.response?.data?.message;

          if (typeof backendMessage === 'string') {
              errorMessage = backendMessage;
          } else if (error instanceof Error) {
              errorMessage = error.message;
          }
          
          toast.error(errorMessage);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-6">
            {isEditMode ? `Editing '${initialProjectData?.name}'` : 'Create a New Project'}
        </h1>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, (errors) => {
              console.error("Form validation failed:", errors);
              toast.error('Please fix the errors before submitting.');
            })}  
            className="space-y-6">
            <ProjectDescription />
            <RepositoryManagement isEditing={isEditMode} />
            <BudgetAndRuntime />
            <AdvancedOptions isEditing={isEditMode} isJiraGloballyLinked={isJiraGloballyLinked} />

            <div className="pt-4">
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
