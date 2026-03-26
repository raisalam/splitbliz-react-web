import React from 'react';
import { motion } from 'motion/react';
import { GroupAvatar } from '../../../components/GroupAvatar';

type ExpenseRowProps = {
  expense: any;
  idx: number;
  payer: any;
  isMe: boolean;
  formattedDate: string;
  members: any[];
  currencySymbol: string;
  onClick: () => void;
};

export function ExpenseRow({ expense, idx, payer, isMe, formattedDate, members, currencySymbol, onClick }: ExpenseRowProps) {
  const totalAmount = parseFloat(expense.totalAmount || '0');
  const myShareAmount = parseFloat(expense.yourShare || '0');
  const netForExpense = isMe ? (totalAmount - myShareAmount) : -myShareAmount;

  let shareColorClass = 'text-slate-400 dark:text-slate-500';
  if (netForExpense > 0) shareColorClass = 'text-emerald-600 dark:text-emerald-400';
  else if (netForExpense < 0) shareColorClass = 'text-amber-600 dark:text-amber-500';

  const getBorderColor = (e: string) => {
    switch (e) {
      case '✈️': return 'border-l-indigo-500';
      case '🍽️': return 'border-l-orange-500';
      case '🏠': return 'border-l-emerald-500';
      case '🚕': return 'border-l-amber-500';
      case '🍿': return 'border-l-rose-500';
      default: return 'border-l-slate-300 dark:border-l-slate-700';
    }
  };
  const leftBorderClass = getBorderColor(expense.categoryEmoji || '🛒');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-2xl border-y border-r border-slate-200 dark:border-slate-800 border-l-[3px] ${leftBorderClass} overflow-hidden hover:border-y-indigo-500/30 hover:border-r-indigo-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GroupAvatar name={expense.title} emoji={expense.categoryEmoji || '🛒'} size="md" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">{expense.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>{isMe ? 'You' : payer.displayName} paid {currencySymbol}{expense.totalAmount}</span>
              <span className="hidden sm:inline">•</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${shareColorClass}`}>
                Your share: {currencySymbol}{myShareAmount.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="font-semibold text-slate-900 dark:text-white text-base">
            {currencySymbol}{expense.totalAmount}
          </div>
          <div className="flex flex-col items-end gap-1.5 mt-1">
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
              expense.splitType === 'EQUAL'
                ? 'bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white'
                : 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white'
            }`}>
              {expense.splitType}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
