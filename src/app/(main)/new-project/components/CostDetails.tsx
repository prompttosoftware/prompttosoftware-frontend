'use client';

import React, { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FLAT_RATE_PER_HOUR, HOURLY_AI_API_COST } from '@/services/costEstimationService';
import { ProjectFormData } from '@/types/project';

interface CostDetailsProps {
  result: {
    estimatedDuration: number;
    calculatedCost: number;
    modelUsed: boolean;
    modelErrorMessage?: string | null;
  };
}

export default function CostDetails({ result }: CostDetailsProps) {
  const [show, setShow] = useState(false);
  const { control } = useFormContext<ProjectFormData>();
  const maxRuntimeHours = useWatch({ control, name: 'maxRuntimeHours' });

  const flatRateComponent = FLAT_RATE_PER_HOUR * result.estimatedDuration;
  const aiApiCostComponent = HOURLY_AI_API_COST * result.estimatedDuration;

  return (
    <div className="border border-t-0 border-gray-200 rounded-b-md bg-gray-50">
      <button
        type="button"
        className="flex justify-between items-center w-full text-left px-4 py-3"
        onClick={() => setShow(!show)}
        aria-expanded={show}
      >
        <span className="font-medium text-gray-700">Cost Breakdown</span>
        {/* Chevron Icon */}
      </button>

      {show && (
        <div className="p-4 border-t">
          {/* ... Model status and other details ... */}
          <div
            data-testid="cost-details-content"
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              show ? 'max-h-screen opacity-100 p-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div>
              {result.modelUsed ? (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="bg-blue-100 text-gray-800 text-xs px-2 py-0.5 rounded-full mr-2">
                    ML Model Used
                  </span>
                  Estimation powered by a machine learning model.
                </div>
              ) : (
                <div className="flex items-center text-sm text-red-600 mb-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full mr-2">
                    Using Heuristic
                  </span>
                  ML model not used.{' '}
                  {result.modelErrorMessage ||
                    'Falling back to heuristic estimation.'}
                </div>
              )}

                <h3 className="font-semibold text-xl text-gray-800 mb-2">
                  Estimated Project Cost:
                </h3>
                <div className="space-y-1 mb-3">
                  <p className="text-gray-700 text-md">
                    Flat Rate Component:{' '}
                    <span className="font-medium">
                      ${flatRateComponent.toFixed(2)}
                    </span>
                  </p>
                  <p className="text-gray-700 text-md">
                    AI API Cost Component:{' '}
                    <span className="font-medium">
                      ${aiApiCostComponent.toFixed(2)}
                    </span>
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-700">
                  Total Estimated Cost: ${result.calculatedCost.toFixed(2)}
                </p>
                <p className="text-md text-gray-600 mt-2">
                  Estimated Completion Time:{' '}
                  <span className="font-semibold">
                    {result.estimatedDuration.toFixed(2)}
                  </span>{' '}
                  hours
                </p>
                {maxRuntimeHours !== undefined &&
                  maxRuntimeHours > 0 &&
                  result.estimatedDuration > maxRuntimeHours && (
                    <div className="mt-2 text-red-700 font-bold bg-red-100 py-2 px-4 rounded-md border border-red-300">
                      Warning: Estimated runtime (
                      {result.estimatedDuration.toFixed(2)} hours) clamped to
                      Max Runtime ({maxRuntimeHours.toFixed(2)} hours). Project scope may be
                      too large.
                    </div>
                  )}
                <p className="text-sm text-gray-500 mt-4 px-4 pb-4">
                  Note: If you provide your own API keys in Advanced Options, their usage
                  rates will apply and may alter the final expenditure not reflected in this
                  estimate.
                </p>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
