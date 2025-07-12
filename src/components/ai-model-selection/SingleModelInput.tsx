import React, { useState, useEffect } from 'react';
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
import { AIModelConfig, ProjectFormData } from '@/types/project';
import { AddApiKeyButton } from '../../app/(main)/components/ApiKeyManager';
import { api } from '@/lib/api';

interface SingleModelInputProps {
  register: UseFormRegister<ProjectFormData>;
  index: number;
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  field: FieldArrayWithId<ProjectFormData, `advancedOptions.aiModels.${SingleModelInputProps['level']}`, "id">;
}

// Updated provider list that matches the API key system
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
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const basePath = `advancedOptions.aiModels.${level}.${index}`;
  const providerFieldName = `${basePath}.provider`;
  const modelNameFieldName = `${basePath}.modelName`;
  const apiKeyFieldName = `${basePath}.apiKey`;

  // Watch the selected provider to show/hide API key button
  const selectedProvider = watch(providerFieldName as any);

  // Fetch available providers (those with API keys)
  useEffect(() => {
    const fetchAvailableProviders = async () => {
      try {
        const userProfile = await api.getUserProfile();
        const apiKeys = userProfile.apiKeys || [];
        const providersWithKeys = apiKeys.map(key => key.provider);
        setAvailableProviders(providersWithKeys);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setAvailableProviders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableProviders();
  }, []);

  // Check if the selected provider has an API key
  const hasApiKey = (provider: string): boolean => {
    return availableProviders.includes(provider);
  };

  // Handle API key added - refresh available providers
  const handleApiKeyAdded = async (provider: string) => {
    try {
      const userProfile = await api.getUserProfile();
      const apiKeys = userProfile.apiKeys || [];
      const providersWithKeys = apiKeys.map(key => key.provider);
      setAvailableProviders(providersWithKeys);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
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
          {...register(modelNameFieldName as `advancedOptions.aiModels.${SingleModelInputProps['level']}.${number}.modelName`)}
          className="w-full"
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="text-sm text-gray-500">Loading available providers...</div>
      )}
    </div>
  );
};
