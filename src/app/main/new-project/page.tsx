'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import { NewRepositoryFields } from '@/app/(main)/new-project/NewRepositoryFields';
import { ExistingRepositoryFields } from '@/app/(main)/new-project/ExistingRepositoryFields';
import { getEstimatedCost } from '@/lib/api'; // Assume this API call exists
import { JiraLinkResponse, LinkJiraAccount } from '@/lib/jira'; // Import Jira API functions
import { ProjectFormData } from '@/lib/types';
import { processProject } from '@/services/projectsService'; // Import the service

const MAX_INSTALLATIONS = 20;

type AiModel = {
  id: string;
  alias: string;
  intelligence: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  apiKey: string;
  note?: string;
};

const formSchema = z.object({
  description: z.string().min(10, { message: 'Project description must be at least 10 characters.' }),
  maxRuntimeHours: z.number().min(0.01, { message: 'Must be a positive number.' }),
  maxBudget: z.number().min(0.01, { message: 'Must be a positive number.' }),
  githubRepositories: z.array(
    z.union([
      z.object({
        type: z.literal('new'),
        name: z.string().min(1, 'Repository name is required.'),
        isPrivate: z.boolean(),
      }),
      z.object({
        type: z.literal('existing'),
        url: z.string().url('Invalid URL format.').min(1, 'Repository URL is required.'),
      }),
    ]),
  ),
  advancedOptions: z.object({
    aiModels: z.array(
      z.object({
        id: z.string().uuid(),
        alias: z.string().min(1, 'Alias is required.'),
        intelligence: z.enum(['utility', 'low', 'medium', 'high', 'super', 'backup']),
        apiKey: z.string().min(1, 'API Key is required.'),
        note: z.string().optional(),
      }),
    ),
    installations: z.array(z.string()).max(MAX_INSTALLATIONS, `Cannot add more than ${MAX_INSTALLATIONS} installations.`),
    jiraLinked: z.boolean(),
  }),
});

export default function NewProjectPage() {
  const methods = useForm<ProjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      maxRuntimeHours: 24, // Default value
      maxBudget: 500, // Default value
      githubRepositories: [], // Default to no repositories
      advancedOptions: {
        aiModels: [],
        installations: [],
        jiraLinked: false,
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = methods;

  const {
    fields: githubRepositories,
    append: appendGithubRepository,
    remove: removeGithubRepository,
  } = useFieldArray({
    control,
    name: 'githubRepositories',
  });

  const {
    fields: aiModelFields,
    append: appendAiModel,
    remove: removeAiModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.aiModels',
  });

  const {
    fields: installationFields,
    append: appendInstallation,
    remove: removeInstallation,
  } = useFieldArray({
    control,
    name: 'advancedOptions.installations',
  });

  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCostResult, setEstimatedCostResult] = useState<{
    estimatedTotal: number;
    completionTimeHours: number;
    flatRateComponent: number;
    aiApiCostComponent: number;
    modelUsed: boolean;
    modelErrorMessage?: string;
  } | null>(null);
  const [showCostDetails, setShowCostDetails] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [jiraLinked, setJiraLinked] = useState(false);
  
  // State for the Installations dropdown
  const [showInstallationDropdown, setShowInstallationDropdown] = useState(false);
  const [selectedInstallationType, setSelectedInstallationType] = useState<string | null>(null);
  const [customInstallationName, setCustomInstallationName] = useState('');


  const description = watch('description');
  const maxRuntimeHours = watch('maxRuntimeHours');
  const maxBudget = watch('maxBudget');
  const aiModels = watch('advancedOptions.aiModels'); // Watch AI models for cost estimation

  const [isPending, startTransition] = React.useTransition();

  useEffect(() => {
    const delayEstimation = setTimeout(async () => {
      if (description.length >= 10) {
        setIsEstimating(true);
        setEstimatedCostResult(null); // Clear previous result
        try {
          const estimation = await getEstimatedCost({
            description,
            maxRuntimeHours,
            maxBudget,
            aiModels: aiModels.map(model => ({ id: model.id, intelligence: model.intelligence })), // Pass only necessary model info
          });
          setEstimatedCostResult(estimation);
        } catch (error) {
          console.error('Failed to get cost estimation:', error);
          toast.error('Failed to get cost estimation.');
          setEstimatedCostResult(null);
        } finally {
          setIsEstimating(false);
        }
      } else {
        setEstimatedCostResult(null);
      }
    }, 500); // Debounce time

    return () => clearTimeout(delayEstimation);
  }, [description, maxRuntimeHours, maxBudget, aiModels]);

  const onSubmit = async (data: ProjectFormData) => {
    startTransition(async () => {
      try {
        await processProject(data);
        toast.success('Project created successfully!');
        // Optionally redirect or clear form
      } catch (error) {
        console.error('Project submission failed:', error);
        toast.error('Failed to create project.');
      }
    });
  };

  const renderAiModelSelection = (
    intelligence: AiModel['intelligence'],
    title: string,
    models: AiModel[],
    append: (model: AiModel) => void,
    remove: (index: number) => void,
  ) => (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title} AI Models</h3>
      <div className="space-y-3 mb-4">
        {models.length === 0 ? (
          <p className="text-sm text-gray-500">No {title.toLowerCase()} models added.</p>
        ) : (
          models.map((model, index) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-3 border border-gray-100 bg-white rounded-md shadow-sm"
            >
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-700">{model.alias}</p>
                <p className="text-xs text-gray-500">{model.apiKey.substring(0, 5)}...{model.apiKey.substring(model.apiKey.length - 5)}</p>
              </div>
              <Button
                type="button"
                onClick={() => remove(index)}
                variant="destructive"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-col space-y-3">
        <Input
          id={`new-ai-model-alias-${intelligence}`}
          placeholder="Model Alias (e.g., OpenAI GPT-4)"
          className="mb-2"
        />
        <Input
          id={`new-ai-model-key-${intelligence}`}
          type="password"
          placeholder="API Key"
          className="mb-2"
        />
        <Input
          id={`new-ai-model-note-${intelligence}`}
          placeholder="Note (optional)"
          className="mb-2"
        />
        <Button
          type="button"
          onClick={() => {
            const aliasInput = document.getElementById(`new-ai-model-alias-${intelligence}`) as HTMLInputElement;
            const keyInput = document.getElementById(`new-ai-model-key-${intelligence}`) as HTMLInputElement;
            const noteInput = document.getElementById(`new-ai-model-note-${intelligence}`) as HTMLInputElement;

            const alias = aliasInput.value;
            const apiKey = keyInput.value;
            const note = noteInput.value;

            if (alias && apiKey) {
              append({ id: crypto.randomUUID(), alias, intelligence, apiKey, note: note || undefined });
             aliasInput.value = '';
              keyInput.value = '';
              noteInput.value = '';
            } else {
              toast.error('Alias and API Key are required to add an AI model.');
            }
          }}
        >
          Add {title} Model
        </Button>
      </div>
    </div>
  );

  // Filter models by intelligence type for rendering
  const utilityModels = aiModelFields.filter(model => model.intelligence === 'utility');
  const lowModels = aiModelFields.filter(model => model.intelligence === 'low');
  const mediumModels = aiModelFields.filter(model => model.intelligence === 'medium');
  const highModels = aiModelFields.filter(model => model.intelligence === 'high');
  const superModels = aiModelFields.filter(model => model.intelligence === 'super');
  const backupModels = aiModelFields.filter(model => model.intelligence === 'backup');

  const handleLinkJira = async () => {
    try {
      const response: JiraLinkResponse = await LinkJiraAccount();
      if (response.success) {
        setJiraLinked(true);
        setValue('advancedOptions.jiraLinked', true);
        toast.success('Jira account linked successfully!');
      } else {
        toast.error(response.error || 'Failed to link Jira account.');
      }
    } catch (error) {
      console.error('Error linking Jira account:', error);
      toast.error('An unexpected error occurred while linking Jira.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Project</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Project description is required' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                placeholder="Provide a brief description of your project"
                aria-invalid={errors.description ? 'true' : 'false'}
              ></textarea>
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}

              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm flex items-center justify-between">
                <p className="text-md font-semibold text-gray-700">Estimated Cost:</p>
                {isEstimating ? (
                  <div className="flex items-center text-gray-500">
                    <LoadingSpinner className="mr-2" /> Calculating...
                  </div>
                ) : (
                  <p className="text-lg font-bold text-blue-600">
                    {estimatedCostResult?.estimatedTotal
                      ? `$${estimatedCostResult.estimatedTotal.toFixed(2)}`
                      : '$0.00'}
                  </p>
                )}
              </div>

              {/* GitHub Repositories Section */}
              <div className="border border-gray-200 mt-6 pt-6 p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-medium text-gray-700 mb-4">GitHub Repositories</h3>
                {githubRepositories.length === 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    No repository provided, new one’s will be automatically created on your account.
                  </p>
                )}

                {/* Dynamic rendering of GitHub repositories */}
                {githubRepositories.map((repo, index) =>
                  repo.type === 'new' ? (
                    <NewRepositoryFields
                      key={repo.id}
                      index={index}
                      onRemove={() => removeGithubRepository(index)}
                    />
                  ) : repo.type === 'existing' ? (
                    <ExistingRepositoryFields
                      key={repo.id}
                      index={index}
                      onRemove={() => removeGithubRepository(index)}
                      />
                  ) : null,
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() =>
                      appendGithubRepository({ type: 'new', name: '', isPrivate: false })
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add New Repository
                  </Button>
                  <Button
                    type="button"
                    onClick={() => appendGithubRepository({ type: 'existing', url: '' })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Existing Repository
                  </Button>
                </div>
              </div>

              {estimatedCostResult && !isEstimating && (
                <div className="border border-gray-200 mt-6 pt-6 rounded-md bg-white shadow-sm">
                  <button
                    type="button"
                    className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-700 hover:text-blue-600 focus:outline-none px-4"
                    onClick={() => setShowCostDetails(!showCostDetails)}
                    aria-expanded={showCostDetails}
                  >
                    Cost Estimation Breakdown
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${showCostDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>

                  <div
                    data-testid="cost-details-content"
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      showCostDetails ? 'max-h-screen opacity-100 p-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="bg-white shadow-sm">
                      {estimatedCostResult.modelUsed ? (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full mr-2">
                            ML Model Used
                          </span>
                          Estimation powered by a machine learning model.
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-red-600 mb-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mr-2">
                            Using Heuristic
                          </span>
                          ML model not used.{' '}
                          {estimatedCostResult.modelErrorMessage ||
                            'Falling back to heuristic estimation.'}
                        </div>
                      )}

                        <h3 className="font-semibold text-xl text-gray-800 mb-2">
                          Estimated Project Cost:
                        </h3>
                        <div className="space-y-1 mb-3">
                          <p className="text-gray-700 text-md">
                            Flat Rate Component:{' '}
                            <span className="font-medium">
                              ${estimatedCostResult.flatRateComponent.toFixed(2)}
                            </span>
                          </p>
                          <p className="text-gray-700 text-md">
                            AI API Cost Component:{' '}
                            <span className="font-medium">
                              ${estimatedCostResult.aiApiCostComponent.toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          Total Estimated Cost: ${estimatedCostResult.estimatedTotal.toFixed(2)}
                        </p>
                        <p className="text-md text-gray-600 mt-2">
                          Estimated Completion Time:{' '}
                          <span className="font-semibold">
                            {estimatedCostResult.completionTimeHours.toFixed(2)}
                          </span>{' '}
                          hours
                        </p>
                        {maxRuntimeHours !== undefined &&
                          maxRuntimeHours > 0 &&
                          estimatedCostResult.completionTimeHours > maxRuntimeHours && (
                            <div className="mt-2 text-red-700 font-bold bg-red-100 py-2 px-4 rounded-md border border-red-300">
                              Warning: Estimated runtime (
                              {estimatedCostResult.completionTimeHours.toFixed(2)} hours) clamped to
                              Max Runtime ({maxRuntimeHours.toFixed(2)} hours). Project scope may be
                              too large.
                            </div>
                          )}
                        <p className="text-sm text-gray-500 mt-4 px-4 pb-4">
                          Note: If you provide your own API keys in Advanced Options, their usage
                          rates will apply and may alter the final expenditure not reflected in this
                          estimate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Max Runtime Hours */}
              <div>
                <label
                  htmlFor="maxRuntimeHours"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Runtime (Hours)
                </label>
                <input
                  type="number"
                  id="maxRuntimeHours"
                  {...register('maxRuntimeHours', {
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Must be a positive number' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                  placeholder="e.g., 24"
                  aria-invalid={errors.maxRuntimeHours ? 'true' : 'false'}
                />
                {errors.maxRuntimeHours && (
                  <p className="mt-2 text-sm text-red-600">{errors.maxRuntimeHours.message}</p>
                )}
              </div>

              {/* Max Budget */}
              <div>
                <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Budget ($)
                </label>
                <input
                  type="number"
                  id="maxBudget"
                  step="0.01"
                  {...register('maxBudget', {
                    valueAsNumber: true,
                    min: { value: 0.01, message: 'Must be a positive number' },
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
                  placeholder="e.g., 500.00"
                  aria-invalid={errors.maxBudget ? 'true' : 'false'}
                />
                {errors.maxBudget && (
                  <p className="mt-2 text-sm text-red-600">{errors.maxBudget.message}</p>
                )}
              </div>

              {/* Advanced Options Collapsible Section */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <button
                  type="button"
                  className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-700 hover:text-blue-600 focus:outline-none"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  aria-expanded={showAdvancedOptions}
                >
                  Advanced Options
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${showAdvancedOptions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {/* Content of Advanced Options */}
                <div
                  data-testid="advanced-options-content"
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    showAdvancedOptions ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  {/* AI Model Selection UI */}
                  <div className="space-y-6">
                    {renderAiModelSelection(
                      'utility',
                      'Utility',
                      utilityModels,
                      appendAiModel,
                      removeAiModel,
                    )}
                    {renderAiModelSelection(
                      'low',
                      'Low Intelligence',
                      lowModels,
                      appendAiModel,
                      removeAiModel,
                    )}
                    {renderAiModelSelection(
                      'medium',
                      'Medium Intelligence',
                      mediumModels,
                      appendAiModel,
                      removeAiModel,
                    )}
                    {renderAiModelSelection(
                      'high',
                      'High Intelligence',
                      highModels,
                      appendAiModel,
                      removeAiModel,
                    )}
                    {renderAiModelSelection(
                      'super',
                      'Super Intelligence',
                      superModels,
                      appendAiModel,
                      removeAiModel,
                    )}
                    {renderAiModelSelection(
                      'backup',
                      'Backup',
                      backupModels,
                      appendAiModel,
                      removeAiModel,
                    )}
                    

                    {/* Link Jira Account Button */}
                    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm flex items-center justify-between">
                      <h3 className="text-md font-semibold text-gray-800">Link Jira Account</h3>
                      <Button
                        type="button"
                        onClick={handleLinkJira}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={jiraLinked}
                      >
                        {jiraLinked ? 'Jira Account Linked!' : 'Link Jira Account'}
                      </Button>
                    </div>
                    {jiraLinked && (
                      <p className="mt-2 text-sm text-green-600">Jira account linked successfully!</p>
                    )}
                    {/* Installations Section */}
                    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
                      <h3 className="text-md font-semibold text-gray-800 mb-3">Installations</h3>
                      {/* Display existing installations */}
                      <div className="space-y-3 mb-4">
                        {installationFields.length === 0 ? (
                          <p className="text-sm text-gray-500">No installations added.</p>
                        ) : (
                          installationFields.map((installation, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border border-gray-100 bg-white rounded-md shadow-sm"
                            >
                              <span className="text-sm text-gray-700">{installation}</span>
                              <Button
                                type="button"
                                onClick={() => removeInstallation(index)}
                                variant="destructive"
                                size="sm"
                              >
                                Delete
                              </Button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Installation Button */}
                      <Button
                        type="button"
                        onClick={() => setShowInstallationDropdown(true)}
                        className="mb-4"
                      >
                        Add Installation
                      </Button>

                      {/* Dropdown Menu and Conditional Input */}
                      {showInstallationDropdown && (
                        <div className="mt-4 p-3 border border-gray-100 bg-white rounded-md shadow-sm">
                          <DropdownMenu open={showInstallationDropdown} onOpenChange={setShowInstallationDropdown}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between">
                                {selectedInstallationType || 'Select Installation Type'}
                                <svg
                                  className="ml-2 -mr-0.5 h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  ></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                              {['Python', 'JavaScript/TypeScript', 'Java', 'Go', 'Rust', 'Ruby', 'PHP', 'C#/.NET', 'Swift/Objective-C', 'Kotlin', 'Dart/Flutter', 'React.js', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Ruby on Rails', 'Spring Boot', 'Laravel', 'ASP.NET Core', 'Express.js', 'Docker', 'Kubernetes', 'AWS CLI', 'Azure CLI', 'Google Cloud SDK', 'Terraform', 'Ansible', 'Git', 'GitHub CLI', 'Jira CLI', 'Slack CLI', 'VS Code', 'IntelliJ IDEA', 'PyCharm', 'VS Studio', 'Xcode', 'Android Studio', 'Postman', 'Insomnia', 'DBeaver', 'MongoDB Compass', 'RedisInsight', 'Grafana', 'Prometheus', 'ELK Stack (Elasticsearch, Logstash, Kibana)', 'Jupyter Notebook', 'RStudio', 'Tableau', 'Power BI', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'OpenAPI/Swagger', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'RabbitMQ', 'Nginx', 'Apache HTTP Server', 'Serverless Framework', 'Heroku CLI', 'Vercel CLI', 'Netlify CLI', 'npm', 'yarn', 'Gradle', 'Maven', 'pip', 'Homebrew (macOS)', 'Chocolatey (Windows)', 'GitHub repo', 'Other'].map((option) => (
                                <DropdownMenuItem
                                  key={option}
                                  onSelect={() => {
                                    setSelectedInstallationType(option);
                                    if (option !== 'Other') {
                                      appendInstallation(option);
                                      setShowInstallationDropdown(false);
                                      setCustomInstallationName(''); // Clear custom input
                                    }
                                  }}
                                >
                                  {option}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {selectedInstallationType === 'Other' && (
                            <div className="flex items-center gap-2 mt-3">
                              <Input
                                type="text"
                                placeholder="Enter custom installation name"
                                value={customInstallationName}
                                onChange={(e) => setCustomInstallationName(e.target.value)}
                                onBlur={() => {
                                  if (customInstallationName.trim()) {
                                    appendInstallation(customInstallationName.trim());
                                    setCustomInstallationName('');
                                    setSelectedInstallationType(null);
                                    setShowInstallationDropdown(false);
                                  }
                                }}
                                className="flex-grow"
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  if (customInstallationName.trim()) {
                                    appendInstallation(customInstallationName.trim());
                                    setCustomInstallationName('');
                                    setSelectedInstallationType(null);
                                    setShowInstallationDropdown(false);
                                  }
                                }}
                              >
                                Add Custom
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isPending} // Disable button during submission
                >
                  {isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" /> Starting...
                    </>
                  ) : (
                    'Start'
                  )}{' '}
                </button>
              </div>
            </form>
          </FormProvider>{' '}
          {/* Closing FormProvider tag */}
        </div>
      </div>
    );
  }
