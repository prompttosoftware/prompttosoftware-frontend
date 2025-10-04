// src/hooks/useUserChats.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Chat, PaginationParams } from '@/types/chat';
import { api, PaginatedResponse } from '@/lib/api';

type UseUserChatsOptions = Omit<
  UseQueryOptions<PaginatedResponse<Chat>, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * Fetches the list of all chat sessions for the current user.
 * @param params - Pagination parameters (page, limit).
 * @param options - Additional react-query options.
 */
export const useUserChats = (params: PaginationParams = {}, options?: UseUserChatsOptions) => {
  return useQuery<PaginatedResponse<Chat>, Error>({
    queryKey: ['userChats', params], // Pagination params must be in the key
    queryFn: () => api.chat.getAllChats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
