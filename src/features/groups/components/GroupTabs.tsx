import React from 'react';
import { motion } from 'motion/react';
import { Receipt, Users } from '../../../constants/icons';

type GroupTabsProps = {
  activeTab: 'expenses' | 'members';
  onChange: (tab: 'expenses' | 'members') => void;
};

export function GroupTabs({ activeTab, onChange }: GroupTabsProps) {
  return (
    <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6 sticky top-16 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm z-40 py-2">
      <button
        onClick={() => onChange('expenses')}
        className={`pb-3 text-sm font-medium transition-colors relative ${
          activeTab === 'expenses'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Expenses
        </div>
        {activeTab === 'expenses' && (
          <motion.div
            layoutId="groupTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
          />
        )}
      </button>

      <button
        onClick={() => onChange('members')}
        className={`pb-3 text-sm font-medium transition-colors relative ${
          activeTab === 'members'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Members & Balances
        </div>
        {activeTab === 'members' && (
          <motion.div
            layoutId="groupTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
          />
        )}
      </button>
    </div>
  );
}
