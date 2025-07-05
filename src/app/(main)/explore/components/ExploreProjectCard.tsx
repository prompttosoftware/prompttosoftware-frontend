import { ProjectSummary } from '@/src/types/project';
import { formatDistanceToNow } from 'date-fns';
import { FaStar } from 'react-icons/fa';

interface ExploreProjectCardProps {
  project: ProjectSummary;
}

const ExploreProjectCard: React.FC<ExploreProjectCardProps> = ({ project }) => {
  const createdAtText = project.createdAt
    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
    : 'N/A';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate">
          {project.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-12 overflow-hidden text-ellipsis">
          {project.description || 'No description provided.'}
        </p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <FaStar className="inline-block mr-1 text-yellow-400" />
            {project.githubStars !== undefined ? project.githubStars.toLocaleString() : 'N/A'} stars
          </span>
          <span>Created {createdAtText}</span>
        </div>
      </div>
    </div>
  );
};

export default ExploreProjectCard;
