import React from 'react';
import { motion } from 'motion/react';

type ActivityItem = {
  id: string;
  type: 'EXPENSE_ADDED' | 'SETTLEMENT_COMPLETED' | 'GROUP_JOINED' | string;
  description: string;
  groupName: string;
  amount: string | null;
  amountType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
};

type RecentActivityListProps = {
  activities: ActivityItem[];
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === 'EXPENSE_ADDED' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' :
                  activity.type === 'SETTLEMENT_COMPLETED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    in <span className="font-medium">{activity.groupName}</span> â€¢ {activity.time}
                  </p>
                </div>
              </div>

              {activity.amount && (
                <div className={`font-semibold text-sm ${
                  activity.amountType === 'POSITIVE' ? 'text-emerald-600 dark:text-emerald-400' :
                  activity.amountType === 'NEGATIVE' ? 'text-rose-600 dark:text-rose-400' :
                  'text-slate-400 dark:text-slate-500'
                }`}>
                  {activity.amountType === 'POSITIVE' ? '+' : activity.amountType === 'NEGATIVE' ? '-' : ''}{activity.amount}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
        <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          View all activity
        </button>
      </div>
    </motion.div>
  );
}
