'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useChat } from '@/hooks/useChat';
import { useChatActions } from '@/hooks/useChatActions';
import { GetChatResponse, ChatSettings, ChatMessage as ChatMessageType } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import ChatSidebar from './ChatSidebar';
import ChatMessage from './ChatMessage';
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
  const { data, isLoading, isError, error } = useChat(chatId !== 'new' ? chatId : undefined, {
    initialData: initialChat ?? undefined,
  });
  // Use the real hook, passing the current chatId
  const { createChat, sendMessage, ...mutations } = useChatActions(chatId !== 'new' ? chatId : undefined);

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
  }, [data]);

  useEffect(() => {
    // The createChat mutation hook handles the redirect, so we just need to update the chatId state
    if (createChat.data?.chat._id) {
        setChatId(createChat.data.chat._id);
        setOptimisticMessage(null);
    }
  }, [createChat.data]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [data?.messages, createChat.isPending, sendMessage.isPending, mutations.regenerateResponse.isPending]);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message || 'Failed to load chat. Please try again.');
    }
  }, [isError, error]);

  // Handlers
  const handleSend = async () => {
    const content = input.trim();
    if (!content || isResponding) return;

    if (chatId === 'new') {
        const tempUserMessage: ChatMessageType = {
            _id: `optimistic-${Date.now()}`, // Temporary unique ID
            chatId: 'new',
            sender: 'user',
            content: content,
            createdAt: new Date(),
            parentMessageId: null,
            branchIndex: 0,
            totalBranches: 0
        };
        
        // 1. Update UI immediately
        setOptimisticMessage(tempUserMessage);
        setInput('');

        try {
            // 2. Call the mutation in the background
            await createChat.mutateAsync({
                repository: 'your-github/repository-name',
                initialContent: content,
                systemPrompt: systemPrompt || undefined,
                analysisId: settings.analysisId,
                model: { primary: settings.model },
                temperature: settings.temperature,
                top_k: settings.top_k,
            });
            // On success, the useEffect for createChat.data will handle the redirect
            // and the component state will reset, clearing the optimistic message.

        } catch (error) {
            // 3. Rollback on failure
            console.error("Create chat mutation failed:", error);
            toast.error("Failed to send message. Please try again.");
            setOptimisticMessage(null); // Remove the failed message from UI
            setInput(content); // Optional: Repopulate the input so user doesn't lose their text
        }
    } else {
        try {
        await sendMessage.mutateAsync({
            content: content,
            systemPrompt: systemPrompt || undefined,
            temperature: settings.temperature,
            top_k: settings.top_k,
        });
        setInput('');
        } catch (error) {
        console.error("Send message failed in component:", error);
        }
    }
    };

  const messages = data?.messages ?? [];
  const isResponding = createChat.isPending || sendMessage.isPending || mutations.regenerateResponse.isPending;

  const displayedMessages = [...messages];
  if (optimisticMessage) {
      displayedMessages.push(optimisticMessage);
  }

  if (isLoading && chatId !== 'new') {
    return <div className="p-8"><SkeletonLoader className="h-[80vh] w-full" /></div>;
  }
  
  return (
    <div className="flex h-full overflow-hidden">
      <ChatSidebar
        settings={settings}
        onSettingsChange={setSettings}
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        analyses={analyses}
      />
      <main className="flex flex-1 flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-8">
          {messages.length === 0 ? (
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
                  // Disable actions for the optimistic message
                  mutations={msg._id.startsWith('optimistic-') ? {} as any : mutations}
                />
              ))}
              {isResponding && <ThinkingMessage />}
            </>
          )}
        </div>
        </ScrollArea>
        <div className="border-t bg-background p-4 md:p-6">
          <div className="mx-auto max-w-4xl">
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
