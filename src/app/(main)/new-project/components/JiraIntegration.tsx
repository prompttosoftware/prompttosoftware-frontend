'use client';
import { useFormContext } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import LinkJiraButton from '@/app/(main)/components/LinkJiraButton';
import { ProjectFormData } from '@/types/project';

interface JiraIntegrationProps {
  isJiraGloballyLinked: boolean;
}

export default function JiraIntegration({ isJiraGloballyLinked }: JiraIntegrationProps) {
  const { register, setValue, watch } = useFormContext<ProjectFormData>();
  // Watch the checkbox value to conditionally show the project key input
  const jiraLinked = watch('advancedOptions.jiraLinked');

  return (
    <div className="p-4 rounded-md bg-card border" id="jira-integration-section">
      {/* Disclaimer */}
      {isJiraGloballyLinked && (
        <div className="mb-4 p-3 border rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Important:</strong> Only one project can use Jira integration at a time. 
            These settings cannot be changed once the project is created.
          </p>
        </div>
      )}

      <div className="flex items-start space-x-4">
        <Checkbox
          id="jira-checkbox"
          {...register('advancedOptions.jiraLinked')}
          disabled={!isJiraGloballyLinked}
          onCheckedChange={(checked) => setValue('advancedOptions.jiraLinked', !!checked)}
          className="mt-1" // Align checkbox with the first line of text
        />
        <div className="flex-grow">
          <Label htmlFor="jira-checkbox" className={`font-semibold ${!isJiraGloballyLinked ? 'text-card-foreground' : ''}`}>
            Create and track project tasks in Jira
          </Label>
         
          {!isJiraGloballyLinked && <p className="text-sm text-card-foreground mt-2">Link your Jira account first.</p>}
        </div>
        {!isJiraGloballyLinked && <LinkJiraButton />}
      </div>

      {/* Conditionally rendered Project Key input */}
      {isJiraGloballyLinked && jiraLinked && (
        <div className="mt-4 pl-8"> {/* Indent to align with the label text */}
          <Label htmlFor="jira-project-key">Jira Project Key (Optional)</Label>
          <Input
            id="jira-project-key"
            type="text"
            {...register('advancedOptions.jiraProjectKey')}
            placeholder="e.g., PROJ"
            className="mt-1 max-w-xs"
            maxLength={10}
          />
          <p className="text-xs text-card-foreground mt-1">
            If left blank, a new Jira project will be created.
          </p>
        </div>
      )}
    </div>
  );
}
