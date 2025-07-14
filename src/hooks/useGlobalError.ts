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
  const setError = useGlobalErrorStore((state) => state.setError);

  const showError = (message: string, details?: string) => {
    setError({ message });
  };

  return { setError, showError };
};
