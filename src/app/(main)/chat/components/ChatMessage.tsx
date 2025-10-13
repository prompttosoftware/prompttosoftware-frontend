'use client';

import React, { useState } from 'react';
import { ChatMessage as MessageType } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Copy, Pencil, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, User, Bot,
  Check,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Reasoning from './Reasoning';
import { useChatActions } from '@/hooks/useChatActions';
import MarkdownRenderer from './MarkdownRenderer';

type ChatMutations = Omit<ReturnType<typeof useChatActions>, 'createChat' | 'editMessage' | 'sendMessageStream' | 'regenerateResponseStream' | 'editMessageStream'>;

export interface ChatStreamingActions {
  handleStreamEdit: (messageId: string, newContent: string) => void;
  handleStreamRegenerate: (parentMessageId: string) => void;
}

interface ChatMessageProps {
  chatId: string;
  message: MessageType;
  mutations: ChatMutations;
  streamingActions: ChatStreamingActions;
  isAnyMessageResponding: boolean; // Is any message in the chat being generated?
  isResponding?: boolean; // Is THIS specific message being generated?
}

const ThinkingAnimation: React.FC = () => (
  <div className="space-y-2 pt-1">
    <div className="h-4 w-12 animate-pulse rounded-md bg-muted" />
    <div className="h-4 w-4/5 animate-pulse rounded-md bg-muted" />
    <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
  </div>
);


const ChatMessage: React.FC<ChatMessageProps> = ({ message, mutations, streamingActions, isAnyMessageResponding, isResponding = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [copiedIcon, setCopiedIcon] = useState<{ standard: boolean }>({ standard: false });

  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedIcon({ standard: true });
    setTimeout(() => {
      setCopiedIcon({ standard: false });
    }, 1500);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() === message.content.trim() || editedContent.trim() === '') {
      setIsEditing(false);
      return;
    }
    streamingActions.handleStreamEdit(message._id, editedContent);
    setIsEditing(false);
  };
  
  const handleRegenerate = () => {
    if (message.parentMessageId) {
      streamingActions.handleStreamRegenerate(message.parentMessageId);
    } else {
      console.error("Cannot regenerate a message without a parent.");
    }
  };

  const handleDelete = () => {
    mutations.deleteMessage.mutate({ chatId: message.chatId, messageId: message._id });
  };
  
  const handleSwitchBranch = (direction: 'next' | 'prev') => {
    if (message.parentMessageId === undefined) return;
    const newIndex = direction === 'next' ? message.branchIndex + 1 : message.branchIndex - 1;
    mutations.switchBranch.mutate({ chatId: message.chatId, payload: { parentMessageId: message.parentMessageId, branchIndex: newIndex }});
  };

  const Icon = isUser ? User : Bot;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`group flex border items-start space-x-4 p-4 rounded-lg ${isUser ? '' : 'bg-muted/30'}`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isUser ? 'bg-secondary' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="font-semibold">{isUser ? 'You' : 'Assistant'}</div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[120px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={isAnyMessageResponding}>
                  {isAnyMessageResponding ? 'Working...' : 'Save & Submit'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : isResponding ? (
            <ThinkingAnimation />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}

          {message.reasoning && <Reasoning reasoning={message.reasoning} />}

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.totalBranches > 1 && (
              <div className="flex items-center rounded-md border text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => handleSwitchBranch('prev')} variant="ghost" size="icon" className="h-7 w-7" disabled={message.branchIndex === 0 || isAnyMessageResponding}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous response</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Previous response</p></TooltipContent>
                </Tooltip>
                <span className="px-2">{message.branchIndex + 1} / {message.totalBranches}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => handleSwitchBranch('next')} variant="ghost" size="icon" className="h-7 w-7" disabled={message.branchIndex === message.totalBranches - 1 || isAnyMessageResponding}>
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next response</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Next response</p></TooltipContent>
                </Tooltip>
              </div>
            )}
            
            {isUser && !isEditing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)} disabled={isAnyMessageResponding}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit message</p></TooltipContent>
              </Tooltip>
            )}

            {!isUser && !isResponding && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRegenerate} disabled={isAnyMessageResponding}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Regenerate response</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Regenerate response</p></TooltipContent>
              </Tooltip>
            )}

            {!isResponding && message.content && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-7 w-7 transition-colors ${copiedIcon.standard ? 'text-green-500 animate-pulse' : ''}`} 
                    onClick={handleCopy}
                  >
                    {copiedIcon.standard ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copiedIcon.standard ? <p>Copied!</p> : <p>Copy</p>}</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Delete message</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChatMessage;
