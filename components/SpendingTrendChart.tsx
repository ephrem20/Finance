
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

interface SpendingTrendChartProps {
  data: Transaction[];
}

const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const monthlyTotals: { [key: string]: { revenue: number, expenses: number } } = {};
    
    data.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { revenue: 0, expenses: 0 };
      }
      
      if (transaction.type === TransactionType.REVENUE) {
        monthlyTotals[monthKey].revenue += transaction.amount;
      } else {
        monthlyTotals[monthKey].expenses += transaction.amount;
      }
    });

    return Object.keys(monthlyTotals)
      .sort()
      .slice(-6) // Show last 6 months
      .map(key => ({
        name: new Date(key + '-02').toLocaleString('default', { month: 'short', year: '2-digit' }),
        Revenue: monthlyTotals[key].revenue,
        Expenses: monthlyTotals[key].expenses,
      }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Not enough data for trend analysis.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#E5E7EB" />
          <YAxis stroke="#E5E7EB" tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip 
             contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
             formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
          />
          <Legend />
          <Bar dataKey="Revenue" fill="#22c55e" />
          <Bar dataKey="Expenses" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingTrendChart;
