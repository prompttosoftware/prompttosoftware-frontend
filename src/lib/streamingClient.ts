import { getAuthToken } from '@/utils/auth';
import { logger } from '@/utils/logger';

interface FetchStreamOptions {
  method: 'POST' | 'PUT';
  url: string;
  payload: Record<string, any>;
  onChunk: (chunk: string) => void; // onChunk will now receive the clean string content
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

/**
 * A dedicated client for making API requests that return a Server-Sent Events (SSE) stream.
 * It parses the SSE protocol and calls onChunk with the clean data payload.
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
        'Accept': 'text/event-stream', // Good practice to signal expected content type
      },
      body: JSON.stringify({ ...payload, stream: true }),
    });

    if (!response.ok || !response.body) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to read error response.' }));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break; // Stream finished
      }

      // Add the new data to our buffer
      buffer += decoder.decode(value, { stream: true });

      // Process all complete lines in the buffer
      while (true) {
        const newlineIndex = buffer.indexOf('\n');
        if (newlineIndex === -1) {
          break; // Not a full line yet, wait for more data
        }

        // Get a single line, and remove it from the buffer
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        // Ignore empty lines (like the second '\n' in '\n\n')
        if (line === '') continue;

        // Check for the 'data:' prefix
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            // The backend is sending a JSON-encoded string, so we parse it.
            // e.g., 'data: "Hello"' becomes the string "Hello"
            logger.info(`Chat streaming data revieved: ${jsonStr}`);
            const parsedChunk = JSON.parse(jsonStr);
            if (typeof parsedChunk === 'string') {
              onChunk(parsedChunk);
            }
          } catch (e) {
            logger.error('Failed to parse SSE data chunk:', jsonStr);
          }
        } else if (line.startsWith('event: error')) {
            // Optional: Handle custom error events from the server
            // The next line would be the 'data:' line for the error
            logger.error(`Custom streaming error: ${line}`);
        }
      }
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
