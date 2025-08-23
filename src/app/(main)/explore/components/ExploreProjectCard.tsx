'use client';

import React, { useState } from 'react';
import { ProjectSummary } from '@/types/project';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Github } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStarProject } from '@/hooks/useStarProject';

interface ExploreProjectCardProps {
  project: ProjectSummary & {
    starredByCurrentUser?: boolean;
  };
}

const ExploreProjectCard: React.FC<ExploreProjectCardProps> = ({ project }) => {
  const [isStarred, setIsStarred] = useState(project.starredByCurrentUser ?? false);
  const [stars, setStars] = useState(project.stars ?? 0);
  const { toggleStar, isLoading } = useStarProject();

  const handleToggle = () => {
    setIsStarred(prev => !prev);
    setStars(prev => (isStarred ? prev - 1 : prev + 1));
    toggleStar(project._id, isStarred);
  };

  return (
    <Card className="flex flex-col h-full border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={project.user?.avatarUrl} alt={`${project.user?.name}'s avatar`} />
            <AvatarFallback>{project.user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
            <p className="text-sm text-card-foreground">by {project.user?.name || 'Unknown User'}</p>

            <div className="mt-1 flex flex-wrap gap-1">
              {project.models && project.models.medium && Array.isArray(project.models.medium) && project.models.medium.slice(0, 3).map((m, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded
                    ${
                      {
                        google: 'bg-red-500 text-white',
                        openai: 'bg-emerald-600 text-white',
                        openrouter: 'bg-purple-600 text-white',
                        groq: 'bg-yellow-400 text-black',
                        anthropic: 'bg-orange-500 text-white',
                        deepseek: 'bg-sky-600 text-white',
                        default: 'bg-gray-500 text-white'
                      }[m.provider || 'default']
                    }
                  `}
                >
                  {m.model}
                </span>
              ))}
              {project.models && project.models.medium && project.models.medium.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  +{project.models.medium.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>


      <CardContent className="flex-grow flex flex-col justify-center py-4">
        {project.repositories && project.repositories.length > 0 ? (
          <ul className="space-y-2">
            {project.repositories.map((repo, index) => (
              repo.url && (
                <li key={index}>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md transition-colors"
                  >
                    <Github className="h-4 w-4 text-card-foreground flex-shrink-0" />
                    <span className="text-sm text-card-foreground truncate">
                      {repo.name || repo.url.split('/').filter(Boolean).pop()}
                    </span>
                  </a>
                </li>
              )
            ))}
          </ul>
        ) : (
          <div className="text-center text-sm text-muted">
            No public repositories linked.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={isLoading}
          className="flex items-center gap-2 text-card-foreground group"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              isStarred
                ? 'text-yellow-400'
                : 'text-muted group-hover:text-yellow-300'
            }`}
            fill={isStarred ? 'currentColor' : 'none'}
          />
          <span className="font-medium">{stars}</span>
        </Button>

        <span className="text-sm text-card-foreground">
          {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </span>
      </CardFooter>
    </Card>
  );
};

export default ExploreProjectCard;
