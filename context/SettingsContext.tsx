
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  monthlyLimit: number;
  setMonthlyLimit: (limit: number) => void;
  customCategories: string[];
  addCustomCategory: (category: string) => void;
  deleteCustomCategory: (category: string) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [monthlyLimit, setMonthlyLimitState] = useState<number>(0);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getStorageKey = useCallback((key: string) => {
    if (!user) return null;
    return `wallet_watcher_settings_${user.username}_${key}`;
  }, [user]);

  useEffect(() => {
    const limitKey = getStorageKey('monthlyLimit');
    const categoriesKey = getStorageKey('customCategories');
    if (limitKey && categoriesKey) {
      setLoading(true);
      const storedLimit = localStorage.getItem(limitKey);
      const storedCategories = localStorage.getItem(categoriesKey);
      
      setMonthlyLimitState(storedLimit ? JSON.parse(storedLimit) : 0);
      setCustomCategories(storedCategories ? JSON.parse(storedCategories) : []);
      
      setLoading(false);
    }
  }, [getStorageKey]);

  const setMonthlyLimit = (limit: number) => {
    const limitKey = getStorageKey('monthlyLimit');
    if (limitKey) {
      localStorage.setItem(limitKey, JSON.stringify(limit));
      setMonthlyLimitState(limit);
    }
  };

  const addCustomCategory = (category: string) => {
    const categoriesKey = getStorageKey('customCategories');
    if (categoriesKey) {
      const updatedCategories = [...new Set([...customCategories, category])];
      localStorage.setItem(categoriesKey, JSON.stringify(updatedCategories));
      setCustomCategories(updatedCategories);
    }
  };

  const deleteCustomCategory = (categoryToDelete: string) => {
     const categoriesKey = getStorageKey('customCategories');
     if (categoriesKey) {
       const updatedCategories = customCategories.filter(c => c !== categoryToDelete);
       localStorage.setItem(categoriesKey, JSON.stringify(updatedCategories));
       setCustomCategories(updatedCategories);
     }
  };


  return (
    <SettingsContext.Provider value={{ monthlyLimit, setMonthlyLimit, customCategories, addCustomCategory, deleteCustomCategory, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
