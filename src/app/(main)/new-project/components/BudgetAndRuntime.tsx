'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectFormData } from '@/types/project';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function BudgetAndRuntime() {
  const { register, formState: { errors } } = useFormContext<ProjectFormData>();
  return (
    <TooltipProvider>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="maxRuntimeHours">Max Runtime (Hours)</Label>
          </TooltipTrigger>
          <TooltipContent>
            The maximum number of hours this project is allowed to run before stopping automatically. This resets each time the project is started.
          </TooltipContent>
        </Tooltip>
        <Input
          id="maxRuntimeHours"
          type="number"
          placeholder="e.g., 24"
          {...register('maxRuntimeHours', { valueAsNumber: true })}
          className="mt-1"
          maxLength={3}
        />
        {errors.maxRuntimeHours && (
          <p className="mt-2 text-sm text-red-600">{errors.maxRuntimeHours.message}</p>
        )}
      </div>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="maxBudget">Max Budget ($)</Label>
          </TooltipTrigger>
          <TooltipContent>
            The maximum budget in USD that this project can use before being stopped. This resets each time the project is started.
          </TooltipContent>
        </Tooltip>
        <Input
          id="maxBudget"
          type="number"
          placeholder="e.g., 500"
          {...register('maxBudget', { valueAsNumber: true })}
          className="mt-1"
          maxLength={3}
        />
        {errors.maxBudget && <p className="mt-2 text-sm text-red-600">{errors.maxBudget.message}</p>}
      </div>
    </div>
    </TooltipProvider>
  );
}
