import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { CachedAvatar } from '../../../components/CachedAvatar';

type MemberBalanceRowProps = {
  member: any;
  idx: number;
  isMe: boolean;
  currencySymbol: string;
  onSettle: (amount: number) => void;
  onRemind: () => void;
};

export function MemberBalanceRow({ member, idx, isMe, currencySymbol, onSettle, onRemind }: MemberBalanceRowProps) {
  const totalPaid = parseFloat(member.balance?.paidAmount || '0');
  const percent = member.percentageOfGroup || 0; // Keeping this if backend adds it, else defaults to 0

  const netBalance = parseFloat(member.balance?.netAmount || '0');
  const theyOweMe = netBalance > 0;
  const iOweThem = netBalance < 0;
  const amt = Math.abs(netBalance);
  const isSettled = member.isSettled ?? (amt === 0);
  const currencyCode = member.currencyCode || 'INR'; // Fallback if group currency not passed down

  return (
    <motion.div
      key={member.userId}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSettled && !isMe ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <CachedAvatar src={member.resolvedAvatar || member.avatarUrl} alt={member.displayName} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent" />
          {iOweThem && <div className="absolute inset-0 rounded-full ring-2 ring-rose-400 ring-offset-2 dark:ring-offset-slate-900" />}
          {theyOweMe && <div className="absolute inset-0 rounded-full ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900" />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-bold text-base ${isSettled && !isMe ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
               {member.displayName} {isMe && <span className="text-slate-400 font-normal">(You)</span>}
            </span>
            {member.role === 'OWNER' && (
               <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Owner</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Paid {formatCurrency(totalPaid.toFixed(2), currencyCode)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{percent}% of group</span>
          </div>
        </div>
      </div>

      {!isMe && (
        <div className="flex items-center justify-between sm:justify-end gap-4 pl-16 sm:pl-0">
          {!isSettled ? (
            <>
              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
                  {iOweThem ? 'You owe' : 'Owes you'}
                </p>
                <p className={`font-bold text-lg ${iOweThem ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(amt.toFixed(2), currencyCode)}
                </p>
              </div>
              {iOweThem && (
                <button
                  onClick={() => onSettle(amt)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-transform active:scale-95 shrink-0"
                >
                  Settle
                </button>
              )}
              {theyOweMe && (
                <button
                  onClick={onRemind}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 text-sm font-semibold rounded-xl transition-colors shrink-0"
                >
                  Remind
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-400 dark:text-slate-500">
               <Check className="w-4 h-4" />
               Settled up
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
