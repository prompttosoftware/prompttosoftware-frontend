'use client';

import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LinkJiraButton from '@/app/(main)/components/LinkJiraButton';
import { ProjectFormData } from '@/types/project';

interface JiraIntegrationProps {
  isJiraGloballyLinked: boolean;
}

export default function JiraIntegration({ isJiraGloballyLinked }: JiraIntegrationProps) {
  const { register, setValue } = useFormContext<ProjectFormData>();
  return (
    <div className="border border-gray-200 p-4 rounded-md bg-gray-50 shadow-sm">
      <div className="flex items-center space-x-4">
        <Checkbox
          id="jira-checkbox"
          {...register('advancedOptions.jiraLinked')}
          disabled={!isJiraGloballyLinked}
          onCheckedChange={(checked) => setValue('advancedOptions.jiraLinked', !!checked)}
        />
        <div className="flex-grow">
          <Label htmlFor="jira-checkbox" className={!isJiraGloballyLinked ? 'text-gray-400' : ''}>
            Create and track project tasks in Jira
          </Label>
          {!isJiraGloballyLinked && <p className="text-sm text-gray-500">Link your Jira account first.</p>}
        </div>
        {!isJiraGloballyLinked && <LinkJiraButton />}
      </div>
    </div>
  );
}
