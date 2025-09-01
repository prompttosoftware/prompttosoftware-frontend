'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectFormData, RequestType, TestLevel } from '@/types/project';

const testLevelOptions = [
  { value: 'standard', label: 'Standard', description: 'The system will determine when and where tests should be used.' },
  { value: 'required', label: 'Required', description: 'Tests are mandatory for all changes. Work cannot proceed without them.' },
  { value: 'none', label: 'None', description: 'No tests will be written by the AI.' },
];

const requestTypeOptions = [
    { value: 'auto', label: 'Automatic', description: 'AI automatically determines the best request type (e.g., bug fix vs. new feature).' },
    { value: 'change', label: 'Change Request', description: 'An alteration or new feature.' },
    { value: 'bug', label: 'Bug Fix', description: 'Specifically for fixing bugs in the existing codebase.' },
    { value: 'production', label: 'Production Task', description: 'For projects that need to be deployed to production. (Higher scrutiny)' },
    { value: 'dev', label: 'Development Task', description: 'For internal development tasks, experiments, or refactoring.' },
];

export default function DevelopmentSettings() {
  const { watch, setValue, formState: { defaultValues } } = useFormContext<ProjectFormData>();
  const testLevelValue = watch('advancedOptions.testLevel');
  const requestTypeValue = watch('advancedOptions.requestType');
  const initialTestLevel = defaultValues?.advancedOptions?.testLevel;
  const initialRequestType = defaultValues?.advancedOptions?.requestType;

  return (
    <div className="p-4 rounded-md bg-card border space-y-6">
       <h3 className="text-md font-semibold text-card-foreground">Development Configuration</h3>
       
       {/* Test Level Radio Group */}
       <div className="space-y-3">
            <Label>Test Level</Label>
            <RadioGroup
                value={testLevelValue}
                defaultValue={initialTestLevel}
                onValueChange={(value) => setValue('advancedOptions.testLevel', value as TestLevel)}
                className="flex flex-col space-y-2"
            >
                {testLevelOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`test-level-${option.value}`} />
                    <Label htmlFor={`test-level-${option.value}`} className="font-normal w-full">
                      <div className="font-medium">{option.label}</div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </Label>
                  </div>
                ))}
            </RadioGroup>
       </div>

      {/* Request Type Select */}
      <div className="space-y-2">
        <Label>Request Type</Label>
        <Select 
            value={requestTypeValue}
            defaultValue={initialRequestType}
            onValueChange={(value) => setValue('advancedOptions.requestType', value as RequestType)}
        >
            <SelectTrigger>
                <SelectValue placeholder="Select a request type" />
            </SelectTrigger>
            <SelectContent>
            {requestTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col py-1">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
      </div>

    </div>
  );
}
