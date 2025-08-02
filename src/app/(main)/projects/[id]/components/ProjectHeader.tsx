'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil } from 'lucide-react';
import Link from 'next/link';

interface ProjectHeaderProps {
  name: string;
  projectId: string;
  onDeleteClick: () => void;
}

const ProjectHeader = ({ name, projectId, onDeleteClick }: ProjectHeaderProps) => (
  <div className="flex justify-between items-start mb-4">
    <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
    <div className="flex items-center space-x-2"> {/* Group the edit button and dropdown */}
        {/* EDIT BUTTON */}
        <Link href={`/projects/${projectId??'loading'}/edit`} passHref>
        <Button size="sm">
            <Pencil className="mr-2 h-4 w-4" />
        </Button>
        </Link>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem
            onClick={onDeleteClick}
            >
            Delete Project
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
    </div>
);

export default ProjectHeader;
