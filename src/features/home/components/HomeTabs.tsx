import React from 'react';
import { motion } from 'motion/react';
import { History, Users } from 'lucide-react';

type HomeTabsProps = {
  activeTab: 'groups' | 'activity';
  onChange: (tab: 'groups' | 'activity') => void;
};

export function HomeTabs({ activeTab, onChange }: HomeTabsProps) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
      <button
        onClick={() => onChange('groups')}
        className={`pb-3 text-sm font-medium transition-colors relative ${
          activeTab === 'groups'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Your Groups
        </div>
        {activeTab === 'groups' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
          />
        )}
      </button>

      <button
        onClick={() => onChange('activity')}
        className={`pb-3 text-sm font-medium transition-colors relative ${
          activeTab === 'activity'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" />
          Recent Activity
        </div>
        {activeTab === 'activity' && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
          />
        )}
      </button>
    </div>
  );
}
