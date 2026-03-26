import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Sparkles, Wallet } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

type BalanceSummaryCardProps = {
  group: any;
  members: any[];
  currencySymbol: string;
  onAiClick: () => void;
};

export function BalanceSummaryCard({ group, members, currencySymbol, onAiClick }: BalanceSummaryCardProps) {
  const netAmount = group?.balance?.netAmount ? Number(group.balance.netAmount) : 0;
  const isCreditor = netAmount > 0;
  const isDebtor = netAmount < 0;
  const currencyCode = group?.currencyCode || 'INR';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 mb-6 group"
    >
      <svg className="absolute top-1/2 right-0 -translate-y-1/2 w-2/3 h-full opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0 80 Q 20 60, 40 70 T 70 30 T 100 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

      <button
         onClick={onAiClick}
         className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-2 sm:p-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group/ai"
         aria-label="Group AI Insights"
      >
         <Sparkles className="w-5 h-5 group-hover/ai:text-purple-200 transition-colors" />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
            <Wallet className="w-4 h-4" />
            <span>Group Total Spent</span>
          </div>
          <div className="text-5xl font-extrabold tracking-tight">
            {formatCurrency(group?.totalExpenses || '0.00', currencyCode)}
          </div>
        </div>

        <div className="flex gap-6 sm:gap-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
              <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
              {isCreditor ? 'You are owed' : 'Owed to you'}
            </div>
            <div className="text-xl font-bold text-white">
              {isCreditor ? `+${formatCurrency(Math.abs(netAmount).toFixed(2), currencyCode)}` : formatCurrency('0.00', currencyCode)}
            </div>
          </div>
          <div className="w-px bg-white/20" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
              <ArrowUpRight className="w-4 h-4 text-rose-300" />
              You owe
            </div>
            <div className="text-xl font-bold text-white">
              {isDebtor ? formatCurrency(Math.abs(netAmount).toFixed(2), currencyCode) : formatCurrency('0.00', currencyCode)}
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-6 md:mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        {members.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-indigo-50/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            <Sparkles className="w-4 h-4 text-purple-200 shrink-0" />
            <span className="truncate">Top Spender: {members[0]?.displayName || 'User'} • {formatCurrency(members[0]?.balance?.paidAmount || '0.00', currencyCode)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
