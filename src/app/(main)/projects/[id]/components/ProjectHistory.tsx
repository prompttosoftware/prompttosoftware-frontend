'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { HistoryItem as ProjectHistoryItem } from '@/types/project';

interface ProjectHistoryProps {
  history?: ProjectHistoryItem[];
}

const HistoryItem = ({ item }: { item: ProjectHistoryItem }) => {
    const isUser = item.sender === 'user';
    const isAgent = item.sender === 'agent';
    const isSystem = item.sender === 'system';

    let containerClasses = 'flex';
    let bubbleClasses = 'p-3 rounded-lg max-w-lg break-words text-sm'; // Increased max-width
    let timestampClasses = 'text-xs mt-1'; // Base timestamp class
    let senderName = '';

    switch (item.type) {
    case 'message':
        if (isUser) {
        containerClasses += ' justify-end';
        bubbleClasses += ' bg-blue-500 text-white';
        timestampClasses += ' text-right text-blue-200';
        senderName = 'You';
        } else { // Agent or default sender
        containerClasses += ' justify-start';
        bubbleClasses += ' bg-gray-200 text-gray-800';
        timestampClasses += ' text-left text-gray-500';
        senderName = isAgent ? 'Agent' : 'System'; // Fallback for agent messages from system or others
        }
        break;
    case 'status_update':
        containerClasses += ' justify-center';
        bubbleClasses += ' bg-indigo-100 text-indigo-800 text-center italic';
        timestampClasses += ' text-center text-indigo-600';
        senderName = 'System Update';
        break;
    case 'sensitive_request':
        containerClasses += ' justify-center';
        bubbleClasses += ' bg-red-100 text-red-800 text-center font-semibold';
        timestampClasses += ' text-center text-red-600';
        senderName = 'Sensitive Request';
        break;
    case 'system_event':
    default: // Default for any unknown or new types
        containerClasses += ' justify-center';
        bubbleClasses += ' bg-gray-100 text-gray-700 text-center italic';
        timestampClasses += ' text-center text-gray-500';
        senderName = 'System Event';
        break;
    }
    return (
        <div key={1} className={containerClasses}>
        <div className={bubbleClasses}>
            <p>{item.content}</p>
            <p className="text-xs mt-1">{format(new Date(item.timestamp), 'PPpp')}</p>
        </div>
        </div>
    );
};


const ProjectHistory = ({ history = [] }: ProjectHistoryProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history]);

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return (
    <div className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
            {sortedHistory.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                    No history yet. Start by sending a message.
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedHistory.map((item, index) => (
                        <HistoryItem key={index} item={item} />
                    ))}
                </div>
            )}
        </ScrollArea>
    </div>
  );
};

export default ProjectHistory;
