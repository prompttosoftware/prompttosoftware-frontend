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
  Copy, ClipboardCopy, Pencil, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, User, Bot,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Reasoning from './Reasoning';
import { useChatActions } from '@/hooks/useChatActions';

type ChatMutations = Omit<ReturnType<typeof useChatActions>, 'createChat' | 'sendMessage' | 'deleteChat'>;

interface ChatMessageProps {
  chatId: string;
  message: MessageType;
  mutations: ChatMutations;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ chatId, message, mutations }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const isUser = message.sender === 'user';

  const handleCopy = (markdown: boolean) => {
    navigator.clipboard.writeText(message.content);
  };

  const handleSaveEdit = () => {
    // Check if content has actually changed to prevent unnecessary API calls
    if (editedContent.trim() === message.content.trim() || editedContent.trim() === '') {
        setIsEditing(false);
        return;
    }

    mutations.editMessage.mutate({
        messageId: message._id,
        payload: { newContent: editedContent },
    });
    
    setIsEditing(false); // Immediately close the editor for a better UX
  };
  
  const handleRegenerate = () => {
    if (message.parentMessageId) {
        mutations.regenerateResponse.mutate({ parentMessageId: message.parentMessageId });
    } else {
        console.error("Cannot regenerate a message without a parent.");
    }
  };

  const handleDelete = () => {
    mutations.deleteMessage.mutate(message._id);
  };
  
  const handleSwitchBranch = (direction: 'next' | 'prev') => {
    if (!message.parentMessageId) return;
    const newIndex = direction === 'next' ? message.branchIndex + 1 : message.branchIndex - 1;
    mutations.switchBranch.mutate({ parentMessageId: message.parentMessageId, branchIndex: newIndex });
  };

  const Icon = isUser ? User : Bot;

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`group flex items-start space-x-4 p-4 rounded-lg ${isUser ? '' : 'bg-muted/30'}`}>
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
                <Button size="sm" onClick={handleSaveEdit} disabled={mutations.editMessage?.isPending}>
                  {mutations.editMessage.isPending ? 'Saving...' : 'Save & Submit'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <article className="prose prose-sm max-w-none dark:prose-invert">
                 <ReactMarkdown>{message.content}</ReactMarkdown>
            </article>
          )}

          {message.reasoning && <Reasoning reasoning={message.reasoning} />}

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {message.totalBranches > 1 && (
              <div className="flex items-center rounded-md border text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => handleSwitchBranch('prev')} variant="ghost" size="icon" className="h-7 w-7" disabled={message.branchIndex === 0}>
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous response</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Previous response</p></TooltipContent>
                </Tooltip>
                <span className="px-2">{message.branchIndex + 1} / {message.totalBranches}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => handleSwitchBranch('next')} variant="ghost" size="icon" className="h-7 w-7" disabled={message.branchIndex === message.totalBranches - 1}>
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
                  {/* Disable edit button while another mutation is running */}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)} disabled={mutations.editMessage?.isPending || mutations.regenerateResponse?.isPending}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit message</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit message</p></TooltipContent>
              </Tooltip>
            )}

            {!isUser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Disable regenerate button while a mutation is running */}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRegenerate} disabled={mutations.regenerateResponse?.isPending || mutations.editMessage?.isPending}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Regenerate response</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Regenerate response</p></TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(false)}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Copy</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(true)}>
                  <ClipboardCopy className="h-4 w-4" />
                  <span className="sr-only">Copy as Markdown</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Copy as Markdown</p></TooltipContent>
            </Tooltip>
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
