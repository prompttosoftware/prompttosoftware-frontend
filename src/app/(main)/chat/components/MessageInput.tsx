'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSend, disabled }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if (e.key === 'Enter' && !e.shiftKey) {
    //   e.preventDefault();
    //   onSend();
    // }
  };

  return (
    <div className="flex items-end space-x-2">
      <Textarea
        placeholder="Type your message here..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="flex-1 min-h-[50px] resize-none"
        rows={1}
      />
      <Button
        type="submit"
        size="icon"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="h-[44px] w-[44px] p-2"
        aria-label="Send message"
      >
        <SendHorizonal className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageInput;
