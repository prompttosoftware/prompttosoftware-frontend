'use client';

import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { X } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectFormData } from '@/types/project';

// Define the maximum number of criteria allowed
const MAX_CRITERIA = 10;

export default function BudgetAndRuntime() {
  const { register, control, watch, formState: { errors } } = useFormContext<ProjectFormData>();

  // Watch the 'experiment' checkbox value to conditionally render fields
  const isExperiment = watch('experiment');

  // useFieldArray hook to manage the dynamic list of criteria
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'criteria',
  });

  const addCriterion = () => {
    if (fields.length < MAX_CRITERIA) {
      // Appends a new criterion with a unique ID (the backend might override this)
      append({ id: uuidv4(), description: '' });
    }
  };
  
  const isAtMaxCriteria = fields.length >= MAX_CRITERIA;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Standard Budget and Runtime Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="maxRuntimeHours">Max Runtime (Hours)</Label>
              </TooltipTrigger>
              <TooltipContent>
                The maximum hours this project can run before stopping. Resets on each start.
              </TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="maxBudget">Max Budget ($)</Label>
              </TooltipTrigger>
              <TooltipContent>
                The maximum budget in USD this project can use. Resets on each start.
              </TooltipContent>
            </Tooltip>
            <Input
              id="maxBudget"
              type="number"
              placeholder="e.g., 50"
              {...register('maxBudget', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.maxBudget && <p className="mt-2 text-sm text-red-600">{errors.maxBudget.message}</p>}
          </div>
        </div>
        
        {/* Experiment Checkbox */}
        <div className="flex items-center space-x-2 pt-2">
          <Controller
            control={control}
            name="experiment"
            render={({ field }) => (
              <Checkbox
                id="experiment"
                checked={field.value}
                onCheckedChange={field.onChange}
                data-testid="experiment-checkbox"
              />
            )}
          />
          <Label htmlFor="experiment" className="font-medium text-base">
            Run as Experiment
          </Label>
        </div>

        {/* Conditionally Rendered Experiment Fields */}
        {isExperiment && (
          <div className="bg-card p-4 rounded-md border space-y-4 animate-in fade-in-0" data-testid="experiment-fields">
            {/* Max Experiments Input */}
            <div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="maxExperiments">Max Experiments</Label>
                </TooltipTrigger>
                <TooltipContent>
                  The maximum number of distinct experimental runs.
                </TooltipContent>
              </Tooltip>
              <Input
                id="maxExperiments"
                type="number"
                placeholder="e.g., 20"
                {...register('maxExperiments', { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.maxExperiments && (
                <p className="mt-2 text-sm text-red-600">{errors.maxExperiments.message}</p>
              )}
            </div>

            {/* Criteria Management */}
            <div className="space-y-3">
              <div>
                <Label className="text-base">Success Criteria</Label>
                <p className="text-sm text-muted-foreground">
                  Define up to {MAX_CRITERIA} criteria to evaluate the experiment's success.
                </p>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder={`Criterion #${index + 1}`}
                      {...register(`criteria.${index}.description`)}
                      data-testid={`criteria-input-${index}`}
                    />
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      data-testid={`remove-criterion-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {errors.criteria && (
                  <p className="mt-2 text-sm text-red-600">
                    One or more criteria may be invalid. Please check your entries.
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  onClick={addCriterion}
                  variant="outline"
                  size="sm"
                  disabled={isAtMaxCriteria}
                  data-testid="add-criterion-button"
                >
                  Add Criterion
                </Button>
                {isAtMaxCriteria && (
                    <p className="text-sm text-destructive">
                        Maximum of {MAX_CRITERIA} criteria reached.
                    </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
