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
import { useFormContext, UseFormRegister, Controller } from 'react-hook-form';
import { AIModelConfig, ProjectFormData } from '@/types/project'; // Import AIModelConfig and ProjectFormData
import { FieldArrayWithId } from 'react-hook-form/dist/types/fieldArray'; // Import FieldArrayWithId


interface SingleModelInputProps {
  register: UseFormRegister<ProjectFormData>;
  index: number;
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  field: FieldArrayWithId<ProjectFormData, `advancedOptions.aiModels.${SingleModelInputProps['level']}`, "id">;
}

// Temporary list of AI providers, will likely be dynamic in the future
const AI_PROVIDERS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Google', value: 'google' },
  { label: 'Mistral AI', value: 'mistral' },
  { label: 'Custom', value: 'custom' },
];

export const SingleModelInput: React.FC<SingleModelInputProps> = ({
  register,
  index,
  level,
  field,
}) => {
  const { control } = useFormContext<ProjectFormData>();

  const basePath = `advancedOptions.aiModels.${level}.${index}`;
  const providerFieldName = `${basePath}.provider`;
  const modelNameFieldName = `${basePath}.modelName`;
  const apiKeyFieldName = `${basePath}.apiKey`;

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-sm">
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
              <SelectContent className="relative z-[60] max-h-96 min-w-[8rem] rounded-md border bg-gray-700 text-white shadow-md">
                {AI_PROVIDERS.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
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

      {/* API Key Input (Optional) */}
      <div>
        <Label htmlFor={`${apiKeyFieldName}`} className="mb-2 block text-sm font-medium text-gray-700">
          API Key (Optional)
        </Label>
        <Input
          id={`${apiKeyFieldName}`}
          type="password" // Use password type for API keys
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          {...register(apiKeyFieldName as `advancedOptions.aiModels.${SingleModelInputProps['level']}.${number}.apiKey`)}
          className="w-full"
        />
      </div>
    </div>
  );
};
