import { getAuthToken } from '@/utils/auth';
import { logger } from '@/utils/logger';

interface FetchStreamOptions {
  method: 'POST' | 'PUT';
  url: string;
  payload: Record<string, any>;
  onChunk: (chunk: string) => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

/**
 * A dedicated client for making API requests that return a streaming response.
 * Uses the native Fetch API.
 */
export const fetchStream = async ({
  method,
  url,
  payload,
  onChunk,
  onFinish,
  onError,
}: FetchStreamOptions): Promise<void> => {
  try {
    const token = getAuthToken();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ ...payload, stream: true }), // Crucially, we add stream: true
    });

    if (!response.ok || !response.body) {
      // Handle HTTP errors (e.g., 400, 401, 500)
      const errorData = await response.json().catch(() => ({ message: 'Failed to read error response.' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break; // The stream has finished
      }
      const chunk = decoder.decode(value);
      onChunk(chunk);
    }
  } catch (error: any) {
    logger.error('Streaming fetch failed:', error);
    if (onError) {
      onError(error);
    }
  } finally {
    if (onFinish) {
      onFinish();
    }
  }
};
