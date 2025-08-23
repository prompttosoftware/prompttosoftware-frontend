'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface DashboardHeaderProps {
  userName?: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div className="w-full max-w-7xl mx-auto mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName || 'Developer'}.</p>
        </div>
        <Link href="/new-project" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </Link>
      </div>
    </div>
  );
}
