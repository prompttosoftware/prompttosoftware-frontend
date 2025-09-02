import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext, Controller, FieldArrayWithId } from 'react-hook-form';
import { ProjectFormData } from '@/types/project';
import { AddApiKeyButton } from '../../app/(main)/components/ApiKeyManager';
import { useAuth } from '@/hooks/useAuth';

interface SingleModelInputProps {
  index: number;
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  field: FieldArrayWithId<ProjectFormData, `advancedOptions.aiModels.${SingleModelInputProps['level']}`, "id">;
}

const AI_PROVIDERS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Google', value: 'google' },
  { label: 'Groq', value: 'groq' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenRouter', value: 'openrouter' },
];

export const SingleModelInput: React.FC<SingleModelInputProps> = ({
  index,
  level,
}) => {
  const { control, watch, register } = useFormContext<ProjectFormData>();
  const { user, isLoading: authLoading, refreshUser } = useAuth();

  const apiKeys = user?.apiKeys || [];
  const availableProviders = apiKeys.map(key => key.provider.toLowerCase());

  const basePath = `advancedOptions.aiModels.${level}.${index}`;
  const providerFieldName = `${basePath}.provider`;
  const modelNameFieldName = `${basePath}.model`;
  
  const selectedProvider = watch(providerFieldName as any);

  const hasApiKey = (providerValue: string): boolean => {
    return availableProviders.includes(providerValue.toLowerCase());
  };

  const handleApiKeyAdded = async () => {
    await refreshUser();
  };

  return (
    // Use a responsive grid for a more compact layout on larger screens
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 items-start">
      {/* Provider Column */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <Label htmlFor={providerFieldName} className="text-sm font-medium text-card-foreground">
            Provider
          </Label>
          {/* Show Add API Key button inline with the label if needed */}
          {selectedProvider && !hasApiKey(selectedProvider) && (
            <AddApiKeyButton
              onApiKeyAdded={handleApiKeyAdded}
              excludeProviders={availableProviders}
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs" // More subtle styling for inline use
            />
          )}
        </div>
        <Controller
          control={control}
          name={providerFieldName as `advancedOptions.aiModels.${SingleModelInputProps['level']}.${number}.provider`}
          render={({ field: controllerField }) => (
            <Select onValueChange={controllerField.onChange} value={controllerField.value || ''}>
              <SelectTrigger id={providerFieldName} className="w-full">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((provider) => {
                  const isAvailable = hasApiKey(provider.value);
                  return (
                    <SelectItem
                      key={provider.value}
                      value={provider.value}
                      disabled={!isAvailable}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{provider.label}</span>
                        {!isAvailable && (
                          <span className="text-xs text-muted-foreground ml-2">(Add API key)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Model Name Column */}
      <div className="flex flex-col">
        <Label htmlFor={modelNameFieldName} className="text-sm font-medium text-card-foreground">
          Model Name
        </Label>
        <Input
          id={modelNameFieldName}
          type="text"
          placeholder="e.g., gpt-4, claude-3-opus"
          {...register(modelNameFieldName as `advancedOptions.aiModels.${SingleModelInputProps['level']}.${number}.model`)}
          className="w-full"
          maxLength={400}
        />
      </div>

      {authLoading && (
        <div className="col-span-1 md:col-span-2 text-sm text-muted-foreground">
          Loading available providers...
        </div>
      )}
    </div>
  );
};
