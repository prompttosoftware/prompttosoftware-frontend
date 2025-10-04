// src/hooks/useChat.ts
import { api } from '@/lib/api';
import { GetChatResponse } from '@/types/chat';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

type UseChatOptions = Omit<
  UseQueryOptions<GetChatResponse, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Fetches a single chat session and its active message history.
 * @param chatId The ID of the chat.
 * @param options - Additional react-query options, e.g., `initialData`.
 */
export const useChat = (chatId?: string, options?: UseChatOptions) => {
  return useQuery<GetChatResponse, Error>({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      if (!chatId) {
        throw new Error('Chat ID is required to fetch chat history.');
      }
      return api.chat.getChatHistory(chatId);
    },
    enabled: !!chatId, // The query will not run until a chatId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};
