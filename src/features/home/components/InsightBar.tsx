import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type GroupSummary = {
  publicId: string;
  name: string;
  myNetInGroup: {
    direction: 'I_OWE' | 'CREDITOR' | 'SETTLED' | string;
    amount: string;
  };
};

type Insight = {
  emoji: string;
  text: React.ReactNode;
  bg: string;
  actionLabel: string;
  onAction: () => void;
};

type InsightBarProps = {
  groups: GroupSummary[];
  onNavigate: (path: string) => void;
  onSetActionSheetOrigin: (value: 'expense' | 'settle' | null) => void;
};

export function InsightBar({ groups, onNavigate, onSetActionSheetOrigin }: InsightBarProps) {
  const [index, setIndex] = useState(0);

  const insights = useMemo<Insight[]>(() => {
    const oweGroups = groups.filter(g => g.myNetInGroup.direction === 'I_OWE');
    const owedGroups = groups.filter(g => g.myNetInGroup.direction === 'CREDITOR');
    const settledGroups = groups.filter(g => g.myNetInGroup.direction === 'SETTLED');
    const totalOwe = oweGroups.reduce((sum, g) => sum + parseFloat(g.myNetInGroup.amount), 0);
    const totalOwed = owedGroups.reduce((sum, g) => sum + parseFloat(g.myNetInGroup.amount), 0);
    const topOwedGroup = [...owedGroups].sort((a, b) => parseFloat(b.myNetInGroup.amount) - parseFloat(a.myNetInGroup.amount))[0];
    const topOweGroup = [...oweGroups].sort((a, b) => parseFloat(b.myNetInGroup.amount) - parseFloat(a.myNetInGroup.amount))[0];

    const list: Insight[] = [];

    if (owedGroups.length > 0 && topOwedGroup) {
      list.push({
        emoji: 'ðŸ’°',
        text: <>You're owed <strong>â‚¹{totalOwed.toFixed(0)}</strong> across {owedGroups.length} group{owedGroups.length > 1 ? 's' : ''}. Nudge <strong>{topOwedGroup.name}</strong>?</>,
        bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        actionLabel: 'Nudge',
        onAction: () => onNavigate(`/group/${topOwedGroup.publicId}`),
      });
    }
    if (oweGroups.length > 0 && topOweGroup) {
      list.push({
        emoji: 'âš¡',
        text: <>You owe <strong>â‚¹{totalOwe.toFixed(0)}</strong> across {oweGroups.length} group{oweGroups.length > 1 ? 's' : ''}. Settle <strong>{topOweGroup.name}</strong> first?</>,
        bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
        actionLabel: 'Settle',
        onAction: () => onSetActionSheetOrigin('settle'),
      });
    }
    if (settledGroups.length > 0) {
      list.push({
        emoji: 'ðŸŽ‰',
        text: <><strong>{settledGroups.length}</strong> group{settledGroups.length > 1 ? 's' : ''} fully settled! Keep it up.</>,
        bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
        actionLabel: 'View',
        onAction: () => {},
      });
    }
    if (list.length === 0) {
      list.push({
        emoji: 'âœ¨',
        text: <>All clear! No pending balances.</>,
        bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        actionLabel: '',
        onAction: () => {},
      });
    }
    return list;
  }, [groups, onNavigate, onSetActionSheetOrigin]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % insights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const current = insights[index % insights.length];

  return (
    <div className="relative h-9 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${current.bg}`}
        >
          <span>{current.emoji}</span>
          <span className="truncate">{current.text}</span>
          {current.actionLabel && (
            <button
              onClick={(e) => { e.stopPropagation(); current.onAction(); }}
              className="ml-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/10 text-xs font-bold hover:bg-white/90 dark:hover:bg-white/20 transition-colors shrink-0"
            >
              {current.actionLabel}
            </button>
          )}
          {insights.length > 1 && (
            <div className="flex gap-1 ml-1 shrink-0">
              {insights.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index % insights.length ? 'bg-current opacity-80' : 'bg-current opacity-20'}`} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
