'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectFormData } from '@/types/project';

export default function BudgetAndRuntime() {
  const { register, formState: { errors } } = useFormContext<ProjectFormData>();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="maxRuntimeHours">Max Runtime (Hours)</Label>
        <Input
          id="maxRuntimeHours"
          type="number"
          placeholder="e.g., 24"
          {...register('maxRuntimeHours', { valueAsNumber: true })}
          className="mt-1"
        />
        {errors.maxRuntimeHours && (
          <p className="mt-2 text-sm text-red-600">{errors.maxRuntimeHours.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="maxBudget">Max Budget ($)</Label>
        <Input
          id="maxBudget"
          type="number"
          placeholder="e.g., 500.00"
          {...register('maxBudget', { valueAsNumber: true })}
          className="mt-1"
        />
        {errors.maxBudget && <p className="mt-2 text-sm text-red-600">{errors.maxBudget.message}</p>}
      </div>
    </div>
  );
}
