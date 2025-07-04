export function getAuthToken(): string | null {
  // In a real application, this would retrieve the token from localStorage,
  // sessionStorage, or a secure cookie.
  // For now, we'll return a placeholder or null.
  // Replace this with actual token retrieval logic from your authentication epic.
  return localStorage.getItem('authToken'); // Example: retrieving from localStorage
}

export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('authToken');
}
