
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface ExpensePieChartProps {
  data: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF6361', '#BC5090', '#58508D'];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    const expenseData = data.filter(t => t.type === TransactionType.EXPENSE);
    if (expenseData.length === 0) return [];
    
    const categoryTotals = expenseData.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No expense data for this month.</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
