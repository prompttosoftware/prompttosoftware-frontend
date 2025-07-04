'use client'; // This directive indicates that this component should be rendered on the client side.

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
// import { useRouter } from 'next/navigation'; // Using next/navigation for router functionalities
import { useGlobalError } from '@/hooks/useGlobalError'; // Importing the global error hook

// Define the structure for the request payload to the backend
interface AIModelConfig {
  provider: string;
  modelName: string;
  apiKey?: string; // Optional API key
}

interface NewProjectRequest {
  description: string;
  maxRuntimeHours?: number;
  maxBudget?: number;
  advancedOptions?: {
    models?: {
      utility?: AIModelConfig[];
      low?: AIModelConfig[];
      medium?: AIModelConfig[];
      high?: AIModelConfig[];
      super?: AIModelConfig[];
      backup?: AIModelConfig[];
    };
  };
}

// Define the structure for a successful project creation response
interface NewProjectResponse {
  projectId: string;
  message: string;
  // Other fields returned by the API on project creation
}

// Define the shape of an API error response
interface APIError {
  status: number;
  message: string;
  errors?: Record<string, string>; // For validation errors where keys are field names and values are error messages
}

export default function NewProjectPage() {
  const {
    register,
    handleSubmit,
    setError: setFormFieldError,
    control, // Added control for useFieldArray
    formState: { errors },
  } = useForm<NewProjectRequest>();
  const { setError: setGlobalError } = useGlobalError(); // Destructure setError from the global error hook
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage form submission loading state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false); // State to manage visibility of advanced options

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

  // Available AI model companies (providers)
  const AI_COMPANIES = ['OpenAI', 'Google', 'Anthropic', 'Cohere', 'Custom'];

  // const router = useRouter(); // Initialize router for potential redirection - Commented out for now to resolve 'unused' lint error. Uncomment later when navigation is implemented.

  // Handler for form submission
  const onSubmit = async (data: NewProjectRequest) => {
    setIsSubmitting(true); // Set submission state to true
    setGlobalError(null); // Clear any previous global errors

    try {
      console.log('Submitting NewProjectRequest:', data);

      const response = await fetch('/api/projects', {
        // Endpoint should be correctly handled by MSW
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Data already contains advancedOptions.models
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Propagate status and message/errors by throwing a new Error with stringified JSON
        throw new Error(JSON.stringify({ status: response.status, ...errorData }));
      }

      const responseData: NewProjectResponse = await response.json();

      // Handle successful submission
      console.log('Project creation successful:', responseData);
      alert(responseData.message || 'Project created successfully!'); // Temporary success message
      // In a real scenario, you might redirect the user:
      // router.push(`/projects/${responseData.projectId}`);
    } catch (rawError: unknown) {
      console.error('Failed to create project:', rawError);

      let parsedError: APIError;
      try {
        // Attempt to parse the error message if it's a stringified JSON
        const errorMessage = (rawError as Error).message; // Cast rawError to Error to access message
        parsedError = JSON.parse(errorMessage) as APIError; // Cast parsed JSON to APIError
      } catch {
        // If parsing fails, it's a generic error or a real network error
        parsedError = {
          status: 500,
          message: (rawError as Error).message || 'An unexpected error occurred.',
        };
      }

      // Handle API validation errors (e.g., 400 Bad Request)
      if (parsedError.status === 400 && parsedError.errors) {
        // Iterate over field-specific errors and set them using react-hook-form's setError
        for (const field in parsedError.errors) {
          if (Object.prototype.hasOwnProperty.call(parsedError.errors, field)) {
            setFormFieldError(field as keyof NewProjectRequest, {
              type: 'server',
              message: parsedError.errors[field],
            });
          }
        }
        // Optionally, display a general message for validation failure
        setGlobalError({
          message: parsedError.message || 'Please check the form for errors.',
          type: 'warning',
        });
      }
      // Handle generic API errors (e.g., 500 Internal Server Error) or parsing errors
      else {
        setGlobalError({
          message: parsedError.message || 'Failed to create project due to an unexpected error.',
          type: 'error',
        });
      }
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  // Define a type for the intelligence levels to ensure type safety
  type AIModelLevel = keyof NonNullable<NewProjectRequest['advancedOptions']>['models'];

  // Render function for AI model selection UI for a specific intelligence level
  const renderAiModelSelection = (
    type: AIModelLevel,
    title: string,
    fields: typeof utilityModels, // Use a generic type for fields
    append: typeof appendUtilityModel, // Use a generic type for append
    remove: typeof removeUtilityModel, // Use a generic type for remove
  ) => {
    // Define a type for the dynamic field names to ensure type safety with register
    type FieldName = `advancedOptions.models.${AIModelLevel}.${number}.provider` | `advancedOptions.models.${AIModelLevel}.${number}.modelName` | `advancedOptions.models.${AIModelLevel}.${number}.apiKey`;

    return (
      <div
        key={type}
        className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm"
      >
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
                  {...register(`advancedOptions.models.${type}.${index}.provider` as FieldName, { required: 'Provider is required' })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                >
                  <option value="">Select Company</option>
                  {AI_COMPANIES.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
                {errors.advancedOptions?.models?.[type]?.[index]?.provider && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(errors.advancedOptions.models[type][index]?.provider?.message)}
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
                  {...register(`advancedOptions.models.${type}.${index}.modelName` as FieldName, { required: 'Model name is required' })}
                  placeholder="e.g., gpt-4-turbo"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                />
                {errors.advancedOptions?.models?.[type]?.[index]?.modelName && (
                  <p className="mt-1 text-sm text-red-600">
                    {String(errors.advancedOptions.models[type][index]?.modelName?.message)}
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
                <input
                  type="text"
                  id={`${type}-apiKey-${index}`}
                  {...register(`advancedOptions.models.${type}.${index}.apiKey` as FieldName)}
                  placeholder="e.g., sk-..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                />
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-4 sm:mt-auto p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex-shrink-0"
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
              </button>
            </div>
          ))}
        </div>

        {/* Add Another Model Button */}
        <button
          type="button"
          onClick={() => append({ provider: '', modelName: '', apiKey: '' })}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Project</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
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
                {(errors.advancedOptions?.models?.utility as any)?.message && <p className="mt-2 text-sm text-red-600">{(errors.advancedOptions.models.utility as any).message}</p>}
                {renderAiModelSelection('utility', 'Utility', utilityModels, appendUtilityModel, removeUtilityModel)}
                {(errors.advancedOptions?.models?.low as any)?.message && <p className="mt-2 text-sm text-red-600">{(errors.advancedOptions.models.low as any).message}</p>}
                {renderAiModelSelection('low', 'Low Intelligence', lowModels, appendLowModel, removeLowModel)}
                {(errors.advancedOptions?.models?.medium as any)?.message && <p className="mt-2 text-sm text-red-600">{(errors.advancedOptions.models.medium as any).message}</p>}
                {renderAiModelSelection('medium', 'Medium Intelligence', mediumModels, appendMediumModel, removeMediumModel)}
                {(errors.advancedOptions?.models?.high as any)?.message && <p className="mt-2 text-sm text-red-600">{(errors.advancedOptions.models.high as any).message}</p>}
                {renderAiModelSelection('high', 'High Intelligence', highModels, appendHighModel, removeHighModel)}
                {(errors.advancedOptions?.models?.super as any)?.message && <p className="mt-2 text-sm text-red-600">{(errors.advancedOptions.models.super as any).message}</p>}
                {renderAiModelSelection('super', 'Super Intelligence', superModels, appendSuperModel, removeSuperModel)}
                {(errors.advancedOptions?.models?.backup as any)?.message && <p className="mt-2 text-sm text-red-600">{(errors.advancedOptions.models.backup as any).message}</p>}
                {renderAiModelSelection('backup', 'Backup', backupModels, appendBackupModel, removeBackupModel)}
              </div>
            </div>
          </div>
          
          {/* Start Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting} // Disable button during submission
            >
              {isSubmitting ? 'Starting...' : 'Start'}{' '}
              {/* Change button text based on loading state */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
