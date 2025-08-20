import React from 'react';
import { useFormContext, FieldErrors, FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';


interface ExistingRepositoryFieldsProps {
  index: number;
  onRemove: () => void;
  disableInputs: boolean;
}

export const ExistingRepositoryFields: React.FC<ExistingRepositoryFieldsProps> = ({
  index,
  onRemove,
  disableInputs,
}) => {
  const {
    register,
    formState: { errors },
    watch, // Access watch from useFormContext
  } = useFormContext(); // Use useFormContext

  


  const repoType = watch(`githubRepositories.${index}.type`); // Watch the type of the current repository

  // Explicitly cast the errors for githubRepositories to tell TypeScript its structure
  const githubRepoErrors = errors.githubRepositories as
    | FieldErrors<Record<string, { url?: FieldError }>>
    | undefined;
  const urlError = githubRepoErrors?.[index]?.url; // Now access is type-safe

  const isInvalid = repoType === 'existing' && !!urlError;

  

  return (
    <div className="bg-card p-4 rounded-md shadow-sm mb-4">
      <h4 className="text-md font-semibold text-card-foreground mb-3">
        Existing Repository #{index + 1}
        {!disableInputs && <Button type="button" onClick={onRemove} variant="destructive" size="sm" className="ml-2">
          Delete
        </Button>}
      </h4>
      <div>
        <Label htmlFor={`existing-repo-url-${index}`}>GitHub Repository URL</Label>
        <Input
          id={`existing-repo-url-${index}`}
          type="text"
          {...register(`githubRepositories.${index}.url`)}
          placeholder="e.g., https://github.com/username/repo"
          aria-invalid={isInvalid}
          disabled={disableInputs}
        />
        {isInvalid && urlError?.message && (
          <p className="text-destructive text-xs mt-1">{String(urlError.message)}</p>
        )}
      </div>

      
    </div>
  );
};
