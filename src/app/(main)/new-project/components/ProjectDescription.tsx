'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { getEstimatedDurationAndCost } from '@/services/costEstimationService';
import { ProjectFormData } from '@/types/project';
import LoadingSpinner from '@/app/(main)/components/LoadingSpinner';
import CostDetails from './CostDetails';

export default function ProjectDescription() {
  const { register, control, formState: { errors } } = useFormContext<ProjectFormData>();
  const description = useWatch({ control, name: 'description' });
  const debouncedDescription = useDebounce(description, 500);

  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedCostResult, setEstimatedCostResult] = useState<any>(null);

  useEffect(() => {
    if (debouncedDescription && debouncedDescription.length >= 10) {
      const estimate = async () => {
        setIsEstimating(true);
        try {
          const result = await getEstimatedDurationAndCost(debouncedDescription);
          setEstimatedCostResult(result);
        } catch (error) {
          toast.error('Cost estimation failed.');
        } finally {
          setIsEstimating(false);
        }
      };
      estimate();
    } else {
      setEstimatedCostResult(null);
    }
  }, [debouncedDescription]);

  return (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-1">
        Project Description
      </label>
      <textarea
        id="description"
        rows={4}
        {...register('description')}
        className="mt-1 block bg-input placeholder:text-muted-foreground text-card-foreground w-full rounded-md border focus:ring sm:text-sm p-3"
        placeholder="Describe the software you want to build..."
      />
      {errors.description && (
        <p className="mt-2 text-sm text-destructive">{errors.description.message}</p>
      )}

      <div className="mt-4 p-4 rounded-md bg-card border flex items-center justify-between" id="cost-estimate-display">
        <p className="text-md font-semibold text-card-foreground">Estimated Cost:</p>
        {isEstimating ? (
          <LoadingSpinner size='small' />
        ) : (
          <p className="text-lg font-bold text-card-foreground">
            {estimatedCostResult?.calculatedCost ? `$${estimatedCostResult.calculatedCost.toFixed(2)}` : '$0.00'}
          </p>
        )}
      </div>

      {estimatedCostResult && !isEstimating && (
        <CostDetails result={estimatedCostResult} />
      )}
    </div>
  );
}
