import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ExistingRepositoryFieldsProps {
  index: number;
  onRemove: () => void;
}

export const ExistingRepositoryFields: React.FC<ExistingRepositoryFieldsProps> = ({
  index,
  onRemove,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext(); // Use useFormContext

  return (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm mb-4">
      <h4 className="text-md font-semibold text-gray-700 mb-3">
        Existing Repository #{index + 1}
        <Button type="button" onClick={onRemove} variant="destructive" size="sm" className="ml-2">
          Delete
        </Button>
      </h4>
      <div>
        <Label htmlFor={`existing-repo-url-${index}`}>GitHub Repository URL</Label>
        <Input
          id={`existing-repo-url-${index}`}
          type="text"
          {...register(`githubRepositories.${index}.url`)}
          placeholder="e.g., https://github.com/username/repo"
          aria-invalid={
            errors.githubRepositories?.[index]?.type === 'existing' &&
            !!(errors.githubRepositories?.[index] as any)?.url
          }
        />
        {errors.githubRepositories?.[index]?.type === 'existing' &&
          (errors.githubRepositories[index] as any)?.url && (
            <p className="text-red-500 text-xs mt-1">
              {(errors.githubRepositories[index] as any).url.message}
            </p>
          )}
      </div>
    </div>
  );
};
