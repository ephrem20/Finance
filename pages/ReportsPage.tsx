
import React, { useState, useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useSettings } from '../context/SettingsContext';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import SummaryCard from '../components/SummaryCard';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#FF6361', '#BC5090', '#58508D'];

const ReportsPage: React.FC = () => {
    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterCategory, setFilterCategory] = useState('ALL');
    
    // Report data state
    const [reportData, setReportData] = useState<Transaction[] | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    const { transactions } = useTransactions();
    const { customCategories } = useSettings();

    const allCategories = useMemo(() => {
        return [...new Set([...EXPENSE_CATEGORIES, ...customCategories])].sort();
    }, [customCategories]);


    const handleGenerateReport = () => {
        let filtered = transactions.filter(t => {
            const transactionDate = new Date(t.date).getTime();
            if (startDate) {
                const start = new Date(startDate).getTime();
                if (transactionDate < start) return false;
            }
            if (endDate) {
                // Add 1 day to end date to include the full day
                const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1);
                if (transactionDate > end) return false;
            }
            if (filterType !== 'ALL' && t.type !== filterType) {
                return false;
            }
            if (filterType === TransactionType.EXPENSE && filterCategory !== 'ALL' && t.category !== filterCategory) {
                return false;
            }
            return true;
        });
        setReportData(filtered);
    };

    const sortedReportData = useMemo(() => {
        if (!reportData) return [];
        const sorted = [...reportData];
        sorted.sort((a, b) => {
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
                case 'category':
                    valA = a.category.toLowerCase();
                    valB = b.category.toLowerCase();
                    break;
                case 'type':
                     valA = a.type.toLowerCase();
                    valB = b.type.toLowerCase();
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
        return sorted;
    }, [reportData, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDownloadCsv = () => {
        if (!sortedReportData || sortedReportData.length === 0) return;

        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...sortedReportData.map(t => [
                new Date(t.date).toLocaleDateString(),
                `"${t.description.replace(/"/g, '""')}"`, // Handle quotes
                t.category,
                t.type,
                t.amount
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'wallet_watcher_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const reportSummary = useMemo(() => {
        if (!reportData) return null;
        const totalRevenue = reportData.filter(t => t.type === TransactionType.REVENUE).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = reportData.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const net = totalRevenue - totalExpenses;
        return { totalRevenue, totalExpenses, net };
    }, [reportData]);

     const expenseChartData = useMemo(() => {
        if (!reportData) return [];
        const expenseData = reportData.filter(t => t.type === TransactionType.EXPENSE);
        if (expenseData.length === 0) return [];
        
        const categoryTotals = expenseData.reduce((acc, transaction) => {
          const category = transaction.category || 'Other';
          acc[category] = (acc[category] || 0) + transaction.amount;
          return acc;
        }, {} as { [key: string]: number });

        return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    }, [reportData]);


    const ReportTable = () => (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        {/* Table Headers */}
                        {['date', 'description', 'category', 'type', 'amount'].map(key => (
                            <th key={key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort(key)}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                {sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedReportData.map(t => (
                        <tr key={t.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                            <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-white font-medium">{t.description}</td>
                            <td className="px-6 py-4">{t.category}</td>
                            <td className="px-6 py-4">{t.type}</td>
                            <td className={`px-6 py-4 font-semibold ${t.type === TransactionType.EXPENSE ? 'text-red-400' : 'text-green-400'}`}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Generate a Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Filter Controls */}
                    <div>
                        <label className="text-xs font-semibold text-gray-400">Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400">End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400">Type</label>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary">
                            <option value="ALL">All</option>
                            <option value={TransactionType.REVENUE}>Revenue</option>
                            <option value={TransactionType.EXPENSE}>Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-400">Category</label>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} disabled={filterType !== TransactionType.EXPENSE} className="w-full bg-gray-700 text-white text-sm rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50">
                            <option value="ALL">All</option>
                            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={handleGenerateReport} className="w-full sm:w-auto px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-opacity-75 transition-colors duration-300">
                    Generate Report
                </button>
            </div>

            {reportData && (
                <div className="space-y-6">
                    {/* Report Summary */}
                    {reportSummary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SummaryCard title="Total Revenue" amount={reportSummary.totalRevenue} color="text-green-400" />
                            <SummaryCard title="Total Expenses" amount={reportSummary.totalExpenses} color="text-red-400" />
                            <SummaryCard title="Net" amount={reportSummary.net} color={reportSummary.net >= 0 ? 'text-blue-400' : 'text-yellow-400'} />
                        </div>
                    )}

                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Report Details</h3>
                             <button onClick={handleDownloadCsv} disabled={!sortedReportData || sortedReportData.length === 0} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                Download CSV
                            </button>
                        </div>
                        {sortedReportData.length > 0 ? <ReportTable /> : <p className="text-center text-gray-500 py-8">No transactions found for the selected criteria.</p>}
                    </div>

                    {expenseChartData.length > 0 && (
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold mb-4 text-white">Expense Breakdown by Category</h3>
                             <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                    <Pie
                                        data={expenseChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {expenseChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                                        formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                                    />
                                    <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
