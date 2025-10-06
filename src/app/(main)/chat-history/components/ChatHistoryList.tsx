'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PaginatedResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileTextIcon, Trash2 } from 'lucide-react';
import EmptyState from '@/app/(main)/components/EmptyState';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import { useInfiniteUserChats } from '@/hooks/useInfiniteUserChats'; // Import the new hook
import { Chat } from '@/types/chat';
import { useChatActions } from '@/hooks/useChatActions';
import { useGlobalErrorStore } from '@/store/globalErrorStore';

interface ChatHistoryListProps {
  initialChats: PaginatedResponse<Chat>;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ initialChats }) => {
  // Use the clean, dedicated hook for fetching the data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteUserChats({
    // Provide the server-fetched data to the hook
    initialData: {
      pages: [initialChats],
      pageParams: [1],
    },
  });

  // 3. Get the deleteChat mutation and its pending state
  const { deleteChat } = useChatActions();

  const { showConfirmation } = useGlobalErrorStore(); // 2. Get the showConfirmation function from the store

  // 3. Update the handler to use the custom confirmation dialog
  const handleDeleteChat = (e: React.MouseEvent, chatId: string, chatName?: string) => {
    e.preventDefault();
    e.stopPropagation();

    const title = 'Delete Chat?';
    const message = `Are you sure you want to permanently delete "${
      chatName || `this chat`
    }"? This action cannot be undone.`;

    showConfirmation(
      title,
      message,
      // onConfirm: This function is executed when the user confirms.
      () => {
        deleteChat.mutate(chatId);
      },
      // options: Customize the dialog buttons
      {
        confirmText: 'Delete Chat',
        // We don't need a confirmPhrase for this action.
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonLoader key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Error Loading History"
        description="We couldn't load your chat history. Please try again later."
      />
    );
  }

  const allChats = data?.pages.flatMap(page => page.data ?? []) ?? [];

  if (allChats.length === 0) {
    return (
      <EmptyState
        title="No Chats Yet"
        description="Start a new conversation to see it here."
        buttonLink="/chat/new"
        buttonText="Start New Chat"
      />
    );
  }

    return (
    <div className="space-y-4">
      {allChats.map(chat => (
        // Each card is still a link, but we'll stop the button click from triggering it
        <Link key={chat._id} href={`/chat/${chat._id}`} className="block no-underline group">
          <Card className="transition-all hover:shadow-sm border">
            {/* Added extra padding on the right to make space for the buttons */}
            <CardHeader className="relative pr-24">
              {/* 5. Container for action icons in the top-right corner */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                {chat.analysisId && (
                  <span title="Analysis Linked" className="text-primary">
                    <FileTextIcon className="h-5 w-5" />
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  // Make the button appear on hover for a cleaner look (optional)
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                   onClick={(e) => handleDeleteChat(e, chat._id, chat.name)}
                  disabled={deleteChat.isPending} // Disable while a delete is in progress
                  title="Delete chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                  <CardTitle className="flex items-center gap-2">
                    {chat.name || `Chat from ${format(new Date(chat.createdAt), 'PP')}`}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-muted-foreground">
                    Created: {format(new Date(chat.createdAt), 'Pp')}
                  </CardDescription>
                </div>
              </div>
              {/* Removed old analysis icon from here as it's now in the actions container */}
            </CardHeader>
          </Card>
        </Link>
      ))}

      {hasNextPage && (
        <div className="text-center mt-6">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryList;
