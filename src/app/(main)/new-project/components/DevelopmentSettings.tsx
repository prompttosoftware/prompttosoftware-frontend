'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DevMode, ProjectFormData, RequestType, TestLevel } from '@/types/project';
import { Checkbox } from '@/components/ui/checkbox';

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

const devModeOptions = [
  { value: 'auto', label: 'Auto', description: 'AI automatically determines the best development mode.' },
  { value: 'general_purpose', label: 'General Purpose', description: 'A single Agent does everything.' },
  { value: 'write_test_repeat', label: 'Write Test Repeat', description: 'AI writes all the code for a task. A separate agent tests.'}
];

export default function DevelopmentSettings() {
  const { watch, setValue, formState: { defaultValues } } = useFormContext<ProjectFormData>();
  const testLevelValue = watch('advancedOptions.testLevel');
  const requestTypeValue = watch('advancedOptions.requestType');
  const devModeValue = watch('advancedOptions.devMode');
  const singleIssueValue = watch('advancedOptions.singleIssue');
  
  const initialTestLevel = defaultValues?.advancedOptions?.testLevel;
  const initialRequestType = defaultValues?.advancedOptions?.requestType;
  const initialDevMode = defaultValues?.advancedOptions?.devMode;
  const initialSingleIssue = defaultValues?.advancedOptions?.singleIssue;
  
  const selectedTestLevel = testLevelOptions.find(opt => opt.value === testLevelValue);
  const selectedRequestType = requestTypeOptions.find(opt => opt.value === requestTypeValue);
  const selectedDevMode = devModeOptions.find(opt => opt.value === devModeValue);

  return (
    <div className="p-4 rounded-md bg-card border">
       <h3 className="text-md font-semibold text-card-foreground">Development Configuration</h3>
       
       <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Level Select */}
          <div className="space-y-2">
            <Label>Test Level</Label>
            <Select
                value={testLevelValue}
                defaultValue={initialTestLevel}
                onValueChange={(value) => setValue('advancedOptions.testLevel', value as TestLevel)}
            >
                <SelectTrigger className="h-auto text-left">
                    {selectedTestLevel ? (
                        <div className="flex flex-col">
                           <span className="font-medium">{selectedTestLevel.label}</span>
                           <span className="text-xs text-muted-foreground">{selectedTestLevel.description}</span>
                        </div>
                    ) : (
                      <SelectValue placeholder="Select a test level" />
                    )}
                </SelectTrigger>
                <SelectContent>
                {testLevelOptions.map((option) => (
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

          {/* Request Type Select */}
          <div className="space-y-2">
            <Label>Request Type</Label>
            <Select 
                value={requestTypeValue}
                defaultValue={initialRequestType}
                onValueChange={(value) => setValue('advancedOptions.requestType', value as RequestType)}
            >
                <SelectTrigger className="h-auto text-left">
                    {selectedRequestType ? (
                        <div className="flex flex-col">
                           <span className="font-medium">{selectedRequestType.label}</span>
                           <span className="text-xs text-muted-foreground">{selectedRequestType.description}</span>
                        </div>
                    ) : (
                      <SelectValue placeholder="Select a request type" />
                    )}
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

          {/* Dev Mode Select */}
          <div className="space-y-2">
            <Label>Dev Mode</Label>
            <Select
              value={devModeValue}
              defaultValue={initialDevMode}
              onValueChange={(value) => setValue('advancedOptions.devMode', value as DevMode)}
            >
              <SelectTrigger className="h-auto text-left">
                  {selectedDevMode ? (
                      <div className="flex flex-col">
                          <span className="font-medium">{selectedDevMode.label}</span>
                          <span className="text-xs text-muted-foreground">{selectedDevMode.description}</span>
                      </div>
                  ) : (
                    <SelectValue placeholder="Select a dev mode" />
                  )}
              </SelectTrigger>
              <SelectContent>
                {devModeOptions.map((option) => (
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

          {/* Single Issue Checkbox */}
          <div className="space-y-2">
            <Label>Task Mode</Label>
            <div className="flex items-start space-x-3 rounded-md border p-4">
              <Checkbox
                id="single-issue"
                checked={singleIssueValue}
                defaultChecked={initialSingleIssue}
                onCheckedChange={(checked) => setValue('advancedOptions.singleIssue', !!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="single-issue" className="font-medium">
                  Single Issue
                </Label>
                <p className="text-xs text-muted-foreground">
                  One issue is used for the entire project.
                </p>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}
