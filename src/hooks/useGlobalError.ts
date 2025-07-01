import { useGlobalErrorStore } from '../store/globalErrorStore';

/**
 * Custom hook to provide a convenient way to set global errors.
 * This hook abstracts the direct interaction with the global error store,
 * making it easier for components to dispatch errors.
 *
 * @returns A function `setError` that takes a `GlobalError` object
 *          or `null` to clear the error.
 */
export const useGlobalError = () => {
  // Destructure setError from the global error store.
  // This provides direct access to the function that updates the global error state.
  const setError = useGlobalErrorStore((state) => state.setError);

  // Return the setError function.
  // Any component using this hook can then call setError(errorObject)
  // to dispatch a global error.
  return { setError };
};
