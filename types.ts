
export enum TransactionType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string for date
}

export interface User {
  username: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO string for date
}
