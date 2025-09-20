
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { FinancialGoal } from '../types';
import { useAuth } from './AuthContext';

interface GoalContextType {
  goals: FinancialGoal[];
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'userId'>) => void;
  updateGoal: (goal: FinancialGoal) => void;
  deleteGoal: (id: string) => void;
  loading: boolean;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `wallet_watcher_goals_${user.username}`;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      setLoading(true);
      const storedGoals = localStorage.getItem(storageKey);
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        setGoals([]);
      }
      setLoading(false);
    }
  }, [getStorageKey]);

  const saveGoals = useCallback((updatedGoals: FinancialGoal[]) => {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    }
  }, [getStorageKey]);

  const addGoal = (goal: Omit<FinancialGoal, 'id' | 'userId'>) => {
    if (user) {
      const newGoal: FinancialGoal = {
        ...goal,
        id: new Date().getTime().toString(),
        userId: user.username,
      };
      saveGoals([...goals, newGoal]);
    }
  };

  const updateGoal = (updatedGoal: FinancialGoal) => {
    const updatedGoals = goals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    saveGoals(updatedGoals);
  };

  return (
    <GoalContext.Provider value={{ goals, addGoal, updateGoal, deleteGoal, loading }}>
      {children}
    </GoalContext.Provider>
  );
};

export const useGoals = (): GoalContextType => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};
