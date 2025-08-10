// src/app/new-project/components/ProjectForm.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react'; // Import useEffect
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Project, ProjectFormData, formSchema, Model, Provider } from '@/types/project';
import { DEFAULT_MODELS } from '@/lib/data/models';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import AdvancedOptions from './AdvancedOptions';
import BudgetAndRuntime from './BudgetAndRuntime';
import ProjectDescription from './ProjectDescription';
import RepositoryManagement from './RepositoryManagement';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

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

    return {
        description: project.description,
        maxRuntimeHours: project.maxRuntime ?? 0,
        maxBudget: project.maxCost,
        githubRepositories: project.repositories,
        advancedOptions: {
            installations: project.installations,
            jiraLinked: project.useJira ?? false,
            jiraProjectKey: project.jiraProjectKey,
            aiModels: finalModels,
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

  if (isLoading) {
    return <div className="p-8 text-center"><LoadingSpinner /></div>;
  }
  if (!user) {
    return <div className="p-8 text-center">Your session has expired. Please refresh.</div>;
  }

  const isEditMode = !!initialProjectData;
  const projectId = initialProjectData?._id;
  const isJiraGloballyLinked = user.integrations?.jira?.isLinked ?? false;

  const defaultValues = useMemo(() => {
    // In edit mode, always use the data from the server.
    if (isEditMode && initialProjectData) {
      return mapProjectToFormData(initialProjectData);
    }

    // --- 2. In create mode, try to load from localStorage first ---
    try {
      const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
      if (savedDraft) {
        console.log('Found a saved draft, loading it.');
        return JSON.parse(savedDraft);
      }
    } catch (error) {
        console.error("Failed to parse form draft from localStorage:", error);
        // If parsing fails, fall through to the default values.
    }
    
    // Fallback for create mode (no draft found or parsing failed)
    return {
      description: '',
      maxRuntimeHours: 24,
      maxBudget: 500,
      githubRepositories: [],
      advancedOptions: {
        aiModels: createDefaultAiModels(),
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

  // --- 3. Save form data to localStorage on change (only in create mode) ---
  const { watch } = methods;
  useEffect(() => {
    // Only save drafts if we are in "create" mode.
    if (!isEditMode) {
      const subscription = watch((value) => {
        try {
          localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(value));
        } catch (error) {
          console.error("Failed to save form draft to localStorage:", error);
        }
      });
      // Clean up the subscription when the component unmounts
      return () => subscription.unsubscribe();
    }
  }, [watch, isEditMode]);


  const onSubmit = async (data: ProjectFormData) => {
      setIsSubmitting(true);
      try {
          if (isEditMode && projectId) {
              const updatedProject = await api.updateProject(projectId, data);
              toast.success('Project updated successfully!');
              // --- 4. Clear the draft upon successful submission ---
              localStorage.removeItem(FORM_DRAFT_KEY);
              router.push(`/projects/${updatedProject._id}`);
              router.refresh();
          } else {
              const createdProject = await api.createProject(data);
              toast.success('Project created successfully!');
              // --- 4. Clear the draft upon successful submission ---
              localStorage.removeItem(FORM_DRAFT_KEY);
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
