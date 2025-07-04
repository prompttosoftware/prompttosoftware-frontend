import React from 'react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ApiKeyInputProps {
  hasApiKeyProvided: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  hasApiKeyProvided,
  value,
  onChange,
  placeholder,
  id,
  name,
  disabled,
}) => {
  return (
    <div className="relative">
      {hasApiKeyProvided ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 italic">Protected</span>
                {/* Add a visual indicator if desired, e.g., a lock icon */}
              </div>
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-content-wrapper" className="max-w-xs p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded shadow-sm">
              <p>Once entered, your API key will be masked and handled securely.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Input
                id={id}
                name={name}
                type="password"
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Enter your API Key"}
                className="pr-10" // Add padding for potential future icons inside input
                disabled={disabled}
              />
            </TooltipTrigger>
            <TooltipContent data-testid="tooltip-content-wrapper" className="max-w-xs p-2 text-sm text-gray-700 bg-white border border-gray-200 rounded shadow-sm">
              <p>Once entered, your API key will be masked and handled securely.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ApiKeyInput;
