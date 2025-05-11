'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Transaction } from '@/types/transaction';

interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  percentage: number;
}

export default function BudgetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState('');
  const [isEditingTotalBudget, setIsEditingTotalBudget] = useState(false);
  const [totalBudgetAmount, setTotalBudgetAmount] = useState(20000);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'Food & Dining', limit: 5000, spent: 0, color: 'bg-blue-500', percentage: 25 },
    { id: '2', name: 'Transportation', limit: 3000, spent: 0, color: 'bg-green-500', percentage: 15 },
    { id: '3', name: 'Entertainment', limit: 2000, spent: 0, color: 'bg-purple-500', percentage: 10 },
    { id: '4', name: 'Shopping', limit: 4000, spent: 0, color: 'bg-yellow-500', percentage: 20 },
    { id: '5', name: 'Bills & Utilities', limit: 6000, spent: 0, color: 'bg-red-500', percentage: 30 },
  ]);

  const distributeBudget = (total: number) => {
    setBudgetCategories(prev => prev.map(category => ({
      ...category,
      limit: Math.round((total * category.percentage) / 100)
    })));
  };

  const handleTotalBudgetChange = (newTotal: number) => {
    setTotalBudgetAmount(newTotal);
    distributeBudget(newTotal);
  };

  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    setBudgetCategories(prev => {
      const updated = prev.map(category => {
        if (category.id === categoryId) {
          return { ...category, percentage: newPercentage };
        }
        return category;
      });
      
      const totalPercentage = updated.reduce((sum, cat) => sum + cat.percentage, 0);
      if (totalPercentage === 100) {
        return updated.map(category => ({
          ...category,
          limit: Math.round((totalBudgetAmount * category.percentage) / 100)
        }));
      }
      return updated;
    });
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        setTransactions(data);
        
        const spentByCategory = data.reduce((acc: Record<string, number>, transaction: Transaction) => {
          if (transaction.type === 'EXPENSE') {
            acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
          }
          return acc;
        }, {});

        setBudgetCategories(prev => prev.map(category => ({
          ...category,
          spent: spentByCategory[category.name] || 0
        })));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const handleEditCategory = (categoryId: string) => {
    const category = budgetCategories.find(c => c.id === categoryId);
    if (category) {
      setNewCategoryName(category.name);
      setNewCategoryLimit(category.limit.toString());
      setEditingCategory(categoryId);
    }
  };

  const handleSaveEdit = (categoryId: string) => {
    setBudgetCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          name: newCategoryName,
          limit: parseFloat(newCategoryLimit) || 0
        };
      }
      return category;
    }));
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setBudgetCategories(prev => prev.filter(category => category.id !== categoryId));
  };

  const handleAddCategory = () => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      limit: parseFloat(newCategoryLimit) || 0,
      spent: 0,
      color: `bg-${['blue', 'green', 'purple', 'yellow', 'red'][Math.floor(Math.random() * 5)]}-500`,
      percentage: 0
    };
    setBudgetCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
    setNewCategoryLimit('');
  };

  const totalSpent = budgetCategories.reduce((sum, category) => sum + category.spent, 0);
  const remainingBudget = totalBudgetAmount - totalSpent;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-600">Total Budget</h3>
            <button
              onClick={() => setIsEditingTotalBudget(true)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Edit
            </button>
          </div>
          {isEditingTotalBudget ? (
            <div className="mt-2">
              <input
                type="number"
                value={totalBudgetAmount}
                onChange={(e) => handleTotalBudgetChange(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsEditingTotalBudget(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditingTotalBudget(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-3xl font-bold text-indigo-600 mt-2">₹{totalBudgetAmount.toFixed(2)}</p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-red-600">₹{totalSpent.toFixed(2)}</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Remaining</h3>
          <p className={`text-3xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{remainingBudget.toFixed(2)}
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-lg mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Budget Categories</h3>
          <button
            onClick={() => {
              setNewCategoryName('');
              setNewCategoryLimit('');
              setEditingCategory('new');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Category
          </button>
        </div>

        {editingCategory === 'new' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category Name"
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                value={newCategoryLimit}
                onChange={(e) => setNewCategoryLimit(e.target.value)}
                placeholder="Budget Limit"
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Percentage"
                className="px-3 py-2 border rounded-md"
                onChange={(e) => {
                  const percentage = Number(e.target.value);
                  if (percentage >= 0 && percentage <= 100) {
                    handlePercentageChange('new', percentage);
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {budgetCategories.map((category, index) => {
            const percentage = (category.spent / category.limit) * 100;
            const isOverBudget = category.spent > category.limit;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  {editingCategory === category.id ? (
                    <div className="flex-1 grid grid-cols-3 gap-4 mr-4">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      />
                      <input
                        type="number"
                        value={newCategoryLimit}
                        onChange={(e) => setNewCategoryLimit(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      />
                      <input
                        type="number"
                        value={category.percentage}
                        onChange={(e) => handlePercentageChange(category.id, Number(e.target.value))}
                        className="px-3 py-2 border rounded-md"
                      />
                    </div>
                  ) : (
                    <span className="font-medium text-gray-700">{category.name}</span>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      ₹{category.spent.toFixed(2)} / ₹{category.limit.toFixed(2)}
                      <span className="ml-2 text-xs">({category.percentage}%)</span>
                    </span>
                    {editingCategory === category.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveEdit(category.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category.id)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full ${category.color} ${isOverBudget ? 'bg-red-500' : ''}`}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-sm text-red-600">
                    Over budget by ₹{(category.spent - category.limit).toFixed(2)}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4">Budget Tips</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Track your expenses regularly to stay within budget
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Set realistic budget limits for each category
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Review and adjust your budget monthly
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Save at least 20% of your income
          </li>
        </ul>
      </motion.div>
    </div>
  );
} 