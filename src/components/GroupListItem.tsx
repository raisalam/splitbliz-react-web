import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Users } from 'lucide-react';
import { GroupAvatar } from './GroupAvatar';
import { Group } from '../types';
import { GROUP_TYPE_EMOJI } from '../constants/app';
import { formatCurrency } from '../utils/formatCurrency';

export type GroupListItemProps = {
  group: Group;
  onClick: () => void;
  index?: number;
  hideFinancials?: boolean;
};

/** Derive balance direction from the API's netAmount string */
function getBalanceInfo(group: Group) {
  const net = group.balance ? Number(group.balance.netAmount) : 0;
  if (net > 0) return { direction: 'CREDITOR' as const, amount: group.balance!.netAmount };
  if (net < 0) return { direction: 'I_OWE' as const, amount: Math.abs(net).toFixed(2) };
  return { direction: 'SETTLED' as const, amount: '0.00' };
}

export function GroupListItem({ group, onClick, index = 0, hideFinancials = false }: GroupListItemProps) {
  const { direction, amount } = getBalanceInfo(group);
  const hasUpdates = direction !== 'SETTLED';
  const emoji = GROUP_TYPE_EMOJI[group.groupType] ?? GROUP_TYPE_EMOJI['OTHER'];

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
        <GroupAvatar name={group.name} emoji={emoji} size="md" hasActivity={hasUpdates} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {group.name}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {group.memberCount} members
              </span>
            </div>
          </div>
        </div>
      </div>

      {!hideFinancials && (
        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 pt-3 sm:pt-0">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {direction === 'SETTLED' ? 'All settled up' :
               direction === 'CREDITOR' ? 'You are owed' : 'You owe'}
            </span>
            <span className={`font-semibold ${
              direction === 'SETTLED' ? 'text-slate-700 dark:text-slate-300' :
              direction === 'CREDITOR' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {direction !== 'SETTLED'
                ? formatCurrency(amount, group.currencyCode)
                : formatCurrency('0.00', group.currencyCode)
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
