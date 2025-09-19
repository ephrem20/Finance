
import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import MonthSelector from '../components/MonthSelector';
import SummaryCard from '../components/SummaryCard';
import ExpensePieChart from '../components/ExpensePieChart';
import SpendingTrendChart from '../components/SpendingTrendChart';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import { useTransactions } from '../context/TransactionContext';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

const DashboardPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { transactions, loading } = useTransactions();

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentDate.getFullYear() &&
             transactionDate.getMonth() === currentDate.getMonth();
    });
  }, [transactions, currentDate]);

  const totalRevenue = useMemo(() => monthlyTransactions
    .filter(t => t.type === TransactionType.REVENUE)
    .reduce((sum, t) => sum + t.amount, 0), [monthlyTransactions]);

  const totalExpenses = useMemo(() => monthlyTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0), [monthlyTransactions]);

  const netSavings = totalRevenue - totalExpenses;

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />
           <button
            onClick={handleAddNew}
            className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-75 transition-colors duration-300"
          >
            + Add Transaction
          </button>
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
                <ExpensePieChart data={monthlyTransactions} />
              </div>
              <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Monthly Trends</h3>
                <SpendingTrendChart data={transactions} />
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-white">Recent Transactions</h3>
              <TransactionList transactions={monthlyTransactions} onEdit={handleEdit} />
            </div>
          </>
        )}
      </main>
      <TransactionModal isOpen={isModalOpen} onClose={handleCloseModal} transaction={editingTransaction} />
    </div>
  );
};

export default DashboardPage;
