
import React from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { useTransactions } from '../context/TransactionContext';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<{ transaction: Transaction, onEdit: (transaction: Transaction) => void }> = ({ transaction, onEdit }) => {
  const { deleteTransaction } = useTransactions();
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const amountColor = isExpense ? 'text-red-400' : 'text-green-400';
  const sign = isExpense ? '-' : '+';
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg mb-2">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-semibold text-white">{transaction.description}</p>
          <p className="text-sm text-gray-400">{transaction.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <p className={`font-semibold text-lg ${amountColor}`}>
          {sign}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)}
        </p>
        <button onClick={() => onEdit(transaction)} className="text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        </button>
        <button onClick={() => deleteTransaction(transaction.id)} className="text-gray-400 hover:text-red-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};


const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (transactions.length === 0) {
    return <p className="text-center text-gray-500">No transactions for this month.</p>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {sortedTransactions.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default TransactionList;
