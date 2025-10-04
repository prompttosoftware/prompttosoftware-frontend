'use client';

import React, { useState } from 'react';
import { Node } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ChevronDown, ChevronRight, Component, Bug, Code, Palette, Shield, Zap } from 'lucide-react';
import SkeletonLoader from '@/app/(main)/components/SkeletonLoader';
import { Status } from '@/types/project';

const IssueBadge = ({ icon, count, className }: { icon: React.ReactNode; count: number; className?: string }) => {
  if (!count || count === 0) return null;
  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${className}`}>
      {icon}
      <span>{count}</span>
    </div>
  );
};

interface TreeNodeProps {
  node: Node;
  onNodeClick: (node: Node) => void;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onNodeClick, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isContainer = node.isContainer && node.children && node.children.length > 0;

  const handleToggle = () => {
    if (isContainer) {
      setIsOpen(!isOpen);
    }
  };

  const handleNodeClick = () => {
    onNodeClick(node);
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={handleNodeClick}
      >
        {/* Left side: Icons and Name */}
        <div className="flex items-center min-w-0">
          {isContainer ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleToggle(); }} />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleToggle(); }} />
            )
          ) : (
            <div className="w-6 mr-2"></div> // Placeholder for alignment
          )}

          {isContainer ? (
            <Component className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
          ) : (
            <FileText className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>

        {/* Right side: Issue Badges (only for leaf nodes) */}
        {!isContainer && (
            <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                <IssueBadge 
                    icon={<Bug className="h-3.5 w-3.5" />} 
                    count={node.potentialBugs?.length || 0}
                    className="text-destructive"
                />
                <IssueBadge 
                    icon={<Palette className="h-3.5 w-3.5" />} 
                    count={node.styleIssues?.length || 0}
                    className="text-yellow-500"
                />
                <IssueBadge 
                    icon={<Shield className="h-3.5 w-3.5" />} 
                    count={node.securityConcerns?.length || 0}
                    className="text-red-600"
                />
                 <IssueBadge 
                    icon={<Code className="h-3.5 w-3.5" />} 
                    count={node.incompleteCode?.length || 0}
                    className="text-blue-500"
                />
                <IssueBadge 
                    icon={<Zap className="h-3.5 w-3.5" />} 
                    count={node.performanceConcerns?.length || 0}
                    className="text-green-500"
                />
            </div>
        )}
      </div>

      {isContainer && isOpen && (
        <div>
          {node.children?.map((child) => (
            <TreeNode key={child.name} node={child} onNodeClick={onNodeClick} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};


interface DescriptionTreeProps {
  nodes: Node[];
  onNodeClick: (node: Node) => void;
  status: Status;
}

const DescriptionTree: React.FC<DescriptionTreeProps> = ({ nodes, onNodeClick, status }) => {
  const isActive = status === 'pending' || status === 'running' || status === 'starting';
  const showLoadingState = isActive && (!nodes || nodes.length === 0);

  return (
    <Card className="h-full border">
      <CardHeader>
        <CardTitle>File Descriptions</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto">
        {showLoadingState ? (
          <div className="space-y-2 w-full overflow-hidden">
            <SkeletonLoader className="h-8 w-4/6" />
            <SkeletonLoader className="h-8 w-4/5 ml-4" />
            <SkeletonLoader className="h-8 w-5/6 ml-8" />
            <SkeletonLoader className="h-8 w-4/5 ml-4" />
            <SkeletonLoader className="h-8 w-4/6" />
          </div>
        ) : !nodes || nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No descriptions available.</p>
        ) : (
          nodes.map((node) => <TreeNode key={node.name} node={node} onNodeClick={onNodeClick} level={0} />)
        )}
      </CardContent>
    </Card>
  );
};

export default DescriptionTree;
