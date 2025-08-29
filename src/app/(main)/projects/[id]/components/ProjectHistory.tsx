'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { HistoryItem as ProjectHistoryItem } from '@/types/project';

interface ProjectHistoryProps {
  history?: ProjectHistoryItem[];
}

/**
 * Safely formats a timestamp string, returning a fallback if the date is invalid.
 * @param timestamp - The date string, number, or Date object to format.
 * @param formatString - The desired format string for date-fns.
 * @returns The formatted date string or a fallback string.
 */
const safeFormatDate = (timestamp: string | number | Date, formatString: string): string => {
  if (!timestamp) {
    return 'No timestamp provided';
  }
  
  try {
    const date = new Date(timestamp);
    // Check if the date is valid. isNaN(date) is a common way to check this.
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};


const HistoryItem = ({ item }: { item: ProjectHistoryItem }) => {
    const isUser = item.sender === 'user';
    const isAgent = item.sender === 'agent';
    const isSystem = item.sender === 'system';

    let containerClasses = 'flex';
    let bubbleClasses = 'p-3 rounded-lg max-w-lg break-words text-sm';
    let timestampClasses = 'text-xs mt-1';
    let senderName = '';

    switch (item.type) {
    case 'message':
        if (isUser) {
        containerClasses += ' justify-end';
        bubbleClasses += ' bg-blue-500 text-white';
        timestampClasses += ' text-right text-blue-200';
        senderName = 'You';
        } else {
        containerClasses += ' justify-start';
        bubbleClasses += ' bg-gray-200 text-gray-800';
        timestampClasses += ' text-left text-gray-500';
        senderName = isAgent ? 'Agent' : 'System';
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
    default:
        containerClasses += ' justify-center';
        bubbleClasses += ' bg-gray-100 text-gray-700 text-center italic';
        timestampClasses += ' text-center text-gray-500';
        senderName = 'System Event';
        break;
    }

    return (
        // The `key` prop should be on the component instance in the map, not here. Removed `key={1}`.
        <div className={containerClasses}>
            <div className={bubbleClasses}>
                <p>{item.content}</p>
                {/* Use the new safe formatting function */}
                <p className={timestampClasses}>{safeFormatDate(item.timestamp, 'PPpp')}</p>
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

  // Create a memoized or stable version of sorted history if performance is a concern
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);

    // Check for invalid dates
    const aIsInvalid = isNaN(dateA.getTime());
    const bIsInvalid = isNaN(dateB.getTime());

    // Logic to handle invalid dates during sorting
    if (aIsInvalid && bIsInvalid) return 0; // Keep original order if both are invalid
    if (aIsInvalid) return 1;  // Push invalid 'a' to the end of the list
    if (bIsInvalid) return -1; // Push invalid 'b' to the end of the list

    // If both dates are valid, sort them normally
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="flex-grow p-4 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full pr-4">
            {sortedHistory.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                    No history yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedHistory.map((item, index) => (
                        <HistoryItem key={index} item={item} /> // Use a stable ID if available, otherwise index
                    ))}
                </div>
            )}
        </ScrollArea>
    </div>
  );
};

export default ProjectHistory;
