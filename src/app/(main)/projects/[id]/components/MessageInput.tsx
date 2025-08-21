'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MessageInputProps {
  sendMessage: UseMutationResult<any, Error, { message: string }, unknown>;
}

const MessageInput = ({ sendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage.mutate(
      { message },
      {
        onSuccess: () => {
          setMessage('');
          toast.success('Message sent!');
        },
        onError: (err) => {
          toast.error(`Failed to send message: ${err.message}`);
        },
      }
    );
  };
  
  return (
    <div className="flex items-center space-x-2 p-4 border-t ">
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
        disabled={sendMessage.isPending}
        className="flex-grow bg-input text-card-foreground placeholder:text-muted-foreground"
      />
      <Button onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}>
        {sendMessage.isPending ? 'Sending...' : 'Send'}
      </Button>
    </div>
  );
};

export default MessageInput;
