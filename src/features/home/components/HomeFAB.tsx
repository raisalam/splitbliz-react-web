import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Banknote, Plus, Receipt, Users } from 'lucide-react';

type HomeFABProps = {
  expanded: boolean;
  onToggle: () => void;
  onNewGroup: () => void;
  onQuickSettle: () => void;
  onAddExpense: () => void;
  onBackdropClick: () => void;
};

export function HomeFAB({
  expanded,
  onToggle,
  onNewGroup,
  onQuickSettle,
  onAddExpense,
  onBackdropClick
}: HomeFABProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 sm:bottom-10 sm:right-10">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2.5 items-end"
          >
            <button
              onClick={onNewGroup}
              className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span className="font-semibold text-sm whitespace-nowrap">New Group</span>
            </button>

            <button
              onClick={onQuickSettle}
              className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95"
            >
              <Banknote className="w-4 h-4" />
              <span className="font-semibold text-sm whitespace-nowrap">Quick Settle</span>
            </button>

            <button
              onClick={onAddExpense}
              className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span className="font-semibold text-sm whitespace-nowrap">Add Expense</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {expanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={onBackdropClick}
        />
      )}

      <button
        onClick={onToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95 z-50 ${
          expanded
            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white rotate-45'
            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white hover:scale-105'
        }`}
      >
        <Plus className="w-6 h-6 transition-transform duration-300" />
      </button>
    </div>
  );
}
