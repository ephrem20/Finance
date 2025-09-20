import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useGoals } from '../context/GoalContext';
import { TransactionType, FinancialGoal } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getDateRange = (period: string): [Date, Date] => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (period) {
    case 'this-quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999);
      break;
    }
    case 'last-quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const year = now.getFullYear();
      if (quarter === 0) {
        start = new Date(year - 1, 9, 1);
        end = new Date(year - 1, 12, 0, 23, 59, 59, 999);
      } else {
        start = new Date(year, (quarter - 1) * 3, 1);
        end = new Date(year, quarter * 3, 0, 23, 59, 59, 999);
      }
      break;
    }
    case 'this-year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'last-year':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;
  }
  return [start, end];
};

const GoalReviewItem: React.FC<{goal: FinancialGoal}> = ({ goal }) => {
    const isAchieved = goal.currentAmount >= goal.targetAmount;
    const isPastDue = new Date(goal.targetDate) < new Date();

    let statusText = "In Progress";
    let statusColor = "bg-blue-500";
    if(isAchieved) {
        statusText = "Achieved";
        statusColor = "bg-green-500";
    } else if (isPastDue) {
        statusText = "Missed";
        statusColor = "bg-red-500";
    }

    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-white">{goal.name}</p>
                    <p className="text-xs text-gray-400">Target Date: {new Date(goal.targetDate).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-bold text-white px-2 py-1 rounded-full ${statusColor}`}>{statusText}</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5 my-2">
                <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-300">
                <span>{formatCurrency(goal.currentAmount)}</span>
                <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
            </div>
        </div>
    )
}

const FinancialReview: React.FC = () => {
  const [period, setPeriod] = useState('this-quarter');
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  
  const [startDate, endDate] = useMemo(() => getDateRange(period), [period]);

  const periodTransactions = useMemo(() => transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
  }), [transactions, startDate, endDate]);

  const periodGoals = useMemo(() => goals.filter(g => {
    const gDate = new Date(g.targetDate);
    // Include goals whose target date is within the period
    return gDate >= startDate && gDate <= endDate;
  }), [goals, startDate, endDate]);

  const spendingByCategory = useMemo(() => {
    const expenseData = periodTransactions.filter(t => t.type === TransactionType.EXPENSE);
    if (expenseData.length === 0) return [];
    
    const categoryTotals = expenseData.reduce((acc, transaction) => {
      const category = transaction.category || 'Other';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [periodTransactions]);
  
  const PeriodSelector = () => (
    <div className="flex flex-wrap justify-center gap-2 bg-gray-800 p-2 rounded-lg mb-6">
        {[{id: 'this-quarter', label: 'This Quarter'}, {id: 'last-quarter', label: 'Last Quarter'}, {id: 'this-year', label: 'This Year'}, {id: 'last-year', label: 'Last Year'}].map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${period === p.id ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{p.label}</button>
        ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <PeriodSelector />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-white">Goal Progress</h3>
          {periodGoals.length > 0 ? (
            <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                {periodGoals.map(goal => <GoalReviewItem key={goal.id} goal={goal} />)}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No goals with a target date in this period.</p>
          )}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-white">Spending Breakdown</h3>
           {spendingByCategory.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart data={spendingByCategory} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#E5E7EB" tickFormatter={(value) => `$${Number(value)/1000}k`}/>
                        <YAxis type="category" dataKey="name" stroke="#E5E7EB" width={80} tick={{ fontSize: 12 }} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                            formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                        />
                        <Bar dataKey="value" fill="#7C3AED" name="Spent" />
                    </BarChart>
                </ResponsiveContainer>
             </div>
           ) : (
             <p className="text-center text-gray-500 py-8">No expense data for this period.</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReview;
