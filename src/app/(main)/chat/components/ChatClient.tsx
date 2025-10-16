'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useChat } from '@/hooks/useChat';
import { useChatActions } from '@/hooks/useChatActions';
import { GetChatResponse, ChatSettings, ChatMessage as ChatMessageType } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import ChatSidebar from './ChatSidebar';
import ChatMessage, { ChatStreamingActions } from './ChatMessage';
import MessageInput from './MessageInput';
import { Analysis } from '@/types/analysis';
import { Bot } from 'lucide-react';
import { Provider } from '@/types/project';

interface ChatClientProps {
  chatId: string;
  initialChat?: GetChatResponse | null;
  analyses?: Analysis[] | null;
  initialAnalysisId?: string;
}

const ChatClient: React.FC<ChatClientProps> = ({ chatId: initialChatId, initialChat, analyses, initialAnalysisId }) => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [chatId, setChatId] = useState(initialChatId);

  // Data Fetching & Mutations
  const { data, isLoading, isError, error } = useChat(chatId !== 'new' ? chatId : undefined, {
    initialData: initialChat ?? undefined,
  });
  const { createChat, sendMessageStream, regenerateResponseStream, editMessageStream, ...mutations } = useChatActions();

  // State
  const [input, setInput] = useState('');
  const [settings, setSettings] = useState<ChatSettings>({
    provider: 'openrouter',
    model: 'openai/gpt-5-nano',
    temperature: 0.7,
    top_k: 40,
    analysisId: initialAnalysisId,
    search: true
  });
  const [systemPrompt, setSystemPrompt] = useState('');

  const [optimisticUserMessage, setOptimisticUserMessage] = useState<ChatMessageType | null>(null);
  const [streamingAiResponse, setStreamingAiResponse] = useState<ChatMessageType | null>(null);
  const [regeneratingParentId, setRegeneratingParentId] = useState<string | null>(null); // Tracks which message is being regenerated
  
  const isResponding = createChat.isPending || !!streamingAiResponse;

  // Effects
  useEffect(() => {
    if (data?.chat) {
      setSettings({
        provider: data.chat.model.provider || 'openrouter',
        model: data.chat.model.model,
        temperature: data.chat.temperature || 0.7,
        top_k: data.chat.top_k || 40,
        analysisId: data.chat.analysisId,
        search: data.chat.search || true,
      });
      setSystemPrompt(data.chat.systemPrompt || '');
      setChatId(data.chat._id); // Ensure local chatId is synced
    }
  }, [data?.chat]);

  useEffect(() => {
    if (!isResponding) {
      setOptimisticUserMessage(null);
    }
  }, [isResponding]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Failed to load chat. Please try again.');
    }
  }, [isError, error]);

  // This ensures that if the user navigates away while a stream is in progress,
  // the fetch request is cancelled.
  useEffect(() => {
    // The function returned from useEffect is the cleanup function
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  // Handlers
  const handleSend = async () => {
    const content = input.trim();
    if (!content || isResponding) return;
    setInput('');

    // Create a new controller for this specific request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (chatId === 'new') {
      // Optimistically create the user's message
      const tempUserMessage: ChatMessageType = {
          _id: `optimistic-${Date.now()}`,
          chatId: 'new', // It's still 'new' at this point
          sender: 'user',
          content,
          createdAt: new Date(),
          parentMessageId: null,
          branchIndex: 0,
          totalBranches: 1,
      };
      
      // Set the streaming AI response placeholder (this can remain in local state)
      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: 'new',
          sender: 'ai',
          content: '',
          createdAt: new Date(),
          parentMessageId: tempUserMessage._id,
          branchIndex: 0,
          totalBranches: 1,
      };
      
      setStreamingAiResponse(tempAiMessage);

      try {
          // Step 1: Create the chat
          const response = await createChat.mutateAsync({
              repository: 'your-github/repository-name', // TODO: Dynamic
              systemPrompt: systemPrompt || undefined,
              analysisId: settings.analysisId,
              model: { model: settings.model, provider: settings.provider as Provider | undefined },
              temperature: settings.temperature,
              top_k: settings.top_k,
          });
          const newChatId = response.chat._id;

          queryClient.setQueryData<GetChatResponse>(['chat', newChatId], {
              chat: response.chat,
              messages: [
                  { ...tempUserMessage, chatId: newChatId } // Update chatId in the optimistic message
              ],
          });

          // Update URL and local state to trigger the useQuery hook for the new ID
          window.history.replaceState(null, '', `/chat/${newChatId}`);
          setChatId(newChatId);

          // Step 2: Start the stream using the new ID
          sendMessageStream(
              newChatId,
              { 
                content, 
                systemPrompt: systemPrompt || undefined, 
                model: { model: settings.model, provider: settings.provider as Provider | undefined },
                temperature: settings.temperature, 
                top_k: settings.top_k 
              },
              (chunk) => {
                  setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
              },
              () => {
                  setStreamingAiResponse(null);
              },
              controller.signal
          );

          // Invalidation will fetch the final state and seamlessly replace our optimistic one
          queryClient.invalidateQueries({ queryKey: ['chat', newChatId] });

      } catch (e: any) {
          toast.error(`Error creating chat: ${e.message}`);
          // On error, we might need to remove the optimistic data
          queryClient.removeQueries({ queryKey: ['chat', chatId] });
      } finally {
          // Clear the transient streaming state
          setStreamingAiResponse(null);
          // We no longer need to clear optimisticUserMessage as it's not in state
      }

  } else {
        // This logic for existing chats was already good
        const tempUserMessage: ChatMessageType = {
            _id: `optimistic-${Date.now()}`,
            chatId: chatId, sender: 'user', content, createdAt: new Date(),
            parentMessageId: data?.messages[data.messages.length - 1]?._id ?? null,
            branchIndex: 0, totalBranches: 1,
        };
        const tempAiMessage: ChatMessageType = {
            _id: `streaming-${Date.now()}`,
            chatId: chatId, sender: 'ai', content: '', createdAt: new Date(),
            parentMessageId: tempUserMessage._id, branchIndex: 0, totalBranches: 1,
        };

        setOptimisticUserMessage(tempUserMessage);
        setStreamingAiResponse(tempAiMessage);

        sendMessageStream(
          chatId, // Pass the current chatId
          { content, 
            systemPrompt: systemPrompt || undefined, 
            model: { model: settings.model, provider: settings.provider as Provider | undefined },
            temperature: settings.temperature, 
            top_k: settings.top_k 
          },
          (chunk) => {
            console.log(`Check recieved in chat client: ${chunk}`);
            setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
          },
          () => {
            console.log(`Chat client finished stream recieved.`);
            setStreamingAiResponse(null);
        },
          controller.signal
        );
    }
  };

  const streamingActions: ChatStreamingActions = {
    handleStreamEdit: async (messageId: string, newContent: string) => {
      if (isResponding) return;

      const controller = new AbortController();

      const queryKey = ['chat', chatId];
      queryClient.setQueryData<GetChatResponse>(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: oldData.messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, content: newContent }
              : msg
          ),
        };
      });

      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: chatId,
          sender: 'ai', content: '', createdAt: new Date(),
          parentMessageId: messageId,
          branchIndex: 0, totalBranches: 1,
      };
      setStreamingAiResponse(tempAiMessage);
      setRegeneratingParentId(messageId); // Treat edit as a form of regeneration for UI purposes

      editMessageStream(chatId,
        messageId,
        { 
          newContent, 
          systemPrompt: systemPrompt || undefined, 
          model: { model: settings.model, provider: settings.provider as Provider | undefined },
          temperature: settings.temperature, 
          top_k: settings.top_k 
        },
        (chunk) => {
            setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        },
        () => {
            setStreamingAiResponse(null);
            setRegeneratingParentId(null);
        },
        controller.signal
      );
    },

    handleStreamRegenerate: async (parentMessageId: string) => {
      if (isResponding) return;

      const controller = new AbortController();

      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: chatId,
          sender: 'ai', content: '', createdAt: new Date(),
          parentMessageId: parentMessageId,
          branchIndex: 0, totalBranches: 1,
      };
      setStreamingAiResponse(tempAiMessage);
      setRegeneratingParentId(parentMessageId); // Mark the parent of the message being replaced

      regenerateResponseStream(chatId,
        { 
          parentMessageId, 
          systemPrompt: systemPrompt || undefined, 
          model: { model: settings.model, provider: settings.provider as Provider | undefined },
          temperature: settings.temperature, 
          top_k: settings.top_k },
        (chunk) => {
          setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        },
        () => {
            setStreamingAiResponse(null);
            setRegeneratingParentId(null);
        },
        controller.signal
      );
    },
  };

  // --- Start of Logic for Displaying Messages ---
  const baseMessages = data?.messages ?? [];
  let displayedMessages;

  // If we are editing or regenerating, we create a new branch.
  // We should only show messages up to the point of the branch.
  if (regeneratingParentId) {
    const parentIndex = baseMessages.findIndex(msg => msg._id === regeneratingParentId);
    
    if (parentIndex !== -1) {
      // Take all messages up to and including the parent that is being branched from.
      displayedMessages = baseMessages.slice(0, parentIndex + 1);
      // Add the new streaming response that forms the new branch.
      if (streamingAiResponse) {
        displayedMessages.push(streamingAiResponse);
      }
    } else {
      // Fallback if parent isn't found (shouldn't happen but good for safety)
      displayedMessages = [...baseMessages];
      if (streamingAiResponse) {
        displayedMessages.push(streamingAiResponse);
      }
    }
  } else {
    // Default behavior: append new optimistic messages to the full list.
    displayedMessages = [...baseMessages];
    if (optimisticUserMessage) {
      displayedMessages.push(optimisticUserMessage);
    }
    if (streamingAiResponse) {
      displayedMessages.push(streamingAiResponse);
    }
  }
  // --- End of Logic for Displaying Messages ---

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages.length, streamingAiResponse?.content.length]); // Also trigger on content change for smooth typing scroll


  if (isLoading && initialChatId !== 'new') {
    return <div className="p-8"><SkeletonLoader className="h-[80vh] w-full" /></div>;
  }
  
  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden">
      <ChatSidebar
        settings={settings}
        onSettingsChange={setSettings}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        analyses={analyses}
      />
      <main className="flex flex-1 flex-col w-full min-w-0">
        <ScrollArea className="flex-1 p-4 md:p-6">
          <div className="w-full mx-auto max-w-4xl space-y-8">
            {displayedMessages.length === 0 && !isResponding ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground py-20">
                <Bot className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start the conversation by sending a message below.</p>
              </div>
            ) : (
              <>
                {displayedMessages.map((msg) => (
                  <ChatMessage
                      key={msg._id}
                      chatId={chatId}
                      message={msg}
                      mutations={mutations}
                      streamingActions={streamingActions}
                      isAnyMessageResponding={isResponding}
                      isResponding={msg.sender === 'ai' && msg._id.startsWith('streaming-') && msg.content === ''}
                  />
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t bg-background p-4 md:p-6">
          <div className="w-full mx-auto max-w-4xl">
            <MessageInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSend={handleSend}
              disabled={isResponding}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatClient;
