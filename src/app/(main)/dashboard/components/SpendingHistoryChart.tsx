'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Transaction, TransactionType, TransactionStatus } from '@/types/transactions';
import { formatCurrency } from '@/lib/formatters';

// Define the structure of our processed data points for the chart
interface ChartDataPoint {
  date: string; // Formatted date for display (e.g., 'Aug 17')
  fullDate: Date; // The original Date object for sorting
  debit: number;
  credit: number;
  debitTransactions: Transaction[];
  creditTransactions: Transaction[];
}

interface SpendingHistoryChartProps {
  transactions: Transaction[];
}

// 2. A custom, richer tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data: ChartDataPoint = payload[0].payload;
    const MAX_TOOLTIP_TRANSACTIONS = 10; // Enforce a max for responsiveness

    const allTransactions = [...data.debitTransactions, ...data.creditTransactions];
    const displayedTransactions = allTransactions.slice(0, MAX_TOOLTIP_TRANSACTIONS);
    const remainingCount = allTransactions.length - displayedTransactions.length;

    return (
      <Card className="p-4 shadow-lg bg-background">
        <CardHeader className="p-0 mb-2">
          <CardTitle className="text-sm">{format(data.fullDate, 'MMMM do, yyyy')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-sm">
          {payload.map(pld => (
            <div key={pld.dataKey}>
              {pld.dataKey === 'debit' && data.debit > 0 && (
                <p style={{ color: pld.color }}>
                  Total Debit: {formatCurrency(data.debit)} ({data.debitTransactions.length} txns)
                </p>
              )}
              {pld.dataKey === 'credit' && data.credit > 0 && (
                <p style={{ color: pld.color }}>
                  Total Credit: {formatCurrency(data.credit)} ({data.creditTransactions.length} txns)
                </p>
              )}
            </div>
          ))}

          <div className="mt-2 pt-2 border-t">
            <h4 className="font-semibold mb-1 text-xs">Transactions:</h4>
            {/* FIX: Removed max-h, overflow, and onWheel to disable scrolling */}
            <ul className="text-xs space-y-1">
              {displayedTransactions.map(tx => (
                <li key={tx._id} className="flex justify-between items-center gap-2">
                  <span className="truncate" title={tx.description}>{tx.description}</span>
                  <span className={`flex-shrink-0 ${tx.type === TransactionType.DEBIT ? 'text-destructive' : 'text-green-600'}`}>
                    {tx.type === TransactionType.DEBIT ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
            {remainingCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                ... and {remainingCount} more transaction(s)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

const SpendingHistoryChart: React.FC<SpendingHistoryChartProps> = ({ transactions }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  
  // 3. State for new filters
  const [visibleTypes, setVisibleTypes] = useState<TransactionType[]>([TransactionType.DEBIT, TransactionType.CREDIT]);
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>(TransactionStatus.SUCCEEDED);

  const monthOptions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const monthMap = new Map<string, string>(); // 'YYYY-MM-01' -> 'Month Year'
    transactions.forEach(tx => {
      const startOfMonthlyDate = startOfMonth(parseISO(tx.createdAt));
      monthMap.set(format(startOfMonthlyDate, 'yyyy-MM-dd'), format(startOfMonthlyDate, 'MMMM yyyy'));
    });
    return Array.from(monthMap.entries())
      .sort((a, b) => parseISO(b[0]).getTime() - parseISO(a[0]).getTime());
  }, [transactions]);

  const chartData = useMemo(() => {
    // First, filter transactions based on UI controls
    let filteredTransactions = transactions.filter(tx => {
      // Status filter
      if (selectedStatus as string !== 'all' && tx.status !== selectedStatus) {
        return false;
      }
      // Month filter
      if (selectedMonth !== 'all') {
        const monthStart = selectedMonth === 'current' ? startOfMonth(new Date()) : parseISO(selectedMonth);
        const monthEnd = endOfMonth(monthStart);
        return isWithinInterval(parseISO(tx.createdAt), { start: monthStart, end: monthEnd });
      }
      return true;
    });

    // 1. Aggregate data by day instead of plotting every transaction
    const dailyAggregates = filteredTransactions.reduce<Record<string, ChartDataPoint>>((acc, tx) => {
      const day = format(parseISO(tx.createdAt), 'yyyy-MM-dd');
      
      if (!acc[day]) {
        acc[day] = {
          date: format(parseISO(tx.createdAt), 'MMM dd'),
          fullDate: parseISO(tx.createdAt),
          debit: 0,
          credit: 0,
          debitTransactions: [],
          creditTransactions: [],
        };
      }

      if (tx.type === TransactionType.DEBIT) {
        acc[day].debit += tx.amount;
        acc[day].debitTransactions.push(tx);
      } else if (tx.type === TransactionType.CREDIT) {
        acc[day].credit += tx.amount;
        acc[day].creditTransactions.push(tx);
      }
      
      return acc;
    }, {});

    // Convert the aggregated object into a sorted array for the chart
    return Object.values(dailyAggregates).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());
  }, [transactions, selectedMonth, selectedStatus]);

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <CardTitle>Spending History</CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                    Debit: Funds removed from your balance. Credit: Funds added to your balance.
                </CardDescription>
            </div>
            {/* 3. Filter controls */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
                 <Select onValueChange={(value) => setSelectedStatus(value as TransactionStatus)} value={selectedStatus}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(TransactionStatus).map(status => (
                            <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="current">Current Month</SelectItem>
                        {monthOptions.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                            {label}
                        </SelectItem>
                        ))}
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center space-x-2">
                <Checkbox id="debit" checked={visibleTypes.includes(TransactionType.DEBIT)} onCheckedChange={(checked) => {
                    setVisibleTypes(prev => checked ? [...prev, TransactionType.DEBIT] : prev.filter(t => t !== TransactionType.DEBIT))
                }} />
                <Label htmlFor="debit">Show Debits</Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="credit" checked={visibleTypes.includes(TransactionType.CREDIT)} onCheckedChange={(checked) => {
                    setVisibleTypes(prev => checked ? [...prev, TransactionType.CREDIT] : prev.filter(t => t !== TransactionType.CREDIT))
                }} />
                <Label htmlFor="credit">Show Credits</Label>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96"> {/* Increased height for better visibility */}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                {/* 1. XAxis is now smart, showing one label per day */}
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                {/* 2. Use the custom tooltip */}
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {/* 3. Conditionally render lines based on filters */}
                {visibleTypes.includes(TransactionType.DEBIT) && (
                    <Line type="monotone" name="Debit" dataKey="debit" stroke="hsl(var(--destructive))" dot={true} activeDot={{ r: 6 }} />
                )}
                {visibleTypes.includes(TransactionType.CREDIT) && (
                     <Line type="monotone" name="Credit" dataKey="credit" stroke="hsl(var(--primary))" dot={true} activeDot={{ r: 6 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No transaction data available for the selected filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingHistoryChart;
