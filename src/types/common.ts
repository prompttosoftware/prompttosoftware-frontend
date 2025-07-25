/**
 * Common error response interface for consistency across APIs.
 */
export interface APIErrorResponse {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Standardized error message for internal server errors.
 * This is generally a non-descriptive message returned to the client for 5xx errors,
 * while detailed errors are logged on the server.
 */
export interface InternalServerErrorMessage {
  message: string;
}

// Type guard for API common error response
export function isAPIErrorResponse(data: unknown): data is APIErrorResponse {
  return typeof data === 'object' && data !== null && 'message' in data;
}

// Type guard for Internal Server Error Message
export function isInternalServerErrorMessage(data: unknown): data is InternalServerErrorMessage {
  return (
    typeof data === 'object' && data !== null && 'message' in data && Object.keys(data).length === 1 // Typically, only contains a message field
  );
}

/**
 * Interface for a paginated API response.
 * @template T The type of the items in the paginated list.
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
