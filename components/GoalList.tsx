
import React from 'react';
import type { FinancialGoal } from '../types';
import { useGoals } from '../context/GoalContext';

interface GoalListProps {
  onEdit: (goal: FinancialGoal) => void;
}

const GoalItem: React.FC<{ goal: FinancialGoal, onEdit: (goal: FinancialGoal) => void }> = ({ goal, onEdit }) => {
  const { deleteGoal } = useGoals();
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <div className="p-4 bg-gray-700 rounded-lg mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-white text-lg">{goal.name}</p>
        <div className="flex items-center gap-2">
            <button onClick={() => onEdit(goal)} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>
            <button onClick={() => deleteGoal(goal.id)} className="text-gray-400 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
        <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
      </div>
      <div className="flex justify-between text-sm text-gray-300">
        <span>{formatCurrency(goal.currentAmount)}</span>
        <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
      </div>
       <p className="text-xs text-gray-400 text-right mt-1">
        Target: {new Date(goal.targetDate).toLocaleDateString()}
       </p>
    </div>
  );
};

const GoalList: React.FC<GoalListProps> = ({ onEdit }) => {
  const { goals } = useGoals();
  const sortedGoals = [...goals].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
  
  if (goals.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No financial goals set yet. Add one to get started!</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {sortedGoals.map(goal => (
        <GoalItem key={goal.id} goal={goal} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default GoalList;
