'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/transactions';

interface SpendingHistoryChartProps {
  transactions: Transaction[];
}

const SpendingHistoryChart: React.FC<SpendingHistoryChartProps> = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  
  const rawHistoricalData = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'debit' && tx.status === 'succeeded')
      .map(tx => ({
        amount: tx.amount,
        originalDate: parseISO(tx.createdAt),
      }))
      .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
  }, [transactions]);

  const displayedData = useMemo(() => {
    let filteredData = rawHistoricalData;
  
    if (selectedMonth !== 'all') {
      const monthStart = selectedMonth === 'current' ? startOfMonth(new Date()) : parseISO(selectedMonth);
      filteredData = rawHistoricalData.filter(item =>
        item.originalDate.getMonth() === monthStart.getMonth() &&
        item.originalDate.getFullYear() === monthStart.getFullYear()
      );
    }
  
    return filteredData.map(item => ({
      date: format(item.originalDate, 'MMM dd'),
      amount: item.amount
    }));
  }, [selectedMonth, rawHistoricalData]);
  
  const getMonthOptions = useMemo(() => {
    if (!rawHistoricalData || rawHistoricalData.length === 0) return [];
    const monthMap = new Map<string, string>(); // 'YYYY-MM-01' -> 'Month Year'
    rawHistoricalData.forEach(item => {
      const startOfMonthlyDate = startOfMonth(item.originalDate);
      monthMap.set(format(startOfMonthlyDate, 'yyyy-MM-dd'), format(startOfMonthlyDate, 'MMMM yyyy'));
    });
    return Array.from(monthMap.entries())
      .sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime());
  }, [rawHistoricalData]);

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Detailed Spending History</CardTitle>
        <Select onValueChange={setSelectedMonth} value={selectedMonth}>
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
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          {displayedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--popover))', 
                    color: 'hsl(var(--popover-foreground))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Spend']}
                />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No spending data available for this period.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingHistoryChart;
