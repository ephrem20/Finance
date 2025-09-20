
import React, { useState, useEffect, FormEvent } from 'react';
import type { FinancialGoal } from '../types';
import { useGoals } from '../context/GoalContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const { addGoal, updateGoal } = useGoals();

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setCurrentAmount(String(goal.currentAmount));
      setTargetDate(new Date(goal.targetDate).toISOString().split('T')[0]);
    } else {
      // Reset form
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate(new Date().toISOString().split('T')[0]);
    }
  }, [goal, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const goalData = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: new Date(targetDate).toISOString(),
    };

    if (goal) {
      updateGoal({ ...goal, ...goalData });
    } else {
      addGoal(goalData);
    }
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">{goal ? 'Edit' : 'Add'} Financial Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Goal Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., New Car" required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Target Amount</label>
            <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="20000" required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Current Amount</label>
            <input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="5000" required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">{goal ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
