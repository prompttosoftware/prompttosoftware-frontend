'use-client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Node } from '@/types/analysis';

interface NodeDetailModalProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailSection = ({ title, items }: { title: string; items?: string[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <h4 className="font-semibold text-card-foreground mb-2">{title}</h4>
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const DependencySection = ({ title, items }: { title: string; items?: string[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <h4 className="font-semibold text-card-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge key={index} variant="secondary">{item}</Badge>
        ))}
      </div>
    </div>
  );
};

const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ node, isOpen, onClose }) => {
  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="break-all">{node.name}</DialogTitle>
          {node.description && (
            <DialogDescription className="pt-2">{node.description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Scrollable section */}
        <div className="pr-4 mt-2 flex-1">
          <DependencySection title="Internal Dependencies" items={node.internalDependencies} />
          <DependencySection title="External Dependencies" items={node.externalDependencies} />
          <DetailSection title="Potential Bugs" items={node.potentialBugs} />
          <DetailSection title="Style Issues" items={node.styleIssues} />
          <DetailSection title="Security Concerns" items={node.securityConcerns} />
          <DetailSection title="Incomplete Code" items={node.incompleteCode} />
          <DetailSection title="Performance Concerns" items={node.performanceConcerns} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NodeDetailModal;
