
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { useSettings } from '../context/SettingsContext';
import { EXPENSE_CATEGORIES } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { addTransaction, updateTransaction } = useTransactions();
  const { customCategories } = useSettings();

  const allCategories = useMemo(() => {
    return [...new Set([...EXPENSE_CATEGORIES, ...customCategories])].sort();
  }, [customCategories]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
      setCategory(transaction.category);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
    } else {
      // Reset form
      setType(TransactionType.EXPENSE);
      setAmount('');
      setDescription('');
      setCategory(allCategories[0] || '');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transaction, isOpen, allCategories]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      category: type === TransactionType.EXPENSE ? category : 'Revenue',
      date: new Date(date).toISOString(),
    };

    if (transaction) {
      updateTransaction({ ...transaction, ...transactionData });
    } else {
      addTransaction(transactionData);
    }
    onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">{transaction ? 'Edit' : 'Add'} Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value as TransactionType)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary">
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.REVENUE}>Revenue</option>
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Groceries" required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          {type === TransactionType.EXPENSE && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary">
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          )}
           <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">{transaction ? 'Update' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
