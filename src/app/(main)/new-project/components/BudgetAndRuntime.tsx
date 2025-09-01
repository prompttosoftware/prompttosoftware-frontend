'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectFormData } from '@/types/project';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export default function BudgetAndRuntime() {
  const { register, formState: { errors } } = useFormContext<ProjectFormData>();
  return (
    <TooltipProvider>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2">
          <Label htmlFor="maxRuntimeHours">Max Runtime (Hours)</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              The maximum number of hours this project is allowed to run before stopping automatically. This resets each time the project is started.
            </TooltipContent>
          </Tooltip>
        </div>
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
        <div className="flex items-center gap-2">
          <Label htmlFor="maxBudget">Max Budget ($)</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              The maximum budget in USD that this project can use before being stopped. This resets each time the project is started.
            </TooltipContent>
          </Tooltip>
        </div>
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
