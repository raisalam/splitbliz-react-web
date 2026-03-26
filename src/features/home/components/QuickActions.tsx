import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Banknote, Check, ChevronDown, UserPlus, X } from 'lucide-react';
import { GroupAvatar } from '../../../components/GroupAvatar';
import { ActionItem, Group } from '../../../types';
import { GROUP_TYPE_EMOJI } from '../../../constants/app';
import { formatCurrency } from '../../../utils/formatCurrency';
import { CachedAvatar } from '../../../components/CachedAvatar';

type QuickActionsProps = {
  groups: Group[];
  allActions: ActionItem[];
  visibleActions: ActionItem[];
  hiddenCount: number;
  onShowAll: () => void;
  onAction: (referenceId: string, type: ActionItem['type'], action: 'approve' | 'reject') => void;
};

export function QuickActions({
  groups,
  allActions,
  visibleActions,
  hiddenCount,
  onShowAll,
  onAction
}: QuickActionsProps) {
  return (
    <AnimatePresence>
      {allActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Action Items
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold">
                {allActions.length} Pending
              </span>
            </h2>
          </div>

          <div className="grid gap-3">
            <AnimatePresence>
              {visibleActions.map((action) => {
                const isSettlement = action.type === 'SETTLEMENT_APPROVAL';
                const displayName = action.fromUser?.displayName ?? 'Unknown';
                const avatarUrl = action.fromUser?.resolvedAvatar;
                const avatarInitial = displayName.charAt(0).toUpperCase();
                const group = groups.find(g => g.id === action.groupId);
                const groupEmoji = group ? (GROUP_TYPE_EMOJI[group.groupType] ?? GROUP_TYPE_EMOJI['OTHER']) : '👥';
                const timeStr = new Date(action.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                return (
                  <motion.div
                    key={action.referenceId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/80 group-hover:bg-rose-500 transition-colors"></div>

                    <div className="flex items-start sm:items-center gap-3 pl-2">
                      <GroupAvatar name={action.groupName} emoji={groupEmoji} size="sm" />
                      <div className="relative shrink-0">
                        {avatarUrl ? (
                          <CachedAvatar src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        ) : (
                          <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-200">
                            {avatarInitial}
                          </span>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                          {isSettlement ? (
                            <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <Banknote className="w-2.5 h-2.5" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                              <UserPlus className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">{displayName}</span>
                          {isSettlement ? (
                            <> requested a settlement of <span className="font-semibold text-slate-900 dark:text-white">{action.amount && action.currencyCode ? formatCurrency(action.amount, action.currencyCode) : action.amount}</span> in <span className="font-semibold text-slate-900 dark:text-white">{action.groupName}</span></>
                          ) : (
                            <> invited you to join <span className="font-semibold text-slate-900 dark:text-white">{action.groupName}</span></>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{timeStr}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto pl-2 sm:pl-0 mt-2 sm:mt-0">
                      <button
                        onClick={() => onAction(action.referenceId, action.type, 'reject')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        {isSettlement ? 'Reject' : 'Decline'}
                      </button>
                      <button
                        onClick={() => onAction(action.referenceId, action.type, 'approve')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        {isSettlement ? 'Approve' : 'Join'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {hiddenCount > 0 && (
            <button
              onClick={onShowAll}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
            >
              <ChevronDown className="w-4 h-4 transition-transform" />
              Show all {allActions.length} items
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
