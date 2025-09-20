import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import PeriodSelector from '../components/PeriodSelector';
import SummaryCard from '../components/SummaryCard';
import ExpensePieChart from '../components/ExpensePieChart';
import SpendingTrendChart from '../components/SpendingTrendChart';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import AccountModal from '../components/AccountModal';
import AIAssistantModal from '../components/AIAssistantModal'; // Import AI Modal
import { useTransactions } from '../context/TransactionContext';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

const DashboardPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false); // State for AI Modal
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { transactions, loading } = useTransactions();

  const periodTransactions = useMemo(() => {
    const getQuarter = (d: Date) => Math.floor(d.getMonth() / 3);

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionYear = transactionDate.getFullYear();
      const currentYear = currentDate.getFullYear();

      if (view === 'yearly') {
        return transactionYear === currentYear;
      }

      if (view === 'quarterly') {
        const transactionQuarter = getQuarter(transactionDate);
        const currentQuarter = getQuarter(currentDate);
        return transactionYear === currentYear && transactionQuarter === currentQuarter;
      }

      // monthly is the default
      const transactionMonth = transactionDate.getMonth();
      const currentMonth = currentDate.getMonth();
      return transactionYear === currentYear && transactionMonth === currentMonth;
    });
  }, [transactions, currentDate, view]);

  const totalRevenue = useMemo(() => periodTransactions
    .filter(t => t.type === TransactionType.REVENUE)
    .reduce((sum, t) => sum + t.amount, 0), [periodTransactions]);

  const totalExpenses = useMemo(() => periodTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0), [periodTransactions]);

  const netSavings = totalRevenue - totalExpenses;

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  };
  
  const handleOpenAccountModal = () => setIsAccountModalOpen(true);
  const handleCloseAccountModal = () => setIsAccountModalOpen(false);
  
  const handleOpenAIModal = () => setIsAIModalOpen(true);
  const handleCloseAIModal = () => setIsAIModalOpen(false);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header onOpenAccountModal={handleOpenAccountModal} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <PeriodSelector 
            currentDate={currentDate} 
            onDateChange={setCurrentDate}
            view={view}
            onViewChange={setView}
          />
          <div className="flex gap-2 w-full sm:w-auto">
             <button
                onClick={handleOpenAIModal}
                className="w-full sm:w-auto px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg shadow-md hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-colors duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" /></svg>
                Ask AI
              </button>
             <button
                onClick={handleAddNew}
                className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-colors duration-300"
              >
                + Add Transaction
              </button>
          </div>
        </div>

        {loading ? <p className="text-center">Loading data...</p> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <SummaryCard title="Total Revenue" amount={totalRevenue} color="text-green-400" />
              <SummaryCard title="Total Expenses" amount={totalExpenses} color="text-red-400" />
              <SummaryCard title="Net Savings" amount={netSavings} color={netSavings >= 0 ? 'text-blue-400' : 'text-yellow-400'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
              <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Expenses by Category</h3>
                <ExpensePieChart data={periodTransactions} />
              </div>
              <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Historical Trends</h3>
                <SpendingTrendChart data={transactions} view={view} />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-white">Transactions</h3>
              <TransactionList transactions={periodTransactions} onEdit={handleEdit} />
            </div>
          </>
        )}
      </main>
      <TransactionModal isOpen={isTransactionModalOpen} onClose={handleCloseTransactionModal} transaction={editingTransaction} />
      <AccountModal isOpen={isAccountModalOpen} onClose={handleCloseAccountModal} />
      <AIAssistantModal isOpen={isAIModalOpen} onClose={handleCloseAIModal} transactions={periodTransactions} />
    </div>
  );
};

export default DashboardPage;
