// src/app/new-analysis/components/AnalysisForm.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { DEFAULT_MODELS } from '@/lib/data/models';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { IRepository, Project, Provider } from '@/types/project';
import { Analysis, AnalysisFormData, analysisFormSchema } from '@/types/analysis';
import AdvancedOptions from './AdvancedOptions';
import { useUserProjects } from '@/hooks/useUserProjects';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// --- 1. Define a unique key for localStorage ---
const FORM_DRAFT_KEY = 'new-analysis-form-draft';

const DEFAULT_PROVIDER = 'openrouter' as Provider;

const createDefaultAiModels = () => {
  const levels = Object.keys(DEFAULT_MODELS) as Array<keyof typeof DEFAULT_MODELS>;
  return levels.reduce((acc, level) => {
    acc[level] = [{ 
      provider: DEFAULT_PROVIDER, 
      model: DEFAULT_MODELS[level] ?? '' 
    }];
    return acc;
  }, {} as Required<AnalysisFormData['advancedOptions']['aiModels']>);
};

interface AnalysisFormProps {
  initialAnalysisData?: Analysis;
  initialProjects: Project[];
}

export default function AnalysisForm({ initialAnalysisData, initialProjects }: AnalysisFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();

  // Fetch projects on the client, hydrated with server-side data
  const { data: projects, isLoading: isLoadingProjects } = useUserProjects({ 
    initialData: initialProjects 
  });

  const defaultValues = useMemo(() => {
    return {
      projectId: '',
      repository: '',
      advancedOptions: {
        aiModels: createDefaultAiModels(),
        installations: [],
      },
    };
  }, [initialAnalysisData]);

  const methods = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisFormSchema),
    mode: 'onSubmit',
    defaultValues,
  });

  const { watch, reset, control, setValue, formState: { errors } } = methods;

  // Watch for changes in the selected project ID
  const selectedProjectId = watch('projectId');

  const selectedProject = useMemo(() => {
    if (!selectedProjectId || !projects) return null;
    return projects.find(p => p._id === selectedProjectId);
  }, [selectedProjectId, projects]);

  // Effect to clear the repository field when the project selection changes
  useEffect(() => {
    if (selectedProjectId !== undefined) {
      setValue('repository', '', { shouldValidate: false });
    }
  }, [selectedProjectId, setValue]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    // This effect runs once on the client to check localStorage and signal hydration is complete.
    try {
        const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
        if (savedDraft) {
            const parsedDraft = JSON.parse(savedDraft);
            reset(parsedDraft);
        }
    } catch (error) {
        console.error("Failed to parse form draft from localStorage:", error);
    }
  }, [reset]);

  useEffect(() => {

    const subscription = watch((value) => {
      try {
        localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(value));
      } catch (error) {
        console.error("Failed to save form draft to localStorage:", error);
      }
    });
    return () => subscription.unsubscribe();
    
  }, [watch]);

  if (isAuthLoading) {
    return <div className="p-8 text-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Your session has expired. Please refresh.</div>;
  }

  const onSubmit = async (data: AnalysisFormData) => {
      setIsSubmitting(true);
      try {
          
        const createdAnalysis = await api.createAnalysis(data);
        toast.success('Analysis created successfully!');
        // --- 4. Clear the draft upon successful submission ---
        localStorage.removeItem(FORM_DRAFT_KEY);

        queryClient.setQueryData(['analysis', createdAnalysis._id], createdAnalysis);
        queryClient.invalidateQueries({ queryKey: ['analysis'] });
        router.push(`/analysis/${createdAnalysis._id}`);
          
      } catch (error: any) {
          console.error('Analysis submission failed:', error);
          const action = 'create';
          let errorMessage = `Failed to ${action} analysis.`;

          if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
              errorMessage = 'The request timed out. Please check your network connection and try again.';
              toast.error(errorMessage);
              // Redirect to the analysis page
              router.push('/analysis');
              return; // Exit the function to prevent further execution
          }

          const backendMessage = error.response?.data?.message;

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
            {'Create a New Analysis'}
        </h1>
        <div className="bg-secondary/20 border border-secondary rounded-lg p-3 mb-6">
            <p className="text-sm text-muted-foreground">
                AI will systematically <strong>check each file for issues</strong> (bugs, style, security, performance, incompleteness). It then <strong>builds a description tree</strong> to fully understand the repository. Finally, it attempts to <strong>run the application, tests, and build</strong>, generating a detailed report on the results for each step.
            </p>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit, (errors) => {
              console.error("Form validation failed:", errors);
              toast.error('Please fix the errors before submitting.');
            })}  
            className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Conditional Repository Input */}
              <div className="space-y-2">
                <Label htmlFor="repository-input">GitHub Repository</Label>
                {!selectedProjectId ? (
                  // Show URL input if no project is selected
                  <Controller
                    name="repository"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="repository-input"
                        placeholder="https://github.com/your-org/your-repo"
                        {...field}
                      />
                    )}
                  />
                ) : (
                  // Show repository selector if a project is selected
                  <Controller
                    name="repository"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="repository-input">
                          <SelectValue placeholder="Select a repository..." />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProject?.repositories && selectedProject.repositories.length > 0 ? (
                            selectedProject.repositories.map((repo: IRepository) => ( // Assuming repo has url and fullName
                              <SelectItem key={repo.url} value={repo.url ?? 'Missing URL'}>
                                {repo.url}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              No repositories found in this project.
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
                {errors.repository && <p className="text-sm text-destructive mt-1">{errors.repository.message}</p>}
              </div>
            
              {/* Project Selection */}
              <div className="space-y-2">
                <Label htmlFor="project-select">Project (Optional)</Label>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                      <SelectTrigger id="project-select">
                        <SelectValue placeholder="Select a project..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Analyze a new repository URL --</SelectItem>
                        {isLoadingProjects ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">Loading projects...</div>
                        ) : (
                          projects?.map((project) => (
                            <SelectItem key={project._id} value={project._id}>
                              {project.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            
            <AdvancedOptions />

            <div className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="min-w-[8rem]">
                {isSubmitting ? <LoadingSpinner size="small" /> : 'Start Analysis'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
