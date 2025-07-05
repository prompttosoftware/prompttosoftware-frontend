import React, { useState, useMemo } from 'react';
import { UserUsage } from '@/types/usage';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/app/main/components/LoadingSpinner';
import AddPaymentButton from '@/app/main/components/AddPaymentButton';

import { useAccountUsageData } from '@/hooks/useAccountUsageData';
import { useGlobalErrorStore } from '@/store/globalErrorStore';

interface AccountUsageSectionProps {} // No props needed anymore

const AccountUsageSection: React.FC<AccountUsageSectionProps> = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current'); // 'current' or specific date string
  const { data, isLoading, error } = useAccountUsageData();
  const { setError } = useGlobalErrorStore();

  // Trigger global error modal if there's an error from the hook
  React.useEffect(() => {
    if (error) {
      setError({
        message: 'Failed to retrieve account usage data.',
        description: error.message || 'Please try again later.',
      });
    }
  }, [error, setError]);

  const usageData = data?.usage.usage; // Extract usage data from the response

  const rawHistoricalData = useMemo(() => {
    if (!usageData?.historicalSpending) return [];
    return usageData.historicalSpending
      .map(item => ({
        originalDate: parseISO(item.date),
        amount: item.amount,
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
  }, [usageData]);
  
  const displayedData = useMemo(() => {
    if (!usageData) return [];
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
  }, [usageData, selectedMonth, rawHistoricalData]);

  const currentMonthSpending = usageData?.currentMonthSpending || 0;
  const previousMonthSpending = usageData?.previousMonthSpending || 0;
  const totalBudget = usageData?.totalBudget || 0; // Assuming totalBudget is available

  // Calculate estimated time until budget runs out
  // Calculate estimated time until budget runs out
  const today = new Date();
  const startOfCurrentMonth = startOfMonth(today);
  // Calculate days passed this month
  const daysPassedThisMonth = Math.max(1, Math.floor((today.getTime() - startOfCurrentMonth.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  const dailySpendingRate = currentMonthSpending / daysPassedThisMonth;
  const remainingBudget = totalBudget - currentMonthSpending;
  
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
    if (estimatedDays === Infinity) {
      return "Estimating budget usage..."; // Or "No spending yet this month." if currentMonthSpending is 0
    }
    if (estimatedDays <= 7) { // Less than 7 days remaining
      return <span className="text-orange-500 font-semibold">Budget likely to run out in {Math.ceil(estimatedDays)} day(s)!</span>;
    }
    if (estimatedDays < 30) { // Less than a month remaining
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
      return 'text-gray-500';
    }
  
    const numChange = parseFloat(percentageChange);
  
    if (isNaN(numChange) || numChange === 0) {
      return 'text-gray-500'; // Gray for no change (0% or NaN)
    } else if (numChange > 0) {
      return 'text-red-500'; // Red for increased spending
    } else { // numChange < 0
      return 'text-green-500'; // Green for decreased spending
    }
  }, [percentageChange]);

  const getMonthOptions = useMemo(() => {
    if (!usageData?.historicalSpending) return [];
    const monthMap = new Map<string, string>(); // 'YYYY-MM-01' -> 'Month Year'
    usageData.historicalSpending.forEach(item => {
      const date = parseISO(item.date);
      const startOfMonthlyDate = startOfMonth(date);
      monthMap.set(format(startOfMonthlyDate, 'yyyy-MM-dd'), format(startOfMonthlyDate, 'MMMM yyyy'));
    });
    // Sort months from newest to oldest
    return Array.from(monthMap.entries())
      .sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime());
  }, [usageData]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-5xl mb-6">
        <CardHeader>
          <CardTitle>Account Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }
  
  if (error) { // The global error modal is already triggered by useEffect, this is for inline message
    return (
      <Card className="w-full max-w-5xl mb-6">
        <CardHeader>
          <CardTitle>Account Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-red-500">
          Error loading usage data. Please try again later.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-5xl mb-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Account Usage Statistics</CardTitle>
        <AddPaymentButton />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-lg font-semibold text-gray-700">Current Month Spending:</p>
            <p className="text-2xl font-bold text-gray-900">${currentMonthSpending.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700">Total Budget:</p>
            <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700">Remaining Budget:</p>
            <p className="text-2xl font-bold text-gray-900">${Math.max(0, remainingBudget).toFixed(2)}</p>
          </div>
          <div className="md:col-span-2 lg:col-span-3"> {/* Span full width for this message */}
            <p className="text-lg font-semibold text-gray-700">Budget Status:</p>
            <p className="text-xl font-bold text-gray-900">{budgetStatusMessage}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              vs Previous Month:
            </p>
            <p className={`text-2xl font-bold ${percentageChangeIndicator}`}>
              {percentageChange}
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Select onValueChange={handleMonthChange} value={selectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={displayedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Spending"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No spending data available for this period.
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          *Note: Advertising costs (e.g., Google AdSense) are handled by Payments & Billing and may not be immediately reflected here. This is an estimate for informational purposes.
        </p>
      </CardContent>
    </Card>
  );
};

export default AccountUsageSection;
