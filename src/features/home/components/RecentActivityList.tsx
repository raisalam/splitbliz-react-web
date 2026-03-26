import React from 'react';
import { motion } from 'motion/react';
import { Plus, Check, UserPlus, DollarSign, Edit, Trash, Users, Shield, Settings, ArrowUpDown } from 'lucide-react';
import { ActivityEntry, ActivityEventType } from '../../../types';

/** Map event types to icons and display info */
function getActivityDisplay(entry: ActivityEntry): {
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  amountType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  bgClass: string;
} {
  const meta = entry.metadata;
  const description = meta.title ?? 'Recent activity';

  const map: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    amountType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    bg: string;
  }> = {
    EXPENSE_CREATED: { icon: Plus, amountType: 'POSITIVE', bg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
    EXPENSE_EDITED: { icon: Edit, amountType: 'NEUTRAL', bg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
    EXPENSE_DELETED: { icon: Trash, amountType: 'NEGATIVE', bg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
    SETTLEMENT_CREATED: { icon: DollarSign, amountType: 'NEGATIVE', bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    SETTLEMENT_APPROVED: { icon: Check, amountType: 'POSITIVE', bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
    SETTLEMENT_REJECTED: { icon: Trash, amountType: 'NEUTRAL', bg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
    SETTLEMENT_CANCELLED: { icon: Trash, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    MEMBER_JOINED: { icon: UserPlus, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    MEMBER_REMOVED: { icon: Users, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    MEMBER_ROLE_CHANGED: { icon: Shield, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    GROUP_CREATED: { icon: Plus, amountType: 'NEUTRAL', bg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
    GROUP_SETTINGS_UPDATED: { icon: Settings, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  };

  const matched = map[entry.eventType];
  if (matched) {
    return { icon: matched.icon, description, amountType: matched.amountType, bgClass: matched.bg };
  }

  return {
    icon: ArrowUpDown,
    description,
    amountType: 'NEUTRAL',
    bgClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
}

function formatActivityTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type RecentActivityListProps = {
  activities: ActivityEntry[];
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {activities.map((entry, i) => {
          const { icon: Icon, description, amountType, bgClass } = getActivityDisplay(entry);
          const amount = entry.metadata.amount;
          const time = formatActivityTime(entry.createdAt);

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {time}
                  </p>
                </div>
              </div>

              {amount && (
                <div className={`font-semibold text-sm ${
                  amountType === 'POSITIVE' ? 'text-emerald-600 dark:text-emerald-400' :
                  amountType === 'NEGATIVE' ? 'text-rose-600 dark:text-rose-400' :
                  'text-slate-400 dark:text-slate-500'
                }`}>
                  {amountType === 'POSITIVE' ? '+' : amountType === 'NEGATIVE' ? '-' : ''}{amount}
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
