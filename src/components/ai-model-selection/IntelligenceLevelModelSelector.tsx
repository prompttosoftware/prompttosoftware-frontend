import React, { useCallback } from 'react';
import { SingleModelInput } from './SingleModelInput';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react'; // Assuming lucide-react is installed for icons

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Model, ProjectFormData, Provider } from '@/types/project'; // Import ProjectFormData and AIModelConfig
import { DEFAULT_MODELS } from '@/lib/data/models';

interface IntelligenceLevelModelSelectorProps {
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
}

const MAX_MODELS_PER_LEVEL = 3;

export const IntelligenceLevelModelSelector: React.FC<IntelligenceLevelModelSelectorProps> = ({
  level,
}) => {
  const { control } = useFormContext<ProjectFormData>();
  const {
    fields,
    append,
    remove,
    update, // We will use update for changing individual model properties
  } = useFieldArray({
    control,
    name: `advancedOptions.aiModels.${level}` as 'advancedOptions.aiModels.utility', // Type assertion needed for dynamic name
  });

  const isAtMaxModels = fields.length >= MAX_MODELS_PER_LEVEL;

  const defaultModel = {
    provider: 'openrouter' as Provider,
    model: DEFAULT_MODELS[level] ?? '',
  };

  const handleAddModel = useCallback(() => {
    if (isAtMaxModels) return;
    append({ provider: undefined, model: '' }, { shouldFocus: false });
  }, [append]);

  const handleDeleteModel = useCallback(
    (index: number) => {
      if (fields.length > 1) { // Prevent deleting the last field
        remove(index);
      } else {
        // If only one model exists, clear its values instead of removing
        update(index, defaultModel);
      }
    },
    [fields, remove, update]
  );

  const handleUpdateModel = useCallback(
    (index: number, updatedModel: Model) => {
      update(index, updatedModel);
    },
    [update]
  );


  return (
    <div className="space-y-4">
      {(fields || []).map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-card rounded-lg border"
          id="model-select-card"
        >
          <div className="flex-1 w-full">
            <SingleModelInput
              index={index}
              level={level}
              field={field}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteModel(index)}
            className="self-end sm:self-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete model</span>
          </Button>
        </div>
      ))}
      <Button 
        onClick={handleAddModel} 
        variant="ghost" 
        className="w-full sm:w-auto"
        disabled={isAtMaxModels}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add another model
      </Button>
      {isAtMaxModels && (
        <p className="text-sm text-destructive text-center">
            You have reached the maximum of {MAX_MODELS_PER_LEVEL} models for this level.
        </p>
      )}
    </div>
  );
};
