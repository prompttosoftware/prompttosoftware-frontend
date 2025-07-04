'use client'; // This directive indicates that this component should be rendered on the client side.

import { useState, useEffect } from 'react';
import {
  useForm,
  useFieldArray,
  useFormContext,
  FormProvider,
  FieldArrayWithId, // Add FieldArrayWithId
  FieldErrorsImpl, // Add FieldErrorsImpl for type safety with nested errors
} from 'react-hook-form';
import useDebounce from '@/hooks/useDebounce'; // Import useDebounce hook
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner'; // Import LoadingSpinner
import {
  getEstimatedDurationAndCost,
  FLAT_RATE_PER_HOUR,
  HOURLY_AI_API_COST,
} from '@/services/costEstimationService'; // Import cost estimation service
import { useRouter } from 'next/navigation'; // Using next/navigation for router functionalities
import { useGlobalError } from '@/hooks/useGlobalError'; // Importing the global error hook
import { NewRepositoryFields } from './NewRepositoryFields'; // Import NewRepositoryFields
import { ExistingRepositoryFields } from './ExistingRepositoryFields'; // Import ExistingRepositoryFields
import axios from 'axios'; // Import axios
import { axiosInstance } from '@/lib/httpClient'; // Import axiosInstance
import { logger } from '@/lib/logger'; // Import logger
import { useMutation } from '@tanstack/react-query'; // Import useMutation for API calls

// Define the structure for the request payload to the backend
import { z } from 'zod';

interface AIModelConfig {
  provider: string;
  modelName: string;
  apiKey?: string; // Optional API key
}

// Define the Zod schema for the form
const formSchema = z.object({
  description: z.string().min(1, 'Project description is required'),
  maxRuntimeHours: z.number().positive('Must be a positive number').optional(),
  maxBudget: z.number().positive('Must be a positive number').optional(),
  githubRepositories: z.array(
    z.discriminatedUnion('type', [
      z.object({
        id: z.string().optional(),
        type: z.literal('new'),
        name: z.string().min(1, 'Repository name is required'),
        organization: z.string().optional(),
        isPrivate: z.boolean(),
      }),
      z.object({
        id: z.string().optional(),
        type: z.literal('existing'),
        url: z.string().url('Invalid URL format').min(1, 'GitHub Repository URL is required'),
      }),
    ]),
  ),
  advancedOptions: z
    .object({
      models: z
        .object({
          utility: z
            .array(
              z.object({
                provider: z.string().min(1, 'Provider is required'),
                modelName: z.string().min(1, 'Model name is required'),
                apiKey: z.string().optional(),
              }),
            )
            .optional(),
          low: z
            .array(
              z.object({
                provider: z.string().min(1, 'Provider is required'),
                modelName: z.string().min(1, 'Model name is required'),
                apiKey: z.string().optional(),
              }),
            )
            .optional(),
          medium: z
            .array(
              z.object({
                provider: z.string().min(1, 'Provider is required'),
                modelName: z.string().min(1, 'Model name is required'),
                apiKey: z.string().optional(),
              }),
            )
            .optional(),
          high: z
            .array(
              z.object({
                provider: z.string().min(1, 'Provider is required'),
                modelName: z.string().min(1, 'Model name is required'),
                apiKey: z.string().optional(),
              }),
            )
            .optional(),
          super: z
            .array(
              z.object({
                provider: z.string().min(1, 'Provider is required'),
                modelName: z.string().min(1, 'Model name is required'),
                apiKey: z.string().optional(),
              }),
            )
            .optional(),
          backup: z
            .array(
              z.object({
                provider: z.string().min(1, 'Provider is required'),
                modelName: z.string().min(1, 'Model name is required'),
                apiKey: z.string().optional(),
              }),
            )
            .optional(),
        })
        .optional(),
      installations: z
        .array(z.object({ value: z.string().min(1, 'Installation must not be empty') }))
        .optional(), // ADDED
      linkJira: z.boolean().optional(), // ADDED
    })
    .optional(),
});

type NewProjectRequest = z.infer<typeof formSchema>;

interface NewProjectResponse {
  id: string; // Changed from projectId to id to match Project interface
  message: string;
  // Other fields returned by the API on project creation
}

type MutationResponseData = {
  message?: string;
  errors?: Record<string, string>;
};

interface MutationAPIError {
  response?: {
    status: number;
    data?: MutationResponseData;
  };
  message: string;
}

interface CostEstimationResult {
  estimatedTotal: number;
  completionTimeHours: number; // Estimated completion time in hours
  flatRateComponent: number;
  aiApiCostComponent: number;
  modelUsed: boolean;
  modelErrorMessage: string | null;
}

export default function NewProjectPage() {
  const methods = useForm<NewProjectRequest>({
    defaultValues: {
      description: '',
      githubRepositories: [],
      advancedOptions: {
        models: {
          utility: [],
          low: [],
          medium: [],
          high: [],
          super: [],
          backup: [],
        },
        installations: [], // Still an empty array for default, but will hold { value: '' } objects
        linkJira: false,
      },
    },
  }); // Initialize useForm and get all its methods
  // Destructure individual properties from methods if needed, or pass 'methods' directly
  const {
    register,
    handleSubmit,
    setError: setFormFieldError,
    control, // Added control for useFieldArray
    watch, // Add watch to get form values
    formState: { errors },
    setValue, // Add setValue to manually set form values
  } = methods; // Use methods from the initialized useForm
  const { setError: setGlobalError } = useGlobalError(); // Destructure setError from the global error hook
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false); // State to manage visibility of advanced options
  const [showCostDetails, setShowCostDetails] = useState(false); // State for cost breakdown visibility
  const [estimatedCostResult, setEstimatedCostResult] = useState<CostEstimationResult | null>(null); // State for estimated cost result
  const [isEstimating, setIsEstimating] = useState(false); // State to show loading for estimation

  const projectDescription = watch('description');
  const debouncedDescription = useDebounce(projectDescription, 500); // Debounce description input by 500ms

  useEffect(() => {
    const estimateCost = async () => {
      if (debouncedDescription) {
        setIsEstimating(true);
        // logger.debug('Debounced description for estimation:', debouncedDescription); // Use logger instead of console.log
        try {
          const { estimatedDuration, calculatedCost, modelUsed, modelErrorMessage } =
            await getEstimatedDurationAndCost(debouncedDescription);

          setEstimatedCostResult({
            estimatedTotal: calculatedCost, // Total cost
            completionTimeHours: estimatedDuration, // Estimated duration
            flatRateComponent: FLAT_RATE_PER_HOUR * estimatedDuration, // Component for flat rate
            aiApiCostComponent: HOURLY_AI_API_COST * estimatedDuration, // Component for AI API cost
            modelUsed: modelUsed, // Indicate if ML model was used
            modelErrorMessage: modelUsed ? '' : modelErrorMessage, // Any message related to model usage/fallback
          });
        } catch (error) {
          console.error('Error calculating estimation:', error);
          // Handle error, perhaps set an error message in the UI
          setEstimatedCostResult({
            estimatedTotal: 0,
            completionTimeHours: 0,
            flatRateComponent: 0,
            aiApiCostComponent: 0,
            modelUsed: false,
            modelErrorMessage: 'Could not estimate cost. Please try again later.',
          });
        } finally {
          setIsEstimating(false);
        }
      } else {
        setEstimatedCostResult(null); // Clear estimation if description is empty
      }
    };

    estimateCost();
  }, [debouncedDescription]);

  // Use useFieldArray for managing dynamic AI model arrays for each intelligence level
  const {
    fields: utilityModels,
    append: appendUtilityModel,
    remove: removeUtilityModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.models.utility',
  });

  const {
    fields: lowModels,
    append: appendLowModel,
    remove: removeLowModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.models.low',
  });

  const {
    fields: mediumModels,
    append: appendMediumModel,
    remove: removeMediumModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.models.medium',
  });

  const {
    fields: highModels,
    append: appendHighModel,
    remove: removeHighModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.models.high',
  });

  const {
    fields: superModels,
    append: appendSuperModel,
    remove: removeSuperModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.models.super',
  });

  const {
    fields: backupModels,
    append: appendBackupModel,
    remove: removeBackupModel,
  } = useFieldArray({
    control,
    name: 'advancedOptions.models.backup',
  });

  const {
    fields: installationFields,
    append: appendInstallation,
    remove: removeInstallation,
  } = useFieldArray({
    control,
    name: 'advancedOptions.installations',
  });

  const {
    fields: githubRepositories,
    append: appendGithubRepository,
    remove: removeGithubRepository,
  } = useFieldArray({
    control,
    name: 'githubRepositories',
  });

  // State for Jira linking
  const [jiraLinked, setJiraLinked] = useState(false);

  const handleLinkJira = () => {
    // Mock Jira OAuth flow:
    // 1. Set the form value
    setValue('advancedOptions.linkJira', true);
    // 2. Update local state to show message and disable button
    setJiraLinked(true);
    // Optional: Reset after a few seconds
    setTimeout(() => {
      setJiraLinked(false);
      // We might want to keep the form value as true if the link is persistent
      // or set it to false if this mock is just for demonstration of the action.
      // For now, let's keep it true in the form.
    }, 5000); // Message disappears after 5 seconds
  };

  // Available AI model companies (providers)
  const AI_COMPANIES = ['OpenAI', 'Google', 'Anthropic', 'Cohere', 'Custom'];

  const maxRuntimeHours = watch('maxRuntimeHours'); // Watch maxRuntimeHours for the warning message

  const router = useRouter(); // Initialize router for potential redirection

  const createProject = async (data: NewProjectRequest): Promise<NewProjectResponse> => {
    const response = await axiosInstance.post<NewProjectResponse>('/projects', data);
    return response.data;
  };

  const {
    mutateAsync,
    isPending, // Renamed from isLoading for React Query v5
    error: mutationError,
    reset: resetMutation, // To clear mutation state if needed
  } = useMutation<NewProjectResponse, MutationAPIError, NewProjectRequest>({
    mutationFn: createProject,
    onSuccess: (data) => {
      logger.info('Project creation successful:', { projectId: data.id, responseData: data });
      router.push(`/projects/${data.id}`);
      methods.reset(); // Reset form states after successful submission
      resetMutation(); // Clear any mutation errors/state
    },
    onError: (error) => {
      logger.error('Failed to create project:', error);
      setGlobalError(null); // Clear previous global errors

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Destructure safely, assuming error.response is already checked
          const { status, data: errorData } = error.response;
          // The errorData might be structured as { message: string, errors: {} } or just { message: string }
          // Ensure errorData is treated as the correct type. Cast to the expected inner data structure.
          const apiError = errorData as MutationResponseData;

          // Handle API validation errors (e.g., 400 Bad Request)
          if (status === 400 && apiError && apiError.errors) {
            for (const field in apiError.errors) {
              if (Object.prototype.hasOwnProperty.call(apiError.errors, field)) {
                // Adjust field mapping for nested 'description'
                const formField =
                  field === 'description' ? 'description' : (field as keyof NewProjectRequest);
                setFormFieldError(formField, {
                  type: 'server',
                  message: apiError.errors[field],
                });
              }
            }
            setGlobalError({
              message: apiError.message || 'Please check the form for errors.',
              type: 'warning',
            });
          }
          // Handle other API errors
          else {
            setGlobalError({
              message: apiError?.message || `Failed to create project. Status: ${status}`,
              type: 'error',
            });
          }
        } else if (error.request) {
          // The request was made but no response was received (e.g., network error, CORS issues)
          setGlobalError({
            message:
              'Network error: No response received from server. Please check your connection or CORS settings.',
            type: 'error',
          });
          logger.error('Axios error without response (request made):', String(error));
        } else {
          // Something happened in setting up the request that triggered an Error
          setGlobalError({
            message: `Request setup error: ${error.message}. Please try again.`,
            type: 'error',
          });
          logger.error('Axios request setup error:', String(error));
        }
      } else {
        // Handle non-Axios errors
        setGlobalError({
          message:
            'An unexpected client-side error occurred while trying to create the project. Please try again.',
          type: 'error',
        });
        logger.error('Non-Axios error:', String(error));
      }
    },
  });

  // Handler for form submission
  const onSubmit = async (data: NewProjectRequest) => {
    logger.debug(
      'Submitting new project data:',
      JSON.stringify(
        data,
        (key, value) => {
          // Redact sensitive API keys from the log output for security
          if (key === 'apiKey') {
            return '***REDACTED***';
          }
          return value;
        },
        2,
      ),
    );
    try {
      // Use mutateAsync to trigger the API call via React Query
      // The handling of loading, success, and error is now managed by useMutation's callbacks
      await mutateAsync(data);
    } catch (error) {
      console.error('Mutation error caught in onSubmit:', error);
      // The error is already handled by useMutation's onError, but this catch ensures we see it here too,
      // and also logs the specific error for debugging.
      logger.error('Error during mutateAsync call:', error);
    }
  };

  // Define a type for the intelligence levels to ensure type safety
  type AIModelLevel = 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';

  // Render function for AI model selection UI for a specific intelligence level
  const renderAiModelSelection = <TLevel extends AIModelLevel>( // Make it generic
    type: TLevel, // Use the generic type here
    title: string,
    // Use the generic type in FieldArrayWithId
    fields: FieldArrayWithId<NewProjectRequest, `advancedOptions.models.${TLevel}`, 'id'>[],
    append: (value: AIModelConfig) => void,
    remove: (index?: number | number[]) => void,
  ) => {
    // Safely access the errors for the current model type, ensuring it's treated as an array of error objects
    // The FieldErrorsImpl type from react-hook-form correctly represents errors for array fields.
    type ModelErrorsArray = FieldErrorsImpl<AIModelConfig>[];
    const currentModelTypeErrors = errors.advancedOptions?.models?.[type] as
      | ModelErrorsArray
      | undefined;

    return (
      <div key={type} className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
        <h3 className="text-md font-semibold text-gray-800 mb-3">{title} AI Models</h3>
        {fields.length === 0 && (
          <p className="text-sm text-gray-500 mb-3">No models configured for {title}.</p>
        )}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col sm:flex-row gap-3 items-center p-3 border border-gray-100 bg-white rounded-md shadow-sm"
            >
              {/* Provider Dropdown */}
              <div className="flex-1 w-full sm:w-auto">
                <label
                  htmlFor={`${type}-provider-${index}`}
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Provider
                </label>
                <select
                  id={`${type}-provider-${index}`}
                  {...register(`advancedOptions.models.${type}.${index}.provider`, {
                    required: 'Provider is required',
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                >
                  <option value="">Select Company</option>
                  {AI_COMPANIES.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                {currentModelTypeErrors?.[index]?.provider && (
                  <p className="mt-1 text-sm text-red-600">
                    {/* Accessing message directly from the error object */}
                    {currentModelTypeErrors[index].provider.message}
                  </p>
                )}
              </div>

              {/* Model Name Textbox */}
              <div className="flex-1 w-full sm:w-auto">
                <label
                  htmlFor={`${type}-modelName-${index}`}
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Model Name
                </label>
                <input
                  type="text"
                  id={`${type}-modelName-${index}`}
                  {...register(`advancedOptions.models.${type}.${index}.modelName`, {
                    required: 'Model name is required',
                  })}
                  placeholder="e.g., gpt-4-turbo"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                />
                {currentModelTypeErrors?.[index]?.modelName && (
                  <p className="mt-1 text-sm text-red-600">
                    {currentModelTypeErrors[index].modelName.message}
                  </p>
                )}
              </div>

              {/* API Key Textbox (Optional) */}
              <div className="flex-1 w-full sm:w-auto">
                <label
                  htmlFor={`${type}-apiKey-${index}`}
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  API Key (Optional)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id={`${type}-apiKey-${index}`}
                    {...register(`advancedOptions.models.${type}.${index}.apiKey`)}
                    placeholder="e.g., sk-..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 pr-10" // Add pr-10 for potential reveal icon
                  />
                  {/* Conditionally display "protected" or a reveal icon */}
                  {watch(`advancedOptions.models.${type}.${index}.apiKey`) ? (
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400">
                      Protected
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                onClick={() => remove(index)}
                variant="destructive"
                size="icon"
                className="mt-4 sm:mt-auto flex-shrink-0"
                aria-label={`Remove ${title} model ${index + 1}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </Button>
            </div>
          ))}
        </div>

        {/* Add Another Model Button */}
        <Button
          type="button"
          onClick={() => append({ provider: '', modelName: '', apiKey: '' })}
          className="mt-4"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Add Another Model
        </Button>
      </div>
    );
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

              {isEstimating && (
                <div className="mt-2 text-sm text-gray-500 flex items-center">
                  <LoadingSpinner className="mr-2" /> Estimating cost...
                </div>
              )}

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
                          <p className="text-sm text-yellow-600 mt-2">
                            Warning: Estimated completion time (
                            {estimatedCostResult.completionTimeHours.toFixed(2)} hours) exceeds the
                            maximum runtime ({maxRuntimeHours.toFixed(2)} hours).
                          </p>
                        )}
                      <p className="text-sm text-gray-500 mt-4 px-4 pb-4">
                        Please note: Providing your own API keys for AI models may impact the final
                        project cost, potentially leading to charges beyond the estimated amount.
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
                  {(errors.advancedOptions?.models?.utility as any)?.message && (
                    <p className="mt-2 text-sm text-red-600">
                      {(errors.advancedOptions?.models?.utility as any)?.message}
                    </p>
                  )}
                  {renderAiModelSelection(
                    'utility',
                    'Utility',
                    utilityModels,
                    appendUtilityModel,
                    removeUtilityModel,
                  )}
                  {(errors.advancedOptions?.models?.low as any)?.message && (
                    <p className="mt-2 text-sm text-red-600">
                      {(errors.advancedOptions?.models?.low as any)?.message}
                    </p>
                  )}
                  {renderAiModelSelection(
                    'low',
                    'Low Intelligence',
                    lowModels,
                    appendLowModel,
                    removeLowModel,
                  )}
                  {(errors.advancedOptions?.models?.medium as any)?.message && (
                    <p className="mt-2 text-sm text-red-600">
                      {(errors.advancedOptions?.models?.medium as any)?.message}
                    </p>
                  )}
                  {renderAiModelSelection(
                    'medium',
                    'Medium Intelligence',
                    mediumModels,
                    appendMediumModel,
                    removeMediumModel,
                  )}
                  {(errors.advancedOptions?.models?.high as any)?.message && (
                    <p className="mt-2 text-sm text-red-600">
                      {(errors.advancedOptions?.models?.high as any)?.message}
                    </p>
                  )}
                  {renderAiModelSelection(
                    'high',
                    'High Intelligence',
                    highModels,
                    appendHighModel,
                    removeHighModel,
                  )}
                  {(errors.advancedOptions?.models?.super as any)?.message && (
                    <p className="mt-2 text-sm text-red-600">
                      {(errors.advancedOptions?.models?.super as any)?.message}
                    </p>
                  )}
                  {renderAiModelSelection(
                    'super',
                    'Super Intelligence',
                    superModels,
                    appendSuperModel,
                    removeSuperModel,
                  )}
                  {(errors.advancedOptions?.models?.backup as any)?.message && (
                    <p className="mt-2 text-sm text-red-600">
                      {(errors.advancedOptions?.models?.backup as any)?.message}
                    </p>
                  )}
                  {renderAiModelSelection(
                    'backup',
                    'Backup',
                    backupModels,
                    appendBackupModel,
                    removeBackupModel,
                  )}
                  {/* Installations Section */}
                  <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Installations</h3>
                    {installationFields.length === 0 && (
                      <p className="text-sm text-gray-500 mb-3">No installations configured.</p>
                    )}
                    <div className="space-y-4">
                      {installationFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex flex-col sm:flex-row gap-3 items-center p-3 border border-gray-100 bg-white rounded-md shadow-sm"
                        >
                          <div className="flex-1 w-full sm:w-auto">
                            <label
                              htmlFor={`installation-${index}`}
                              className="block text-xs font-medium text-gray-600 mb-1"
                            >
                              Installation ID or Type
                            </label>
                            <input
                              type="text"
                              id={`installation-${index}`}
                              {...register(`advancedOptions.installations.${index}.value`, {
                                required: 'Installation is required',
                              })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                              placeholder="e.g., programming language, GitHub repo, other"
                            />
                            {/* Adjusted error access path */}
                            {errors.advancedOptions?.installations?.[index]?.value && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.advancedOptions.installations[index]?.value?.message}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeInstallation(index)}
                            variant="destructive"
                            size="icon"
                            className="mt-4 sm:mt-auto flex-shrink-0"
                            aria-label={`Remove installation ${index + 1}`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      onClick={() => appendInstallation({ value: '' })}
                      className="mt-4"
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                      Add Installation
                    </Button>
                  </div>

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
