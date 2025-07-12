import React from 'react';
import { Progress } from '@/components/ui/progress'; // Assuming you have a Shadcn UI Progress component

interface ProjectProgressBarProps {
  progress: number;
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({ progress }) => {
  return (
    <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-400">
      <Progress value={progress} className="h-2.5 rounded-full" />
    </div>
  );
};

export default ProjectProgressBar;
