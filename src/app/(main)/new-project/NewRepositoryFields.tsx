import React from 'react';
import { useFormContext, useController, FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define template options for the dropdown for better maintainability
const TEMPLATE_OPTIONS = [
  { value: 'android-empty-activity-compose', label: 'Android Studio - Empty Compose Activity' },
  { value: 'ios-multiplatform', label: 'Xcode - Multiplatform' },
];

interface NewRepositoryFieldsProps {
  index: number;
  onRemove: () => void;
  disableInputs: boolean;
}

export const NewRepositoryFields: React.FC<NewRepositoryFieldsProps> = ({ index, onRemove, disableInputs }) => {
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
  
  // Controller for the new Select component
  const { field: templateField } = useController({
    name: `githubRepositories.${index}.template`,
    control,
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
        {!disableInputs && <Button type="button" onClick={onRemove} variant="destructive" size="sm" className="ml-2">
          Delete
        </Button>}
      </h4>
      {/* Name and Organization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`new-repo-name-${index}`}>Repository Name</Label>
          <Input
            id={`new-repo-name-${index}`}
            type="text"
            {...register(`githubRepositories.${index}.name`)}
            placeholder="e.g., my-awesome-repo"
            aria-invalid={!!nameError}
            disabled={disableInputs}
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
            disabled={disableInputs}
          />
        </div>
      </div>
      
      {/* Fork URL and Template */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {!templateField.value && <div>
          <Label htmlFor={`fork-url-${index}`}>Repository URL to Fork (Optional)</Label>
          <Input
            id={`fork-url-${index}`}
            type="text"
            {...register(`githubRepositories.${index}.forkUrl`)}
            placeholder="e.g., https://github.com/owner/repo-to-fork"
            disabled={disableInputs}
          />
        </div>}
        <div>
          <Label htmlFor={`template-${index}`}>Template (Optional)</Label>
          <Select onValueChange={templateField.onChange} value={templateField.value} disabled={disableInputs}>
            <SelectTrigger id={`template-${index}`}>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Private Checkbox */}
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox
          id={`new-repo-private-${index}`}
          checked={privateField.value}
          onCheckedChange={privateField.onChange}
          disabled={disableInputs}
        />
        <Label htmlFor={`new-repo-private-${index}`}>Private Repository</Label>
      </div>
    </div>
  );
};
