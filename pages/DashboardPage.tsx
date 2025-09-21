
import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import MonthSelector from '../components/MonthSelector';
import SummaryCard from '../components/SummaryCard';
import ExpensePieChart from '../components/ExpensePieChart';
import SpendingTrendChart from '../components/SpendingTrendChart';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import GoalList from '../components/GoalList';
import GoalModal from '../components/GoalModal';
import FinancialReview from '../components/FinancialReview';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage'; // New Settings Page
import { useTransactions } from '../context/TransactionContext';
import { useGoals } from '../context/GoalContext';
import { useSettings } from '../context/SettingsContext';
import type { Transaction, FinancialGoal } from '../types';
import { TransactionType } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

const DashboardPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'dashboard' | 'review' | 'reports' | 'settings'>('dashboard');

  // State for transaction modal
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // State for goal modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  const { transactions, loading: transactionsLoading } = useTransactions();
  const { loading: goalsLoading } = useGoals();
  const { monthlyLimit, customCategories, loading: settingsLoading } = useSettings();

  const allCategories = useMemo(() => {
    return [...new Set([...EXPENSE_CATEGORIES, ...customCategories])].sort();
  }, [customCategories]);

  // State for filtering and sorting
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentDate.getFullYear() &&
             transactionDate.getMonth() === currentDate.getMonth();
    });
  }, [transactions, currentDate]);

  const displayedTransactions = useMemo(() => {
    const baseTransactions = (dateRange.start && dateRange.end)
      ? transactions.filter(t => {
          const transactionDate = new Date(t.date).getTime();
          const startDate = new Date(dateRange.start).getTime();
          // Add 1 day to end date to include the full day
          const endDate = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000 - 1);
          return transactionDate >= startDate && transactionDate <= endDate;
        })
      : monthlyTransactions;
    
    let filtered = baseTransactions.filter(t => {
      if (filterType !== 'ALL' && t.type !== filterType) {
        return false;
      }
      if (filterType === TransactionType.EXPENSE && filterCategory !== 'ALL' && t.category !== filterCategory) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let valA, valB;
      switch (sortConfig.key) {
        case 'description':
          valA = a.description.toLowerCase();
          valB = b.description.toLowerCase();
          break;
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        case 'date':
        default:
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
          break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, monthlyTransactions, dateRange, filterType, filterCategory, sortConfig]);

  const totalRevenue = useMemo(() => monthlyTransactions
    .filter(t => t.type === TransactionType.REVENUE)
    .reduce((sum, t) => sum + t.amount, 0), [monthlyTransactions]);

  const totalExpenses = useMemo(() => monthlyTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0), [monthlyTransactions]);

  const netSavings = totalRevenue - totalExpenses;

  // Handlers for Transaction Modal
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };
  
  const handleAddNewTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  // Handlers for Goal Modal
  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };
  
  const handleAddNewGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const loading = transactionsLoading || goalsLoading || settingsLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-3xl font-bold text-white">
            {view === 'dashboard' ? 'Monthly Dashboard' : view === 'review' ? 'Financial Review' : view === 'reports' ? 'Custom Reports' : 'Settings'}
          </h2>
           <button
            onClick={handleAddNewTransaction}
            className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-75 transition-colors duration-300"
          >
            + Add Transaction
          </button>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 p-1 rounded-lg flex space-x-1 flex-wrap justify-center">
            <button onClick={() => setView('dashboard')} className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'dashboard' ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Dashboard</button>
            <button onClick={() => setView('review')} className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'review' ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Review</button>
            <button onClick={() => setView('reports')} className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'reports' ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Reports</button>
            <button onClick={() => setView('settings')} className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${view === 'settings' ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Settings</button>
          </div>
        </div>

        {loading ? <p className="text-center">Loading data...</p> : (
          <>
            {view === 'dashboard' ? (
              <>
                <div className="mb-6"><MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <SummaryCard title="Total Revenue" amount={totalRevenue} color="text-green-400" />
                  <SummaryCard title="Total Expenses" amount={totalExpenses} color="text-red-400" limit={monthlyLimit} />
                  <SummaryCard title="Net Savings" amount={netSavings} color={netSavings >= 0 ? 'text-blue-400' : 'text-yellow-400'} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                  <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-white">Expenses by Category</h3>
                    <ExpensePieChart data={monthlyTransactions} />
                  </div>
                  <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-white">Monthly Trends</h3>
                    <SpendingTrendChart data={transactions} />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-white">Transactions</h3>
                    {/* Filter and Sort Controls */}
                    <div className="p-4 bg-gray-700 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-400">Date Range</label>
                          <div className="flex gap-2">
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="w-full bg-gray-800 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="w-full bg-gray-800 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
                          </div>
                           {(dateRange.start || dateRange.end) && <button onClick={() => setDateRange({start: '', end: ''})} className="text-xs text-brand-secondary hover:underline mt-1">Clear</button>}
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-gray-400">Type</label>
                           <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-gray-800 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary">
                              <option value="ALL">All</option>
                              <option value={TransactionType.REVENUE}>Revenue</option>
                              <option value={TransactionType.EXPENSE}>Expense</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-gray-400">Category</label>
                           <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} disabled={filterType !== TransactionType.EXPENSE} className="w-full bg-gray-800 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50">
                              <option value="ALL">All</option>
                              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                         <div>
                          <label className="text-xs font-semibold text-gray-400">Sort By</label>
                          <div className="flex gap-2">
                             <select value={sortConfig.key} onChange={e => handleSort(e.target.value)} className="w-full bg-gray-800 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary">
                               <option value="date">Date</option>
                               <option value="amount">Amount</option>
                               <option value="description">Description</option>
                             </select>
                            <button onClick={() => setSortConfig(c => ({...c, direction: c.direction === 'asc' ? 'desc' : 'asc'}))} className="p-2 bg-gray-800 rounded-md border border-gray-600">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <TransactionList transactions={displayedTransactions} onEdit={handleEditTransaction} />
                  </div>
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Financial Goals</h3>
                        <button onClick={handleAddNewGoal} className="px-3 py-1.5 text-sm bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-75 transition-colors duration-300">+ Add Goal</button>
                    </div>
                    <GoalList onEdit={handleEditGoal} />
                  </div>
                </div>
              </>
            ) : view === 'review' ? (
              <FinancialReview />
            ) : view === 'reports' ? (
              <ReportsPage />
            ) : (
              <SettingsPage />
            )}
          </>
        )}
      </main>
      <TransactionModal isOpen={isTransactionModalOpen} onClose={handleCloseTransactionModal} transaction={editingTransaction} />
      <GoalModal isOpen={isGoalModalOpen} onClose={handleCloseGoalModal} goal={editingGoal} />
    </div>
  );
};

export default DashboardPage;
