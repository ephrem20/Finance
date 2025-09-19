
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

interface SpendingTrendChartProps {
  data: Transaction[];
  view: 'monthly' | 'quarterly' | 'yearly';
}

const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data, view }) => {
  const chartData = useMemo(() => {
    const totals: { [key: string]: { revenue: number, expenses: number } } = {};
    
    const getMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const getQuarterKey = (d: Date) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
    const getYearKey = (d: Date) => d.getFullYear().toString();

    data.forEach(transaction => {
      const date = new Date(transaction.date);
      let key: string;

      switch(view) {
        case 'yearly':
          key = getYearKey(date);
          break;
        case 'quarterly':
          key = getQuarterKey(date);
          break;
        case 'monthly':
        default:
          key = getMonthKey(date);
          break;
      }
      
      if (!totals[key]) {
        totals[key] = { revenue: 0, expenses: 0 };
      }
      
      if (transaction.type === TransactionType.REVENUE) {
        totals[key].revenue += transaction.amount;
      } else {
        totals[key].expenses += transaction.amount;
      }
    });

    return Object.keys(totals)
      .sort()
      .slice(-6) // Show last 6 periods
      .map(key => {
        let name: string;
        if (view === 'monthly') {
           name = new Date(key + '-02').toLocaleString('default', { month: 'short', year: '2-digit' });
        } else if (view === 'quarterly') {
          const [year, quarter] = key.split('-');
          name = `${quarter} '${year.slice(2)}`;
        } else { // yearly
          name = key;
        }
        return {
          name,
          Revenue: totals[key].revenue,
          Expenses: totals[key].expenses,
        }
      });
  }, [data, view]);

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
