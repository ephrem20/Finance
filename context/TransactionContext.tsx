
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `wallet_watcher_transactions_${user.username}`;
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      setLoading(true);
      const storedTransactions = localStorage.getItem(storageKey);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions([]);
      }
      setLoading(false);
    }
  }, [getStorageKey]);

  const saveTransactions = useCallback((updatedTransactions: Transaction[]) => {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updatedTransactions));
      setTransactions(updatedTransactions);
    }
  }, [getStorageKey]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (user) {
      const newTransaction: Transaction = {
        ...transaction,
        id: new Date().getTime().toString(),
        userId: user.username,
      };
      saveTransactions([...transactions, newTransaction]);
    }
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const updatedTransactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    saveTransactions(updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    saveTransactions(updatedTransactions);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, loading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
