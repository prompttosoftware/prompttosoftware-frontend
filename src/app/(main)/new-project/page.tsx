'use client'; // This directive indicates that this component should be rendered on the client side.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { useRouter } from 'next/navigation'; // Using next/navigation for router functionalities
import { useGlobalError } from '@/hooks/useGlobalError'; // Importing the global error hook

// Define the structure for the request payload to the backend
interface NewProjectRequest {
  description: string;
  maxRuntimeHours?: number;
  maxBudget?: number;
  // Add other fields as per API specification during subsequent tasks
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
    formState: { errors },
  } = useForm<NewProjectRequest>();
  const { setError: setGlobalError } = useGlobalError(); // Destructure setError from the global error hook
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage form submission loading state
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
        body: JSON.stringify(data),
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
