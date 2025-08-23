'use client';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NewRepositoryFields } from '../NewRepositoryFields';
import { ExistingRepositoryFields } from '../ExistingRepositoryFields';
import { ProjectFormData } from '@/types/project';

interface RepositoryManagementProps {
  isEditing: boolean;
}

export default function RepositoryManagement({ isEditing }: RepositoryManagementProps) {
  const { control } = useFormContext<ProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'githubRepositories',
  });
  
  // Track the initial field count when component mounts
  const initialFieldCountRef = useRef<number>(fields.length);
  const [currentFieldCount, setCurrentFieldCount] = useState(fields.length);
  
  // Update the current field count when fields change
  useEffect(() => {
    setCurrentFieldCount(fields.length);
  }, [fields.length]);

  const addNewRepo = () => {
    const newItem = { type: 'new' as const, name: '', isPrivate: false };
    append(newItem);
  };

  const addExistingRepo = () => {
    const newItem = { type: 'existing' as const, url: '' };
    append(newItem);
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  return (
    <div className="bg-card p-4 rounded-md border space-y-4">
      <h3 className="text-lg font-medium text-card-foreground">GitHub Repositories</h3>
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No repositories added. New ones will be created if needed.</p>
      )}
      {fields.map((field, index) => {
        // If we're editing, only disable inputs for items that existed initially
        const shouldDisableInputs = isEditing && index < initialFieldCountRef.current;
        
        return field.type === 'new' ? (
          <NewRepositoryFields
            key={field.id}
            index={index}
            onRemove={() => handleRemove(index)}
            disableInputs={shouldDisableInputs}
          />
        ) : (
          <ExistingRepositoryFields
            key={field.id}
            index={index}
            onRemove={() => handleRemove(index)}
            disableInputs={shouldDisableInputs}
          />
        );
      })}
      <div className="flex gap-4 pt-2">
        <Button 
          type="button" 
          onClick={addNewRepo} 
          variant="default"
          disabled={false} // Explicitly enable
        >
          Add New Repo
        </Button>
        <Button 
          type="button" 
          onClick={addExistingRepo} 
          variant="default"
          disabled={false} // Explicitly enable
        >
          Add Existing Repo
        </Button>
      </div>
    </div>
  );
}
