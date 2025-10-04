'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BrainCircuit } from 'lucide-react';

interface ReasoningProps {
  reasoning: string;
}

const Reasoning: React.FC<ReasoningProps> = ({ reasoning }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="reasoning" className="border-b-0">
        <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Show Reasoning
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="prose prose-sm max-w-none rounded-md border bg-muted/50 p-4 dark:prose-invert">
            <pre className="whitespace-pre-wrap bg-transparent p-0 text-foreground">
                <code className="text-foreground">{reasoning}</code>
            </pre>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Reasoning;
