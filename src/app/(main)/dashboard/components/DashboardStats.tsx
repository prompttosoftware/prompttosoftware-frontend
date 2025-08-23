'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletCards, TrendingUp, Server, ShieldCheck, ShieldAlert } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card className='border'>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface DashboardStatsProps {
  balance: number;
  currentMonthSpending: number;
  activeProjectsCount: number;
  accountStatus: 'healthy' | 'suspended';
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function DashboardStats({
  balance,
  currentMonthSpending,
  activeProjectsCount,
  accountStatus,
}: DashboardStatsProps) {

  const isHealthy = accountStatus === 'healthy';

  return (
    <div className="w-full max-w-7xl mx-auto mb-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={formatCurrency(balance)}
          icon={<WalletCards className="h-4 w-4" />}
          description="Available credits to run projects."
        />
        <StatCard
          title="Month-to-Date Spend"
          value={formatCurrency(currentMonthSpending)}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Total cost of projects this month."
        />
        <StatCard
          title="Active Projects"
          value={String(activeProjectsCount)}
          icon={<Server className="h-4 w-4" />}
          description="Projects currently running, starting, or stopping."
        />
        <StatCard
          title="Account Status"
          value={isHealthy ? 'Healthy' : 'Suspended'}
          icon={isHealthy 
            ? <ShieldCheck className="h-4 w-4 text-green-500" /> 
            : <ShieldAlert className="h-4 w-4 text-red-500" />
          }
          description={isHealthy ? 'Your account is in good standing.' : 'Please resolve account issues.'}
        />
      </div>
    </div>
  );
}
