import { ProjectSummary } from '@/src/types/project';
import ExploreProjectCard from './ExploreProjectCard';

interface ProjectGridProps {
  projects: ProjectSummary[];
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
      {projects.map((project) => (
        <ExploreProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;
