// src/hooks/useInfiniteUserChats.ts
import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { api, PaginatedResponse } from '@/lib/api';
import { Chat } from '@/types/chat';

interface UseInfiniteUserChatsOptions {
  initialData?: InfiniteData<PaginatedResponse<Chat>, number>;
}

/**
 * Fetches the list of all chat sessions for the current user with infinite scrolling.
 * @param options - Additional react-query options, e.g., `initialData`.
 */
export const useInfiniteUserChats = (options?: UseInfiniteUserChatsOptions) => {
  return useInfiniteQuery<PaginatedResponse<Chat>, Error, InfiniteData<PaginatedResponse<Chat>, number>, string[], number>({
    queryKey: ['userChats'],
    queryFn: ({ pageParam }) => {
      return api.chat.getAllChats({ page: pageParam, limit: 15 });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    ...options,
  });
};
