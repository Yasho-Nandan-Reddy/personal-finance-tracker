'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'SAVINGS' | 'DEBT_PAYMENT' | 'PURCHASE' | 'INVESTMENT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export default function GoalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 25000,
      deadline: '2024-12-31',
      category: 'SAVINGS',
      priority: 'HIGH'
    },
    {
      id: '2',
      name: 'New Car',
      targetAmount: 500000,
      currentAmount: 75000,
      deadline: '2025-06-30',
      category: 'PURCHASE',
      priority: 'MEDIUM'
    },
    {
      id: '3',
      name: 'Student Loan',
      targetAmount: 200000,
      currentAmount: 150000,
      deadline: '2024-08-31',
      category: 'DEBT_PAYMENT',
      priority: 'HIGH'
    }
  ]);

  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    category: 'SAVINGS',
    priority: 'MEDIUM'
  });

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.deadline) {
      const goal: FinancialGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount) || 0,
        deadline: newGoal.deadline,
        category: newGoal.category as FinancialGoal['category'],
        priority: newGoal.priority as FinancialGoal['priority']
      };
      setGoals([...goals, goal]);
      setNewGoal({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        category: 'SAVINGS',
        priority: 'MEDIUM'
      });
      setIsAddingGoal(false);
    }
  };

  const handleUpdateProgress = (goalId: string, amount: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
        return { ...goal, currentAmount: newAmount };
      }
      return goal;
    }));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  const getPriorityColor = (priority: FinancialGoal['priority']) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: FinancialGoal['category']) => {
    switch (category) {
      case 'SAVINGS': return '💰';
      case 'DEBT_PAYMENT': return '💳';
      case 'PURCHASE': return '🛍️';
      case 'INVESTMENT': return '📈';
      default: return '🎯';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add New Goal
          </button>
        </div>

        {isAddingGoal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Goal Name"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Target Amount"
                value={newGoal.targetAmount || ''}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Current Amount"
                value={newGoal.currentAmount || ''}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                className="px-3 py-2 border rounded-md"
              />
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="px-3 py-2 border rounded-md"
              />
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as FinancialGoal['category'] })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="SAVINGS">Savings</option>
                <option value="DEBT_PAYMENT">Debt Payment</option>
                <option value="PURCHASE">Purchase</option>
                <option value="INVESTMENT">Investment</option>
              </select>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as FinancialGoal['priority'] })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsAddingGoal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Goal
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500">
                    {getCategoryIcon(goal.category)} {goal.category.replace('_', ' ')}
                  </p>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                  {goal.priority} Priority
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-full bg-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  Target: ₹{goal.targetAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Current: ₹{goal.currentAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Remaining: ₹{(goal.targetAmount - goal.currentAmount).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Add amount"
                    className="w-24 px-2 py-1 text-sm border rounded"
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      if (amount > 0) {
                        handleUpdateProgress(goal.id, amount);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4">Goal Setting Tips</h3>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Break down large goals into smaller milestones
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Regularly review and adjust your goals
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            Celebrate your progress along the way
          </li>
        </ul>
      </motion.div>
    </div>
  );
} 