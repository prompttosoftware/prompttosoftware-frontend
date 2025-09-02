import React, { useState } from 'react';
import { useFormContext, useController, FieldError, useFieldArray } from 'react-hook-form';
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
import { Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    getValues,
  } = useFormContext();

  const { field: privateField } = useController({
    name: `githubRepositories.${index}.isPrivate`,
    control,
    defaultValue: false,
  });
  
  const { field: templateField } = useController({
    name: `githubRepositories.${index}.template`,
    control,
    defaultValue: undefined,
  });

  const tagsFieldName = `githubRepositories.${index}.tags` as const;
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: tagsFieldName,
  });

  const [tagInputValue, setTagInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedValue = tagInputValue.trim();
    if (trimmedValue) {
      const currentTags = getValues(tagsFieldName) || [];
      if (!currentTags.includes(trimmedValue)) {
        appendTag(trimmedValue);
      }
      setTagInputValue('');
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  type GithubRepoErrors = { name?: FieldError; organization?: FieldError; isPrivate?: FieldError };
  const githubRepositoriesErrors = errors.githubRepositories as GithubRepoErrors[] | undefined;
  
  const currentRepoErrors = githubRepositoriesErrors?.[index];
  const nameError = currentRepoErrors?.name;

  return (
    <TooltipProvider>
    <div className="bg-card p-4 rounded-md shadow-sm mb-4">
      <h4 className="text-md font-semibold text-card-foreground mb-3">
        New Repository #{index + 1}
        {!disableInputs && <Button type="button" onClick={onRemove} variant="ghost" size="sm">
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
            maxLength={39}
          />
          {nameError && <p className="text-destructive text-xs mt-1">{nameError.message}</p>}
        </div>
        <div>
          <Label htmlFor={`new-repo-org-${index}`}>Organization Name (Optional)</Label>
          <Input
            id={`new-repo-org-${index}`}
            type="text"
            {...register(`githubRepositories.${index}.organization`)}
            placeholder="e.g., my-organization"
            disabled={disableInputs}
            maxLength={200}
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
            maxLength={200}
          />
        </div>}
        <div>
          <Label htmlFor={`template-${index}`}>Template (Optional)</Label>
          <Select disabled={disableInputs} value={templateField.value} onValueChange={templateField.onChange}>
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

      {/* Tags Input Section */}
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={`tags-input-new-${index}`}>Tags (Optional)</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              The tags will be used during development to ensure consistency. Tags are also created automatically.
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id={`tags-input-new-${index}`}
            type="text"
            value={tagInputValue}
            onChange={(e) => setTagInputValue(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="e.g., language:python, style:minamalist"
            disabled={disableInputs}
            maxLength={50}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={disableInputs || !tagInputValue.trim()}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 min-h-[24px]">
          {tagFields.map((field, tagIndex) => {
            const tagValue = getValues(`${tagsFieldName}.${tagIndex}`);
            return (
              <div key={field.id} className="flex items-center bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                <span>{tagValue}</span>
                {!disableInputs && (
                  <button
                    type="button"
                    onClick={() => removeTag(tagIndex)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove tag ${tagValue}`}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
};
