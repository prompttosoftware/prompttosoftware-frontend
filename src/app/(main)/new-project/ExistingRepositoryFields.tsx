import React, { useState } from 'react';
import { useFormContext, FieldErrors, FieldError, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    control,
    getValues,
    formState: { errors },
    watch,
  } = useFormContext();

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


  const repoType = watch(`githubRepositories.${index}.type`);

  const githubRepoErrors = errors.githubRepositories as
    | FieldErrors<Record<string, { url?: FieldError }>>
    | undefined;
  const urlError = githubRepoErrors?.[index]?.url;

  const isInvalid = repoType === 'existing' && !!urlError;

  return (
    <TooltipProvider>
    <div className="bg-card p-4 rounded-md shadow-sm mb-4">
      <h4 className="text-md font-semibold text-card-foreground mb-3">
        Existing Repository #{index + 1}
        {!disableInputs && <Button type="button" onClick={onRemove} variant="ghost" size="sm" className="ml-2">
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
          maxLength={200}
        />
        {isInvalid && urlError?.message && (
          <p className="text-destructive text-xs mt-1">{String(urlError.message)}</p>
        )}
      </div>

      {/* Tags Input Section */}
      <div className="mt-4">
        <Label htmlFor={`tags-input-existing-${index}`}>Tags (Optional)</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent>
            The tags will be used during development to ensure consistency. Tags are also created automatically.
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id={`tags-input-existing-${index}`}
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
