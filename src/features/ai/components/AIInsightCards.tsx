import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, AlertTriangle, Sparkles, ChevronRight, BarChart3 } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  TRAVEL: 'bg-sky-500', FOOD: 'bg-amber-500', RENT: 'bg-violet-500',
  ENTERTAINMENT: 'bg-rose-500', SHOPPING: 'bg-emerald-500', OTHER: 'bg-slate-500'
};
const CATEGORY_EMOJIS: Record<string, string> = {
  TRAVEL: '✈️', FOOD: '🍕', RENT: '🏠', ENTERTAINMENT: '🎬', SHOPPING: '🛍️', OTHER: '📦'
};

type AIInsightCardsProps = {
  insights: any;
  groupId: string | undefined;
  currentUserId: string;
  onNavigate: (path: string) => void;
};

export function AIInsightCards({
  insights,
  groupId,
  currentUserId,
  onNavigate
}: AIInsightCardsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Spender & Debtor Split Grid */}
        <div className="grid grid-cols-2 gap-4">
          {insights.topSpender && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Top Spender</h3>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <img src={insights.topSpender.avatarUrl} alt={insights.topSpender.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {insights.topSpender.userPublicId === currentUserId ? 'You' : insights.topSpender.displayName}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                    {insights.currencySymbol}{insights.topSpender.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {insights.topDebtor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-800/30 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm">Top Debtor</h3>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <img src={insights.topDebtor.avatarUrl} alt={insights.topDebtor.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {insights.topDebtor.userPublicId === currentUserId ? 'You' : insights.topDebtor.displayName}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate">
                    Owes {insights.currencySymbol}{insights.topDebtor.amountOwed.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Fairness Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex items-center gap-5"
        >
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
              <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" strokeWidth="3" strokeLinecap="round"
                className={insights.fairnessScore >= 70 ? 'text-emerald-500' : insights.fairnessScore >= 40 ? 'text-amber-500' : 'text-rose-500'}
                stroke="currentColor" initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${insights.fairnessScore}, 100` }} transition={{ duration: 1.5, delay: 0.8 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black">{insights.fairnessScore}%</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-1 flex items-center gap-1.5">
              Fairness Score
              {insights.fairnessScore >= 80 && <span className="flex w-2 h-2 rounded-full bg-emerald-500"></span>}
            </h3>
            <p className="text-sm text-slate-500">
              {insights.fairnessScore >= 80 ? 'Spending is well balanced.' : insights.fairnessScore >= 50 ? 'Some skew in spending.' : 'Highly imbalanced spending.'}
            </p>
          </div>
        </motion.div>

        {/* Expense Anomaly (If present) */}
        {insights.anomaly?.hasAnomaly && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-bold text-rose-600 dark:text-rose-400">Expense Anomaly Detected</h3>
            </div>
            <div className="flex justify-between items-end mt-2">
              <div className="flex-1">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {insights.anomaly.expenseTitle}
                </p>
                <p className="text-xs text-rose-500 mt-1 font-medium">{insights.anomaly.reason}</p>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white shrink-0 ml-4">
                {insights.currencySymbol}{insights.anomaly.expenseAmount?.toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Action Items / Settle Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 shadow-md text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl"><Sparkles className="w-5 h-5 text-white" /></div>
          <h3 className="font-bold text-lg">Smart Settlement Strategy</h3>
        </div>
        <p className="text-violet-100 leading-relaxed mb-5 relative z-10">{insights.settlement.strategyMessage}</p>
        {insights.settlement.unsettledTransactionCount > 0 && (
          <button
            onClick={() => onNavigate(`/group/${groupId}/settle`)}
            className="w-full relative z-10 py-3.5 bg-white hover:bg-slate-50 text-indigo-600 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            View Action Items <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Spending Breakdown Banner */}
      {insights.spendingBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm overflow-hidden"
        >
          <h3 className="font-bold flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Where your money goes
          </h3>
          <div className="w-full h-4 rounded-full flex overflow-hidden mb-6">
            {insights.spendingBreakdown.map((cat: any, i: number) => (
              <motion.div
                key={cat.category} initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 1, delay: 1.1 + (i * 0.1) }}
                className={`h-full border-r border-white/20 dark:border-black/20 last:border-0 ${CATEGORY_COLORS[cat.category] || 'bg-slate-500'}`}
                title={`${cat.category}: ${cat.percentage}%`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {insights.spendingBreakdown.map((cat: any) => (
              <div key={cat.category} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${CATEGORY_COLORS[cat.category] || 'bg-slate-500'}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate flex items-center gap-1.5">{CATEGORY_EMOJIS[cat.category] || '📦'} {cat.category}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{insights.currencySymbol}{cat.amount.toLocaleString()} ({cat.percentage}%)</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <div className="h-6"></div>
    </>
  );
}
