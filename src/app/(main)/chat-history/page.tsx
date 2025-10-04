import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ChatHistoryList from './components/ChatHistoryList';
import { fetchAllChats } from '@/lib/data/chat';

// Revalidate page data to keep it relatively fresh
export const revalidate = 60;

const ChatHistoryPage = async () => {
  // Fetch initial data on the server for a faster first load.
  const initialChats = await fetchAllChats({ page: 1, limit: 15 });

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chat History</h1>
        <Link href="/chat/new" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>
      <ChatHistoryList initialChats={initialChats} />
    </div>
  );
};

export default ChatHistoryPage;
