import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ExistingRepositoryFieldsProps {
  index: number;
  onRemove: () => void;
}

export const ExistingRepositoryFields: React.FC<ExistingRepositoryFieldsProps> = ({ index, onRemove }) => {
  const { register, formState: { errors } } = useFormContext(); // Use useFormContext

  const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/.*)?$/;

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
          type="url"
          {...register(`githubRepositories.${index}.url`, {
            required: 'GitHub repository URL is required',
            pattern: {
              value: githubUrlPattern,
              message: 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)',
            },
          })}
          placeholder="e.g., https://github.com/your-org/your-repo"
        />
        {errors.githubRepositories?.[index]?.url && (
          <p className="text-red-500 text-xs mt-1">
            {errors.githubRepositories[index].url.message as string}
          </p>
        )}
      </div>
    </div>
  );
};
