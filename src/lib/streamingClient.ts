// src/lib/fetchStreamClient.ts

import { getAuthToken } from '@/utils/auth';
import { logger } from '@/utils/logger';

export interface FetchStreamOptions<T> {
  method: 'POST' | 'PUT';
  url: string;
  payload: Record<string, any>;
  onChunk: (data: T) => void; // onChunk now receives the parsed data of type T
  onFinish?: () => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/**
 * A universal client for Server-Sent Events (SSE) streams.
 * It intelligently handles both JSON objects and raw string data.
 */
export const fetchStream = async <T>({
  method,
  url,
  payload,
  onChunk,
  onFinish,
  onError,
  signal,
}: FetchStreamOptions<T>): Promise<void> => {
  try {
    const token = getAuthToken();
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ ...payload, stream: true }),
      signal,
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Use a robust boundary of two newlines to separate messages
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const message = buffer.substring(0, boundary);
        buffer = buffer.substring(boundary + 2);

        const dataLine = message.split('\n').find(line => line.startsWith('data: '));
        if (dataLine) {
          const content = dataLine.substring(6).trim();
          
          try {
            // First, try to parse the content as JSON.
            // This will work for the project creation stream.
            const parsedData = JSON.parse(content) as T;
            onChunk(parsedData);
          } catch (e) {
            // If JSON.parse fails, assume it's a raw string chunk.
            // This will work for the chat stream.
            // We need to ensure the raw string is compatible with the expected type T.
            // By convention, if a string is expected, T will be `string`.
            if (typeof content === 'string') {
              onChunk(content as T);
            } else {
               logger.error('Failed to process non-string SSE data chunk:', content, e);
            }
          }
        }
        boundary = buffer.indexOf('\n\n');
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      logger.info('Fetch aborted as expected.');
      return;
    }
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
