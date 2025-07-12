'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { NewRepositoryFields } from '../NewRepositoryFields';
import { ExistingRepositoryFields } from '../ExistingRepositoryFields';
import { ProjectFormData } from '@/types/project';

export default function RepositoryManagement() {
  const { control } = useFormContext<ProjectFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'githubRepositories',
  });

  return (
    <div className="border border-gray-200 p-4 rounded-md shadow-sm space-y-4">
      <h3 className="text-lg font-medium text-gray-700">GitHub Repositories</h3>
      {fields.length === 0 && (
        <p className="text-sm text-gray-500">No repositories added. New ones will be created if needed.</p>
      )}

      {fields.map((field, index) =>
        field.type === 'new' ? (
          <NewRepositoryFields key={field.id} index={index} onRemove={() => remove(index)} />
        ) : (
          <ExistingRepositoryFields key={field.id} index={index} onRemove={() => remove(index)} />
        )
      )}

      <div className="flex gap-4 pt-2">
        <Button type="button" onClick={() => append({ type: 'new', name: '', isPrivate: false })} variant="outline">
          Add New Repo
        </Button>
        <Button type="button" onClick={() => append({ type: 'existing', url: '' })} variant="outline">
          Add Existing Repo
        </Button>
      </div>
    </div>
  );
}
