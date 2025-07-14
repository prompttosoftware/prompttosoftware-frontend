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
import { useFormContext, UseFormRegister, Controller, FieldArrayWithId } from 'react-hook-form';
import { ProjectFormData } from '@/types/project';
import { AddApiKeyButton } from '../../app/(main)/components/ApiKeyManager';
import { useAuth } from '@/hooks/useAuth';

interface SingleModelInputProps {
  register: UseFormRegister<ProjectFormData>;
  index: number;
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  field: FieldArrayWithId<ProjectFormData, `advancedOptions.aiModels.${SingleModelInputProps['level']}`, "id">;
}

const AI_PROVIDERS = [
  { label: 'OpenAI', value: 'OPENAI' },
  { label: 'Anthropic', value: 'ANTHROPIC' },
  { label: 'Google', value: 'GOOGLE' },
  { label: 'Groq', value: 'GROQ' },
  { label: 'DeepSeek', value: 'DEEPSEEK' },
  { label: 'OpenRouter', value: 'OPENROUTER' },
];

export const SingleModelInput: React.FC<SingleModelInputProps> = ({
  register,
  index,
  level,
  field,
}) => {
  const { control, watch } = useFormContext<ProjectFormData>();
  // Use the auth hook to get user data, loading state, and refresh function
  const { user, isLoading: authLoading, refreshUser } = useAuth();

  // Derive available providers directly from the user object from useAuth
  const apiKeys = user?.apiKeys || [];
  const availableProviders = apiKeys.map(key => key.provider.toLowerCase());

  const basePath = `advancedOptions.aiModels.${level}.${index}`;
  const providerFieldName = `${basePath}.provider`;
  const modelNameFieldName = `${basePath}.modelName`;
  const apiKeyFieldName = `${basePath}.apiKey`;

  // Watch the selected provider to show/hide API key button
  const selectedProvider = watch(providerFieldName as any);

  // Check if the selected provider has an API key
  const hasApiKey = (providerValue: string): boolean => {
    return availableProviders.includes(providerValue.toLowerCase());
  };

  // Handle API key added by calling the refreshUser function from the hook
  const handleApiKeyAdded = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing user data after API key addition:', error);
    }
  };

  // Determine which providers should be excluded from the "Add API Key" button
  const excludeProviders = availableProviders;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-md border">
      {/* Provider Dropdown */}
      <div>
        <Label htmlFor={`${providerFieldName}`} className="mb-2 block text-sm font-medium text-gray-700">
          Provider
        </Label>
        <Controller
          control={control}
          name={providerFieldName as `advancedOptions.aiModels.${SingleModelInputProps['level']}.${number}.provider`}
          render={({ field: controllerField }) => (
            <Select onValueChange={controllerField.onChange} value={controllerField.value || ''}>
              <SelectTrigger id={`${providerFieldName}`} className="w-full">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent className="relative z-[60] max-h-96 min-w-[8rem] rounded-md border bg-white text-gray-900 shadow-md">
                {AI_PROVIDERS.map((provider) => {
                  const isAvailable = hasApiKey(provider.value);
                  return (
                    <SelectItem
                      key={provider.value}
                      value={provider.value}
                      disabled={!isAvailable}
                      className={!isAvailable ? 'opacity-50' : ''}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{provider.label}</span>
                        {!isAvailable && (
                          <span className="text-xs text-gray-500 ml-2">(No API key)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        />

        {/* Show Add API Key button if provider is selected but doesn't have a key */}
        {selectedProvider && !hasApiKey(selectedProvider) && (
          <div className="mt-2">
            <AddApiKeyButton
              onApiKeyAdded={handleApiKeyAdded}
              excludeProviders={excludeProviders}
              variant="outline"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Model Name Input */}
      <div>
        <Label htmlFor={`${modelNameFieldName}`} className="mb-2 block text-sm font-medium text-gray-700">
          Model Name
        </Label>
        <Input
          id={`${modelNameFieldName}`}
          type="text"
          placeholder="e.g., gpt-4, claude-3-opus-20240229"
          {...register(modelNameFieldName as `advancedOptions.aiModels.${SingleModelInputProps['level']}.${number}.model`)}
          className="w-full"
        />
      </div>

      {/* Loading state from the auth hook */}
      {authLoading && (
        <div className="text-sm text-gray-500">Loading available providers...</div>
      )}
    </div>
  );
};
