/**
 * @interface GlobalError
 * @description Defines the structure for a global error object used throughout the application.
 *              This can be used to standardize error messages and provide additional context.
 */
interface GlobalError {
  message: string;
  type?: 'error' | 'warning' | 'info';
  details?: unknown;
}

/**
 * @interface UserProfile
 * @description Represents the profile information of an authenticated user.
 *              NOTE: The fields below are placeholder and should be updated
 *              according to the actual specification in Epic PROM-82, section 3.2.
 */
interface UserProfile {
  id: string; // Unique identifier for the user
  email: string; // User's email address, often used as a primary identifier
  firstName?: string; // Optional: User's first name
  lastName?: string; // Optional: User's last name
  roles?: string[]; // Optional: Array of roles/permissions assigned to the user
  isNewUser?: boolean; // Indicates if the user is new and should see a tutorial
  // Add more fields as per Epic PROM-82, section 3.2 "Data models or schema"
}
