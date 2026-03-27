import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { ExpenseRow } from './ExpenseRow';

type ExpenseListProps = {
  expenses: any[];
  members: any[];
  currencySymbol: string;
  expenseFilter: 'ALL' | 'THIS_MONTH' | 'UNSETTLED';
  onFilterChange: (value: 'ALL' | 'THIS_MONTH' | 'UNSETTLED') => void;
  onExpenseClick: (expenseId: string) => void;
  onAddExpense: () => void;
  currentUserId: string;
};

export function ExpenseList({
  expenses,
  members,
  currencySymbol,
  expenseFilter,
  onFilterChange,
  onExpenseClick,
  onAddExpense,
  currentUserId
}: ExpenseListProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {['ALL', 'THIS_MONTH', 'UNSETTLED'].map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter as any)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              expenseFilter === filter
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
            }`}
          >
            {filter === 'ALL' ? 'All' : filter === 'THIS_MONTH' ? 'This Month' : 'Unsettled'}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {expenses.map((expense: any, idx) => {
          const payer = members.find(m => m.userPublicId === expense.paidByUserPublicId) || { displayName: 'Someone' };
          const isMe = expense.paidByUserPublicId === currentUserId;
          const formattedDate = new Date(expense.expenseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          return (
            <ExpenseRow
              key={expense.publicId}
              expense={expense}
              idx={idx}
              payer={payer}
              isMe={isMe}
              formattedDate={formattedDate}
              members={members}
              currencySymbol={currencySymbol}
              onClick={() => onExpenseClick(expense.publicId)}
              currentUserId={currentUserId}
            />
          );
        })}

        {expenses.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 mt-4 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">{currencySymbol}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No expenses yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-6">Start tracking your shared costs by adding the first expense to this group.</p>
            <button
              onClick={onAddExpense}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add the first expense
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
