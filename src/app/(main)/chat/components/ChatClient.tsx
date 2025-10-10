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
import { useRouter } from 'next/navigation';

interface ChatClientProps {
  chatId: string;
  initialChat?: GetChatResponse | null;
  analyses?: Analysis[] | null;
  initialAnalysisId?: string;
}

const ChatClient: React.FC<ChatClientProps> = ({ chatId: initialChatId, initialChat, analyses, initialAnalysisId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  
  const [chatId, setChatId] = useState(initialChatId);
  const hasTriggeredFirstResponse = useRef(false);

  // Data Fetching & Mutations
  const { data, isLoading, isError, error } = useChat(initialChatId !== 'new' ? chatId : undefined, {
    initialData: initialChat ?? undefined,
  });
  const { createChat, sendMessageStream, regenerateResponseStream, editMessageStream, ...mutations } = useChatActions();

  // State
  const [input, setInput] = useState('');
  const [settings, setSettings] = useState<ChatSettings>({
    provider: 'openrouter',
    model: 'qwen/qwen-turbo',
    temperature: 0.7,
    top_k: 40,
    analysisId: initialAnalysisId,
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
      });
      setSystemPrompt(data.chat.systemPrompt || '');
      setChatId(data.chat._id); // Ensure local chatId is synced
    }
  }, [data?.chat]);

  useEffect(() => {
    if (!isResponding) {
      setOptimisticUserMessage(null);
    }
  }, [data?.messages, isResponding]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Failed to load chat. Please try again.');
    }
  }, [isError, error]);

  // Handlers
  const handleSend = async () => {
    const content = input.trim();
    if (!content || isResponding) return;
    setInput('');

    if (chatId === 'new') {
        // Optimistically show the user's message immediately
        const tempUserMessage: ChatMessageType = {
            _id: `optimistic-${Date.now()}`,
            chatId: 'new', sender: 'user', content, createdAt: new Date(),
            parentMessageId: null, branchIndex: 0, totalBranches: 1,
        };
        setOptimisticUserMessage(tempUserMessage);
        
        // Show a loading/streaming placeholder for the AI response
        const tempAiMessage: ChatMessageType = {
            _id: `streaming-${Date.now()}`,
            chatId: 'new', sender: 'ai', content: '', createdAt: new Date(),
            parentMessageId: tempUserMessage._id, branchIndex: 0, totalBranches: 1,
        };
        setStreamingAiResponse(tempAiMessage);

        try {
            // Step 1: Create the chat and get the new ID
            const newChatData = await createChat.mutateAsync({
                repository: 'your-github/repository-name', // TODO: Dynamic
                initialContent: content,
                systemPrompt: systemPrompt || undefined,
                analysisId: settings.analysisId,
                model: { primary: settings.model },
                temperature: settings.temperature,
                top_k: settings.top_k,
            });
            const newChatId = newChatData.chat._id;

            // Step 2: Navigate to the new URL
            router.push(`/chat/${newChatId}`);
            
            // Step 3: Start the stream using the new ID
            await sendMessageStream(
              newChatId,
              { content, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
              (chunk) => {
                setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
              }
            );

        } catch (e: any) {
            toast.error(`Error creating chat: ${e.message}`);
            // Clear optimistic state on failure
            setOptimisticUserMessage(null);
        } finally {
            setStreamingAiResponse(null);
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

        await sendMessageStream(
          chatId, // Pass the current chatId
          { content, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
          (chunk) => {
            setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
          }
        ).finally(() => {
          setStreamingAiResponse(null);
        });
    }
  };

  const streamingActions: ChatStreamingActions = {
    handleStreamEdit: async (messageId: string, newContent: string) => {
      if (isResponding) return;

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

      await editMessageStream(chatId,
        messageId,
        { newContent, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
        (chunk) => {
          setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        }
      ).finally(() => {
        setStreamingAiResponse(null);
        setRegeneratingParentId(null);
      });
    },

    handleStreamRegenerate: async (parentMessageId: string) => {
      if (isResponding) return;

      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: chatId,
          sender: 'ai', content: '', createdAt: new Date(),
          parentMessageId: parentMessageId,
          branchIndex: 0, totalBranches: 1,
      };
      setStreamingAiResponse(tempAiMessage);
      setRegeneratingParentId(parentMessageId); // Mark the parent of the message being replaced

      await regenerateResponseStream(chatId,
        { parentMessageId, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
        (chunk) => {
          setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        }
      ).finally(() => {
        setStreamingAiResponse(null);
        setRegeneratingParentId(null);
      });
    },
  };

  // --- Start of Logic for Displaying Messages ---
  const baseMessages = data?.messages ?? [];
  let displayedMessages = [...baseMessages];

  // If regenerating, replace the old AI message with the new streaming one
  if (regeneratingParentId && streamingAiResponse) {
    const oldAiMessageIndex = displayedMessages.findIndex(
      (m) => m.parentMessageId === regeneratingParentId && m.sender === 'ai'
    );
    if (oldAiMessageIndex !== -1) {
      displayedMessages[oldAiMessageIndex] = streamingAiResponse;
    } else {
      // Fallback: if somehow the old message isn't there, find the parent and insert after it
      const parentIndex = displayedMessages.findIndex((m) => m._id === regeneratingParentId);
      if (parentIndex !== -1) {
          displayedMessages.splice(parentIndex + 1, 0, streamingAiResponse);
      } else {
          displayedMessages.push(streamingAiResponse); // Last resort
      }
    }
  }

  // Add the optimistic user message if it exists
  if (optimisticUserMessage) {
    displayedMessages.push(optimisticUserMessage);
  }

  // Add the new streaming AI response (but not if it's already handling a regeneration)
  if (streamingAiResponse && !regeneratingParentId) {
    displayedMessages.push(streamingAiResponse);
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
