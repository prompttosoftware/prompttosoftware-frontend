import React, { useState, useCallback } from 'react';
import { SingleModelInput } from './SingleModelInput';
import { ModelConfig } from '@/types/ai-models';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react'; // Assuming lucide-react is installed for icons

import { useFormContext, useFieldArray } from 'react-hook-form';
import { ProjectFormData, AIModelConfig } from '@/types/project'; // Import ProjectFormData and AIModelConfig

interface IntelligenceLevelModelSelectorProps {
  level: 'utility' | 'low' | 'medium' | 'high' | 'super' | 'backup';
}

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

  // Add an initial empty model if the list is empty
  React.useEffect(() => {
    if (fields.length === 0) {
      append({ provider: '', modelName: '', apiKey: '' });
    }
  }, [fields, append]);

  const handleAddModel = useCallback(() => {
    append({ provider: '', modelName: '', apiKey: '' });
  }, [append]);

  const handleDeleteModel = useCallback(
    (index: number) => {
      if (fields.length > 1) { // Prevent deleting the last field
        remove(index);
      } else {
        // If only one model exists, clear its values instead of removing
        update(index, { provider: '', modelName: '', apiKey: '' });
      }
    },
    [fields, remove, update]
  );

  const handleUpdateModel = useCallback(
    (index: number, updatedModel: AIModelConfig) => {
      update(index, updatedModel);
    },
    [update]
  );


  return (
    <div className="space-y-6 p-6 border rounded-lg bg-white shadow-md">
      {(fields || []).map((field, index) => (
        <div key={field.id} className="flex items-center gap-4">
          <div className="flex-1">
            <SingleModelInput
              register={control.register} // Pass register function
              index={index}
              level={level}
              field={field as AIModelConfig} // Cast field to AIModelConfig to access its properties
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteModel(index)} // Pass index to delete
            className="flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete model</span>
          </Button>
        </div>
      ))}

      <Button onClick={handleAddModel} variant="outline" className="w-full">
        <PlusCircle className="mr-2 h-4 w-4" />
        Add another model
      </Button>
    </div>
  );
};
