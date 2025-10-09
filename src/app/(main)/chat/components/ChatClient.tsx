'use client';

import React, { useState, useEffect, useRef } from 'react';
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

interface ChatClientProps {
  chatId: string;
  initialChat?: GetChatResponse | null;
  analyses?: Analysis[] | null;
  initialAnalysisId?: string;
}

const ThinkingMessage: React.FC = () => (
  <div className="flex items-start space-x-4 p-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <Bot className="h-5 w-5" />
    </div>
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
    </div>
  </div>
);

const ChatClient: React.FC<ChatClientProps> = ({ chatId: initialChatId, initialChat, analyses, initialAnalysisId }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [chatId, setChatId] = useState(initialChatId);

  // Data Fetching & Mutations
  const { data, isLoading, isError, error } = useChat(initialChatId !== 'new' ? initialChatId : undefined, {
    initialData: initialChat ?? undefined,
  });
  // Destructure the new streaming functions
  const { createChat, sendMessageStream, regenerateResponseStream, editMessageStream, ...mutations } = useChatActions(initialChatId !== 'new' ? initialChatId : undefined);

  // State
  const [input, setInput] = useState('');
  const [optimisticMessage, setOptimisticMessage] = useState<ChatMessageType | null>(null);
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
  const isResponding = createChat.isPending || !!streamingAiResponse;

  // Effects
  useEffect(() => {
    // When an existing chat is loaded, update the UI settings to match it.
    if (data?.chat) {
      setSettings({
        provider: data.chat.model.provider || 'openrouter',
        model: data.chat.model.model,
        temperature: data.chat.temperature || 0.7,
        top_k: data.chat.top_k || 40,
        analysisId: data.chat.analysisId,
      });
      setSystemPrompt(data.chat.systemPrompt || '');
    }
  }, [data?.chat]);

  useEffect(() => {
    // This effect runs when the chat data is loaded for an existing chat.
    if (data?.messages && data.messages.length === 1 && data.messages[0].sender === 'user' && !isResponding) {
      const firstUserMessage = data.messages[0];
      
      // Prepare a placeholder for the AI's streaming response
      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: initialChatId,
          sender: 'ai',
          content: '', // Start with empty content
          createdAt: new Date(),
          parentMessageId: firstUserMessage._id,
          branchIndex: 0,
          totalBranches: 1,
      };
      setStreamingAiResponse(tempAiMessage);

      // Call the streaming function
      sendMessageStream(
        { content: firstUserMessage.content, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
        (chunk) => {
          setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        }
      ).finally(() => {
        setStreamingAiResponse(null); // Clear on completion
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.messages, isResponding]); // Depends on messages loading

  useEffect(() => {
    // Clear optimistic messages once the real data arrives or streaming ends
    if (!isResponding) {
      setOptimisticUserMessage(null);
    }
  }, [data?.messages, isResponding]);

  useEffect(() => {
    // The createChat mutation hook handles the redirect. We just update the local chatId.
    // The optimistic message is cleared because the component state is reset on navigation.
    if (createChat.data?.chat._id) {
        setChatId(createChat.data.chat._id);
    }
  }, [createChat.data]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [data?.messages, streamingAiResponse, optimisticUserMessage]);

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

    if (initialChatId === 'new') {
        // 1. For a new chat, call the updated createChat mutation.
        // It redirects, and the new useEffect will handle the first message send.
        await createChat.mutateAsync({
            repository: 'your-github/repository-name', // TODO: This should be dynamic
            initialContent: content,
            systemPrompt: systemPrompt || undefined,
            analysisId: settings.analysisId,
            model: { primary: settings.model },
            temperature: settings.temperature,
            top_k: settings.top_k,
        });
    } else {
        // 2. For an existing chat, start the streaming flow.
        const tempUserMessage: ChatMessageType = {
            _id: `optimistic-${Date.now()}`,
            chatId: initialChatId,
            sender: 'user',
            content: content,
            createdAt: new Date(),
            parentMessageId: data?.messages[data.messages.length - 1]?._id ?? null,
            branchIndex: 0, totalBranches: 1,
        };
        const tempAiMessage: ChatMessageType = {
            _id: `streaming-${Date.now()}`,
            chatId: initialChatId,
            sender: 'ai',
            content: '',
            createdAt: new Date(),
            parentMessageId: tempUserMessage._id, // Optimistically parented
            branchIndex: 0, totalBranches: 1,
        };

        setOptimisticUserMessage(tempUserMessage);
        setStreamingAiResponse(tempAiMessage);

        await sendMessageStream(
          { content, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
          (chunk) => {
            setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
          }
        ).finally(() => {
          // The onFinish callback in useChatActions handles invalidation.
          // We just clear our local streaming state.
          setStreamingAiResponse(null);
        });
    }
  };

  const streamingActions: ChatStreamingActions = {
    handleStreamEdit: async (messageId: string, newContent: string) => {
      if (isResponding) return;

      // Start the AI response placeholder.
      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: initialChatId,
          sender: 'ai', content: '', createdAt: new Date(),
          parentMessageId: messageId, // This is an approximation for UI, backend handles branching.
          branchIndex: 0, totalBranches: 1,
      };
      setStreamingAiResponse(tempAiMessage);

      await editMessageStream(
        messageId,
        { newContent, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
        (chunk) => {
          setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        }
      ).finally(() => setStreamingAiResponse(null));
    },

    handleStreamRegenerate: async (parentMessageId: string) => {
      if (isResponding) return;

      const tempAiMessage: ChatMessageType = {
          _id: `streaming-${Date.now()}`,
          chatId: initialChatId,
          sender: 'ai', content: '', createdAt: new Date(),
          parentMessageId: parentMessageId,
          branchIndex: 0, totalBranches: 1,
      };
      setStreamingAiResponse(tempAiMessage);

      await regenerateResponseStream(
        { parentMessageId, systemPrompt: systemPrompt || undefined, temperature: settings.temperature, top_k: settings.top_k },
        (chunk) => {
          setStreamingAiResponse(prev => prev ? { ...prev, content: prev.content + chunk } : null);
        }
      ).finally(() => setStreamingAiResponse(null));
    },
  };

  const messages = data?.messages ?? [];
  const displayedMessages = [...messages];
  if (optimisticUserMessage && !messages.find(m => m._id === optimisticUserMessage._id)) {
      displayedMessages.push(optimisticUserMessage);
  }
  if (streamingAiResponse) {
      displayedMessages.push(streamingAiResponse);
  }

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
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
          <div className="w-full mx-auto max-w-4xl space-y-8">
          {displayedMessages.length === 0 ? (
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
                    chatId={initialChatId}
                    message={msg}
                    // Pass down the remaining non-streaming mutations
                    mutations={mutations}
                    // Pass down the new streaming handlers
                    streamingActions={streamingActions}
                    isStreaming={isResponding && !msg._id.startsWith('streaming-')}
                />
                ))}
                {isResponding && !streamingAiResponse && <ThinkingMessage />}
            </>
          )}
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
