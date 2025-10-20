// src/app/new-project/components/ProjectForm.tsx
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Project, ProjectFormData, formSchema, Model, Provider, GithubRepository, IRepository, TestLevel, RequestType, DevMode } from '@/types/project';
import { DEFAULT_MODELS } from '@/lib/data/models';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import AdvancedOptions from './AdvancedOptions';
import BudgetAndRuntime from './BudgetAndRuntime';
import ProjectDescription from './ProjectDescription';
import RepositoryManagement from './RepositoryManagement';
import { api, ProgressPayload, StreamMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { motion, AnimatePresence } from 'framer-motion';

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
        experiment: project.experiment ?? false,
        maxExperiments: project.maxExperiments ?? 20,
        criteria: project.criteria ?? [],
        advancedOptions: {
            installations: project.installations ?? [],
            jiraLinked: project.useJira ?? false,
            jiraProjectKey: project.jiraProjectKey ?? '',
            aiModels: finalModels,
            testLevel: project.testLevel ?? 'standard',
            requestType: project.requestType ?? 'auto',
            devMode: project.devMode ?? 'write_test_repeat',
            singleIssue: project.singleIssue ?? false,
            cascade: project.cascade === true,
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
  const posthog = usePostHog();
  const [open, setOpen] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Starting project...');
  const [progress, setProgress] = useState(0);
  const finalProjectDataRef = useRef<Project | null>(null);

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
      experiment: false,
      maxExperiments: 20,
      criteria: [],
      advancedOptions: {
        aiModels: createDefaultAiModels(),
        installations: [],
        jiraLinked: false,
        testLevel: 'standard' as TestLevel,
        requestType: 'auto' as RequestType,
        devMode: 'write_test_repeat' as DevMode,
        singleIssue: false,
        cascade: true,
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
    setProgress(0);
    setLoadingMessage('Setting up project...');
    finalProjectDataRef.current = null; // Reset ref

    try {
      if (isEditMode && projectId) {
        // Edit mode can remain a standard request as it's likely faster
        const updatedProject = await api.updateProject(projectId, data);
        toast.success('Project updated successfully!');
        queryClient.setQueryData(['project', updatedProject._id], updatedProject);
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        router.push(`/projects/${updatedProject._id}`);
      } else {
        // --- Create Mode: Use the new streaming API ---
        await api.createProjectStreamed(data, {
          onChunk: (message: StreamMessage) => {
            console.log('Received stream message:', message);
            if (message.type === 'progress') {
              const { message: msg, progress: prog } = message.payload as ProgressPayload;
              setLoadingMessage(msg);
              setProgress(prog);
            } else if (message.type === 'complete') {
              // Don't navigate yet. Store the final data and wait for onFinish.
              finalProjectDataRef.current = message.payload as Project;
              setLoadingMessage('Finalizing setup...');
              setProgress(100);
            } else if (message.type === 'error') {
              // The backend can send structured errors through the stream
              throw new Error(message.payload.message || 'An error occurred during project creation.');
            }
          },
          onFinish: () => {
            const createdProject = finalProjectDataRef.current;
            if (createdProject) {
              toast.success('Project created successfully!');
              posthog?.capture('project_started', { /* ... */ });
              
              localStorage.removeItem(FORM_DRAFT_KEY);

              queryClient.setQueryData(['project', createdProject._id], createdProject);
              queryClient.invalidateQueries({ queryKey: ['projects'] });
              router.push(`/projects/${createdProject._id}`);
            } else {
              // This can happen if the stream closes without a 'complete' message
              throw new Error('Project creation finished unexpectedly. Please check the projects page.');
            }
            // No need to set isSubmitting to false here, as we are navigating away
          },
          onError: (error) => {
            // This handles network errors or if the stream fails to start
            console.error('Project submission stream failed:', error);
            toast.error(error.message || 'Failed to create project. Please try again.');
            setIsSubmitting(false); // Only set submitting to false on error
          },
        });
      }
    } catch (error: any) {
      // This outer catch now primarily handles errors from the edit submission
      // or synchronous errors before the stream starts.
      console.error('Project submission failed:', error);
      const action = isEditMode ? 'update' : 'create';
      toast.error(error.message || `Failed to ${action} project.`);
      setIsSubmitting(false);
    }
    // The finally block is no longer needed as state is handled by the callbacks
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card p-6 rounded-lg border">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
            {isEditMode ? `Editing '${initialProjectData?.name}'` : 'Create a New Project'}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
              Under Development
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-300">
              Experimental
            </span>
          </div>
        </h1>
        <Collapsible open={open} onOpenChange={setOpen} className="mb-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer text-muted-foreground text-sm group">
            <div className="flex items-center gap-2">
              <span>Overview</span>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 rounded-md bg-secondary/20 border border-secondary p-3 text-sm text-muted-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            A project establishes an <strong>autonomous AI developer</strong> capable of writing code, running tests, and managing repositories based on your description. Once started, the AI works independently. All collaboration (code and issue management) is handled through <strong>GitHub</strong> and linked <strong>Jira</strong> accounts.
          </CollapsibleContent>
        </Collapsible>

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

            <div className="pt-6 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {!isSubmitting ? (
                  <motion.div /* ... */>
                    <Button type="submit" className="min-w-[8rem]">
                      {isEditMode ? 'Save Changes' : 'Start Project'}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-md text-center"
                  >
                    {/* Use the new state driven by the server */}
                    <p className="text-sm text-muted-foreground mb-3">{loadingMessage}</p>
                    <div className="w-full h-2 bg-secondary/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        // Animate the width based on real progress
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeInOut", duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
