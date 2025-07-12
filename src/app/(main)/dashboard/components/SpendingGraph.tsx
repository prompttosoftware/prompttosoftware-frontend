'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AccountUsage } from '@/types/usage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SpendingGraphProps {
  historicalSpending: AccountUsage['historicalSpending'];
}

const SpendingGraph: React.FC<SpendingGraphProps> = ({ historicalSpending }) => {
  // Sort historical spending data by date in ascending order
  const sortedHistoricalSpending = useMemo(() => {
    return [...historicalSpending].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historicalSpending]);

  // Extract unique months from historical data for selection
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    sortedHistoricalSpending.forEach(data => {
      monthSet.add(new Date(data.date).toLocaleString('default', { year: 'numeric', month: 'long' }));
    });
    return Array.from(monthSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [sortedHistoricalSpending]);

  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);

  // Set initial selected month to the latest month available
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const dataForGraph = useMemo(() => {
    if (!selectedMonth) {
      return [];
    }
    return sortedHistoricalSpending.filter(data => {
      const date = new Date(data.date);
      const monthYear = date.toLocaleString('default', { year: 'numeric', month: 'long' });
      return monthYear === selectedMonth;
    });
  }, [sortedHistoricalSpending, selectedMonth]);

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Spending Graph</h3>
        <Select onValueChange={setSelectedMonth} value={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {availableMonths.map(month => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={dataForGraph}
          margin={{
            top: 5,
            right: 20,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric' })}
            padding={{ left: 10, right: 10 }}
            stroke="#6b7280"
            tick={{ fill: '#6b7280' }}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            stroke="#6b7280"
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spending']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            wrapperClassName="rounded-md shadow-lg"
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', borderRadius: '0.375rem' }}
            labelStyle={{ color: '#1f2937' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingGraph;
