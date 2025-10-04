import { notFound } from 'next/navigation';
import ChatClient from '../components/ChatClient';
import { fetchChatById } from '@/lib/data/chat';
import { fetchUserAnalysis } from '@/lib/data/analysis';

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

// Ensure fresh data on each visit
export const revalidate = 0;

const ChatPage = async (props: ChatPageProps) => {
  let chatId: string;
  
  try {
    if (!props || !props.params) {
      console.error('No props or params provided');
      notFound();
    }
    
    // Handle both Promise and direct object cases for backward compatibility
    let resolvedParams;
    if (typeof props.params.then === 'function') {
      // It's a Promise
      resolvedParams = await props.params;
    } else {
      // It's already an object (shouldn't happen in Next.js 15+, but just in case)
      resolvedParams = props.params as any;
    }
    
    console.log('Resolved params:', resolvedParams);
    
    if (!resolvedParams || typeof resolvedParams.chatId !== 'string') {
      console.error('Invalid resolved params:', resolvedParams);
      notFound();
    }
    
    chatId = resolvedParams.chatId;
    console.log('Final ID:', chatId);
    
  } catch (error) {
    console.error('Error resolving params:', error);
    notFound();
  }

  const initialData = await fetchChatById(chatId);
  const analyses = await fetchUserAnalysis();

  // If the chat doesn't exist, redirect to a 404 page
  if (!initialData) {
    notFound();
  }

  return <ChatClient chatId={chatId} initialChat={initialData} analyses={analyses} />;
};

export default ChatPage;
