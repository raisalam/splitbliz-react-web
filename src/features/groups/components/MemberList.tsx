import React from 'react';
import { motion } from 'motion/react';
import { Check } from '../../../constants/icons';
import { MemberBalanceRow } from './MemberBalanceRow';
import { formatCurrency } from '../../../utils/formatCurrency';

type MemberListProps = {
  members: any[];
  group: any;
  currencySymbol: string;
  currentUserId: string;
  onShowHistory: () => void;
  onSettle: (memberId: string, amount: number) => void;
  onRemind: (memberId: string) => void;
};

export function MemberList({
  members,
  group,
  currencySymbol,
  currentUserId,
  onShowHistory,
  onSettle,
  onRemind
}: MemberListProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

      <div className="flex items-center justify-between mt-2 px-1">
        <h3 className="font-bold text-slate-900 dark:text-white">Group Members</h3>
        <button
          onClick={onShowHistory}
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline transition-all"
        >
          View History
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        {(() => {
          const net = parseFloat(group?.balance?.netAmount || '0');
          const owed = net > 0 ? net : 0;
          const owe = net < 0 ? Math.abs(net) : 0;
          const currencyCode = currencySymbol;
          return (
            <>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total owed to you</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {owed > 0 ? `+${formatCurrency(owed.toFixed(2), currencyCode)}` : formatCurrency('0.00', currencyCode)}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">You owe</span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {owe > 0 ? formatCurrency(owe.toFixed(2), currencyCode) : formatCurrency('0.00', currencyCode)}
                </span>
              </div>
            </>
          );
        })()}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50 shadow-sm">
        {members.map((member: any, idx) => {
          const isMe = member.userPublicId === currentUserId;

          return (
            <MemberBalanceRow
              key={member.userPublicId}
              member={member}
              idx={idx}
              isMe={isMe}
              currencySymbol={currencySymbol}
              onSettle={(amount) => onSettle(member.userPublicId, amount)}
              onRemind={() => onRemind(member.userId)}
            />
          );
        })}
      </div>

      {group?.myNetInGroup?.amount === '0.00' && (
        <div className="mt-8 text-center p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Everyone is even 🎉</h3>
          <p className="text-emerald-700/80 dark:text-emerald-400">No pending balances or settlements required.</p>
        </div>
      )}
    </motion.div>
  );
}
