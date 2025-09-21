
import React, { useState, FormEvent } from 'react';
import { useSettings } from '../context/SettingsContext';

const SettingsPage: React.FC = () => {
    const { monthlyLimit, setMonthlyLimit, customCategories, addCustomCategory, deleteCustomCategory } = useSettings();
    const [limitInput, setLimitInput] = useState(String(monthlyLimit || ''));
    const [newCategory, setNewCategory] = useState('');

    const handleLimitSave = (e: FormEvent) => {
        e.preventDefault();
        const newLimit = parseFloat(limitInput);
        if (!isNaN(newLimit) && newLimit >= 0) {
            setMonthlyLimit(newLimit);
            alert('Spending limit updated!');
        } else {
            alert('Please enter a valid, non-negative number for the limit.');
        }
    };
    
    const handleAddCategory = (e: FormEvent) => {
        e.preventDefault();
        if(newCategory && !customCategories.find(c => c.toLowerCase() === newCategory.toLowerCase())) {
            addCustomCategory(newCategory.trim());
            setNewCategory('');
        } else if (newCategory) {
            alert('This category already exists.');
        }
    };

    return (
        <div className="space-y-8">
            {/* Spending Limit Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Monthly Spending Limit</h3>
                <p className="text-gray-400 mb-4 text-sm">Set a monthly spending limit to get warnings on your dashboard when you get close.</p>
                <form onSubmit={handleLimitSave} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-grow w-full">
                        <label htmlFor="spending-limit" className="block text-sm font-medium text-gray-300 mb-1">Limit Amount ($)</label>
                        <input
                            id="spending-limit"
                            type="number"
                            value={limitInput}
                            onChange={e => setLimitInput(e.target.value)}
                            placeholder="e.g., 5000"
                            className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary transition-colors">
                        Save Limit
                    </button>
                </form>
            </div>

            {/* Custom Categories Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-white">Custom Expense Categories</h3>
                 <p className="text-gray-400 mb-4 text-sm">Add your own categories to better organize your expenses. These will appear in all category dropdowns.</p>
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-end gap-4 mb-6">
                    <div className="flex-grow w-full">
                         <label htmlFor="new-category" className="block text-sm font-medium text-gray-300 mb-1">New Category Name</label>
                        <input
                            id="new-category"
                            type="text"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            placeholder="e.g., Pet Food"
                            className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                     <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-secondary transition-colors">
                        Add Category
                    </button>
                </form>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Your Categories</h4>
                    {customCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {customCategories.map(cat => (
                                <div key={cat} className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-1 text-sm">
                                    <span>{cat}</span>
                                    <button onClick={() => deleteCustomCategory(cat)} className="text-gray-400 hover:text-red-500 font-bold">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">You haven't added any custom categories yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
