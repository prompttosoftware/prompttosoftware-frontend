'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddPaymentButton from '@/app/(main)/components/AddPaymentButton';
import { Transaction } from '@/types/transactions';
import SkeletonLoader from '../../components/SkeletonLoader';

// Helper function to calculate spending
const calculateSpending = (transactions: any[], startDate: Date, endDate: Date): number => {
  return transactions
    .filter(tx => {
      const txDate = new Date(tx.createdAt);
      return txDate >= startDate && txDate <= endDate;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
};

const AccountUsageSectionSkeleton: React.FC = () => {
  return (
    <Card className="w-full max-w-5xl mb-6 bg-card rounded-lg shadow-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <SkeletonLoader width="w-1/3" height="h-8" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Stats Skeletons */}
          {[...Array(3)].map((_, i) => (
            <div key={`stat-${i}`}>
              <SkeletonLoader width="w-1/2" height="h-6" className="mb-2" />
              <SkeletonLoader width="w-1/3" height="h-8" />
            </div>
          ))}
          <div className="md:col-span-2 lg:col-span-3">
              <SkeletonLoader width="w-1/2" height="h-6" className="mb-2" />
              <SkeletonLoader width="w-1/3" height="h-8" />
          </div>
           <div>
              <SkeletonLoader width="w-1/2" height="h-6" className="mb-2" />
              <SkeletonLoader width="w-1/3" height="h-8" />
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <SkeletonLoader width="w-[180px]" height="h-10" />
        </div>

        <div className="w-full h-80">
          <SkeletonLoader width="w-full" height="h-full" />
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          <SkeletonLoader width="w-2/3" height="h-4" className="mx-auto" />
        </p>
      </CardContent>
    </Card>
  );
};

interface AccountUsageSectionProps {
  transactions: Transaction[];
  balance?: number;
}

const AccountUsageSection: React.FC<AccountUsageSectionProps> = ({ transactions, balance }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');

  if (balance === undefined) {
    return <AccountUsageSectionSkeleton />;
  }
  
  const usageData = useMemo(() => {

    const spendingHistory = transactions
      .filter(tx => tx.type === 'debit' && tx.status === 'succeeded')
      .map(tx => ({
        amount: tx.amount,
        originalDate: parseISO(tx.createdAt),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfPreviousMonth = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const endOfPreviousMonth = endOfMonth(startOfPreviousMonth);

    const currentMonthSpending = calculateSpending(spendingHistory, startOfCurrentMonth, now);
    const previousMonthSpending = calculateSpending(spendingHistory, startOfPreviousMonth, endOfPreviousMonth);

    const remainingBudget = balance;
    const totalBudget = remainingBudget + currentMonthSpending;

    return {
      currentMonthSpending,
      previousMonthSpending,
      totalBudget,
      remainingBudget,
      historicalSpending: spendingHistory,
    };
  }, [transactions, balance]);

  const {
    historicalSpending: rawHistoricalData = [],
    currentMonthSpending = 0,
    previousMonthSpending = 0,
    totalBudget = 0,
    remainingBudget = 0
  } = usageData;
    const displayedData = useMemo(() => {
    let filteredData = rawHistoricalData;
  
    if (selectedMonth === 'current') {
      const currentMonthStart = startOfMonth(new Date());
      filteredData = rawHistoricalData.filter(item =>
        item.originalDate.getMonth() === currentMonthStart.getMonth() &&
        item.originalDate.getFullYear() === currentMonthStart.getFullYear()
      );
    } else {
      const selectedMonthStart = parseISO(selectedMonth); // selectedMonth is 'YYYY-MM-DD'
      filteredData = rawHistoricalData.filter(item =>
        item.originalDate.getMonth() === selectedMonthStart.getMonth() &&
        item.originalDate.getFullYear() === selectedMonthStart.getFullYear()
      );
    }
  
    return filteredData.map(item => ({
      date: format(item.originalDate, 'MMM dd'), // Format for display on XAxis
      amount: item.amount
    }));
  }, [selectedMonth, rawHistoricalData]);


  // Calculate estimated time until budget runs out
  const today = new Date();
  const startOfCurrentMonth = startOfMonth(today);
  const daysPassedThisMonth = Math.max(1, Math.floor((today.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  const dailySpendingRate = currentMonthSpending / daysPassedThisMonth;
  
  let estimatedDays = Infinity;
  if (dailySpendingRate > 0) {
    estimatedDays = remainingBudget / dailySpendingRate;
  }
  
  const budgetStatusMessage = (() => {
    if (totalBudget <= 0) {
      return "No budget set.";
    }
    if (remainingBudget <= 0) {
      return <span className="text-red-600 font-semibold">Budget depleted for this month.</span>;
    }
    if (dailySpendingRate === 0 && currentMonthSpending === 0) {
        return "No spending yet this month."
    }
    if (estimatedDays === Infinity) {
      return "Estimating budget usage...";
    }
    if (estimatedDays <= 7) {
      return <span className="text-orange-500 font-semibold">Budget likely to run out in {Math.ceil(estimatedDays)} day(s)!</span>;
    }
    if (estimatedDays < 30) {
      return `Estimated budget remaining for ${Math.ceil(estimatedDays)} day(s).`;
    }
    return `Estimated budget remaining for over ${Math.floor(estimatedDays / 30)} month(s).`;
  })();
  
  const percentageChange = (() => {
    if (previousMonthSpending === 0) {
      return currentMonthSpending > 0 ? 'N/A (No previous spending)' : '0%';
    }
    const change = ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  })();
  
  const percentageChangeIndicator = useMemo(() => {
    if (typeof percentageChange !== 'string' || percentageChange.includes('N/A')) {
      return 'text-card-foreground';
    }
    const numChange = parseFloat(percentageChange);
    if (isNaN(numChange) || numChange === 0) {
      return 'text-card-foreground';
    } else if (numChange > 0) {
      return 'text-red-500';
    } else {
      return 'text-green-500';
    }
  }, [percentageChange]);

  const getMonthOptions = useMemo(() => {
    if (!rawHistoricalData || rawHistoricalData.length === 0) return [];
    const monthMap = new Map<string, string>(); // 'YYYY-MM-01' -> 'Month Year'
    rawHistoricalData.forEach(item => {
      const startOfMonthlyDate = startOfMonth(item.originalDate);
      monthMap.set(format(startOfMonthlyDate, 'yyyy-MM-dd'), format(startOfMonthlyDate, 'MMMM yyyy'));
    });
    // Sort months from newest to oldest
    return Array.from(monthMap.entries())
      .sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime());
  }, [rawHistoricalData]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  return (
    <Card className="w-full max-w-5xl mb-6 bg-card rounded-lg shadow-md">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Account Usage Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-lg font-semibold text-card-foreground">Current Month Spending:</p>
            <p className="text-2xl font-bold text-card-foreground">${currentMonthSpending.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-card-foreground">Total Budget:</p>
            <p className="text-2xl font-bold text-card-foreground">${totalBudget.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-card-foreground">Remaining Budget:</p>
            <p className="text-2xl font-bold text-card-foreground">${Math.max(0, remainingBudget).toFixed(2)}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <p className="text-lg font-semibold text-card-foreground">Budget Status:</p>
            <p className="text-xl font-bold text-card-foreground">{budgetStatusMessage}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-card-foreground">
              vs Previous Month:
            </p>
            <p className={`text-2xl font-bold ${percentageChangeIndicator}`}>
              {percentageChange}
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Select onValueChange={handleMonthChange} value={selectedMonth}>
            <SelectTrigger className="w-[180px] btn-secondary">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="col-span-3 block w-full rounded-md shadow-sm focus:ring sm:text-sm p-2">
              <SelectItem value="current">Current Month</SelectItem>
              {getMonthOptions.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full h-80">
          {displayedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className={"text-card-foreground"}>
              <LineChart
                data={displayedData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-line)" />
                <XAxis dataKey="date" stroke="var(--chart-line)" tick={{ fill: 'var(--chart-line)' }} />
                <YAxis stroke="var(--chart-line)" tick={{ fill: 'var(--chart-line)' }} />
                <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`} 
                wrapperStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '20px' }}
                contentStyle={{ background: 'var(--popover)', color: 'var(--popover-foreground)' }}
                />
                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--chart-line)"
                    activeDot={{ r: 8 }}
                    name="Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-card-foreground">
              No spending data available for this period.
            </div>
          )}
        </div>
        <p className="text-sm text-card-foreground mt-4 text-center">
          *Note: This data is derived from your transaction history for informational purposes.
        </p>
      </CardContent>
    </Card>
  );
};

export default AccountUsageSection;
