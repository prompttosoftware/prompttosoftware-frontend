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

type ChatMutations = Omit<ReturnType<typeof useChatActions>, 'createChat' | 'editMessage' | 'sendMessageStream' | 'regenerateResponseStream' | 'editMessageStream'>;

export interface ChatStreamingActions {
  handleStreamEdit: (messageId: string, newContent: string) => void;
  handleStreamRegenerate: (parentMessageId: string) => void;
}

interface ChatMessageProps {
  chatId: string;
  message: MessageType;
  mutations: ChatMutations; // For delete, switchBranch, etc.
  streamingActions: ChatStreamingActions;
  isStreaming: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, mutations, streamingActions, isStreaming }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [copiedIcon, setCopiedIcon] = useState<{ standard: boolean; markdown: boolean }>({
    standard: false,
    markdown: false,
  });

  const isUser = message.sender === 'user';

  const handleCopy = (buttonKey: 'standard' | 'markdown') => {
    // Determine which content to copy based on the button
    const contentToCopy = buttonKey === 'standard' ? message.content : message.content; // assuming you'd modify this if you actually had a markdown string
    
    // For now, both copy the same content, but this separates the feedback
    navigator.clipboard.writeText(contentToCopy);

    // Set the corresponding copy state to true
    setCopiedIcon(prev => ({ ...prev, [buttonKey]: true }));

    // Revert the icon back to the original after a short delay (e.g., 1.5 seconds)
    setTimeout(() => {
      setCopiedIcon(prev => ({ ...prev, [buttonKey]: false }));
    }, 1500);
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() === message.content.trim() || editedContent.trim() === '') {
      setIsEditing(false);
      return;
    }
    // Call the new streaming function passed from the parent
    streamingActions.handleStreamEdit(message._id, editedContent);
    setIsEditing(false);
  };
  
  const handleRegenerate = () => {
    if (message.parentMessageId) {
      // Call the new streaming function passed from the parent
      streamingActions.handleStreamRegenerate(message.parentMessageId);
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
                <Button size="sm" onClick={handleSaveEdit} disabled={isStreaming}>
                  {isStreaming ? 'Working...' : 'Save & Submit'}
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
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(true)} disabled={isStreaming}>
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
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRegenerate} disabled={isStreaming}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Regenerate response</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Regenerate response</p></TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-7 w-7 transition-colors ${copiedIcon.standard ? 'text-green-500 animate-pulse' : ''}`} 
                  onClick={() => handleCopy('standard')}
                >
                  {copiedIcon.standard ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copiedIcon.standard ? <p>Copied!</p> : <p>Copy</p>}</TooltipContent>
            </Tooltip>
            
            {/* Copy as Markdown Button with Feedback */}
            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-7 w-7 transition-colors ${copiedIcon.markdown ? 'text-green-500 animate-pulse' : ''}`} 
                  onClick={() => handleCopy('markdown')}
                >
                  {copiedIcon.markdown ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                  <span className="sr-only">Copy as Markdown</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copiedIcon.markdown ? <p>Copied as Markdown!</p> : <p>Copy as Markdown</p>}</TooltipContent>
            </Tooltip> */}
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
