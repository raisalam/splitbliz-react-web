import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { GroupAvatar } from './GroupAvatar';

export type GroupListItemProps = {
  group: any;
  onClick: () => void;
  index?: number;
  hideFinancials?: boolean;
};

export function GroupListItem({ group, onClick, index = 0, hideFinancials = false }: GroupListItemProps) {
  const hasUpdates = group.unreadNotificationCount > 0 || group.myNetInGroup.direction !== 'SETTLED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
        hasUpdates ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <GroupAvatar name={group.name} emoji={group.emoji} size="md" hasActivity={hasUpdates} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {group.name}
            </h3>
            {group.planTierCode === 'PRO' && (
              <span className="border border-amber-400/60 text-amber-600 dark:text-amber-400 dark:border-amber-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Pro
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {group.members.slice(0, 3).map((member: any) => (
                <img 
                  key={member.userPublicId} 
                  src={member.avatarUrl} 
                  alt={member.displayName}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 object-cover z-10"
                />
              ))}
              {group.members.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300 z-0">
                  +{group.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {group.members.length} members
            </span>
          </div>
        </div>
      </div>

      {!hideFinancials && (
        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 pt-3 sm:pt-0">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {group.myNetInGroup.direction === 'SETTLED' ? 'All settled up' :
               group.myNetInGroup.direction === 'CREDITOR' ? 'You are owed' : 'You owe'}
            </span>
            <span className={`font-semibold ${
              group.myNetInGroup.direction === 'SETTLED' ? 'text-slate-700 dark:text-slate-300' :
              group.myNetInGroup.direction === 'CREDITOR' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {group.myNetInGroup.direction !== 'SETTLED' ? 
                `${group.myNetInGroup.currencyCode === 'INR' ? '₹' : '$'}${group.myNetInGroup.amount}` : 
                '₹0.00'
              }
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        </div>
      )}
      
      {hideFinancials && (
         <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      )}
    </motion.div>
  );
}
