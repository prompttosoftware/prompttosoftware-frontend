import React from 'react';
import { useFormContext, useController, FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';


interface NewRepositoryFieldsProps {
  index: number;
  onRemove: () => void;
}

export const NewRepositoryFields: React.FC<NewRepositoryFieldsProps> = ({ index, onRemove }) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const { field: privateField } = useController({
    name: `githubRepositories.${index}.isPrivate`,
    control,
    defaultValue: false,
  });

  

  // Type assertion for githubRepositories errors for easier access
  type GithubRepoErrors = { name?: FieldError; organization?: FieldError; isPrivate?: FieldError };
  const githubRepositoriesErrors = errors.githubRepositories as GithubRepoErrors[] | undefined;
  
  const currentRepoErrors = githubRepositoriesErrors?.[index];
  const nameError = currentRepoErrors?.name;

  

  return (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm mb-4">
      <h4 className="text-md font-semibold text-gray-700 mb-3">
        New Repository #{index + 1}
        <Button type="button" onClick={onRemove} variant="destructive" size="sm" className="ml-2">
          Delete
        </Button>
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`new-repo-name-${index}`}>Repository Name</Label>
          <Input
            id={`new-repo-name-${index}`}
            type="text"
            {...register(`githubRepositories.${index}.name`)}
            placeholder="e.g., my-awesome-repo"
            aria-invalid={!!nameError}
          />
          {nameError && <p className="text-red-500 text-xs mt-1">{nameError.message}</p>}
        </div>
        <div>
          <Label htmlFor={`new-repo-org-${index}`}>Organization Name (Optional)</Label>
          <Input
            id={`new-repo-org-${index}`}
            type="text"
            {...register(`githubRepositories.${index}.organization`)}
            placeholder="e.g., my-organization"
          />
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id={`new-repo-private-${index}`}
            checked={privateField.value}
            onCheckedChange={privateField.onChange}
          />
          <Label htmlFor={`new-repo-private-${index}`}>Private Repository</Label>
        </div>
      </div>

      
    </div>
  );
};
