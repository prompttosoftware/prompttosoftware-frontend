// UPDATES
// 

'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { PaginatedResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ClipboardCheckIcon, FileTextIcon } from 'lucide-react';
import EmptyState from '@/app/(main)/components/EmptyState';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import { useInfiniteUserChats } from '@/hooks/useInfiniteUserChats'; // Import the new hook
import { Chat } from '@/types/chat';

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
        <Link key={chat._id} href={`/chat/${chat._id}`} className="block no-underline">
          <Card className="transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardHeader className="relative">
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
              {chat.analysisId && (
                    <span 
                  title="Analysis Linked" 
                  className="absolute top-4 right-4 text-primary" // top-4 right-4 for position
                >
                  {/* 3. Use FileTextIcon for clarity */}
                  <FileTextIcon className="h-5 w-5" /> 
                </span>
                )}
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
