import React, { useState, useCallback } from 'react';
import { SingleModelInput } from './SingleModelInput';
import { ModelConfig } from '@/types/ai-models';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react'; // Assuming lucide-react is installed for icons

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Model, ProjectFormData } from '@/types/project'; // Import ProjectFormData and AIModelConfig

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
      append({ provider: undefined, model: '' }, { shouldFocus: false });
    }
  }, [fields, append]);

  const handleAddModel = useCallback(() => {
    append({ provider: undefined, model: '' }, { shouldFocus: false });
  }, [append]);

  const handleDeleteModel = useCallback(
    (index: number) => {
      if (fields.length > 1) { // Prevent deleting the last field
        remove(index);
      } else {
        // If only one model exists, clear its values instead of removing
        update(index, { provider: undefined, model: '' });
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
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
        >
          <div className="flex-1 w-full">
            <SingleModelInput
              register={control.register}
              index={index}
              level={level}
              field={field}
            />
          </div>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDeleteModel(index)}
            className="self-end sm:self-auto"
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
