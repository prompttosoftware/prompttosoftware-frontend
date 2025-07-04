'use client';

import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectFormData, AIModelConfig } from '@/types/project'; // Import AIModelConfig

type AIModelConfigurationSectionProps = {
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
  title: string;
};

const providerOptions = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  // Add other providers as needed
];

export default function AIModelConfigurationSection({ level, title }: AIModelConfigurationSectionProps) {
  const { control, register, formState: { errors }, watch, setValue } = useFormContext<ProjectFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `advancedOptions.aiModels.${level}` as `advancedOptions.aiModels.${typeof level}`,
  });

  const rootErrors = errors.advancedOptions?.aiModels?.[level] as any;

  return (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
      <h3 className="text-md font-semibold text-gray-800 mb-3">{title} AI Models</h3>
      <div className="space-y-3 mb-4">
        {fields.length === 0 ? (
          <p className="text-sm text-gray-500">No {title.toLowerCase()} models added yet.</p>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-3 border border-gray-100 bg-white rounded-md shadow-sm"
            >
              <div className="space-y-2">
                <Label htmlFor={`advancedOptions.aiModels.${level}.${index}.provider`}>Provider</Label>
                <Select
                  onValueChange={(value) => setValue(`advancedOptions.aiModels.${level}.${index}.provider`, value, { shouldValidate: true })}
                  value={watch(`advancedOptions.aiModels.${level}.${index}.provider`) || ''}
                >
                  <SelectTrigger className={rootErrors?.[index]?.provider ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {rootErrors?.[index]?.provider && (
                  <p className="text-red-500 text-xs">{rootErrors[index].provider.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`advancedOptions.aiModels.${level}.${index}.modelName`}>Model Name</Label>
                <Input
                  id={`advancedOptions.aiModels.${level}.${index}.modelName`}
                  {...register(`advancedOptions.aiModels.${level}.${index}.modelName`, { required: 'Model name is required' })}
                  placeholder="e.g., gpt-4o, claude-3-opus-20240229"
                  className={rootErrors?.[index]?.modelName ? 'border-red-500' : ''}
                />
                {rootErrors?.[index]?.modelName && (
                  <p className="text-red-500 text-xs">{rootErrors[index].modelName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`advancedOptions.aiModels.${level}.${index}.apiKey`}>API Key (Optional)</Label>
                <Input
                  id={`advancedOptions.aiModels.${level}.${index}.apiKey`}
                  {...register(`advancedOptions.aiModels.${level}.${index}.apiKey`)}
                  type="password"
                  placeholder="Enter API Key (optional)"
                  className={rootErrors?.[index]?.apiKey ? 'border-red-500' : ''}
                />
                {rootErrors?.[index]?.apiKey && (
                  <p className="text-red-500 text-xs">{rootErrors[index].apiKey.message}</p>
                )}
              </div>
              <div className="flex justify-end md:justify-start pt-6">
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  variant="destructive"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <Button
        type="button"
        onClick={() => append({ provider: '', modelName: '', apiKey: '' })}
        variant="outline"
      >
        Add another {title} Model
      </Button>
    </div>
  );
}
