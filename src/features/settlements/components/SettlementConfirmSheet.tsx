import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

type SettlementConfirmSheetProps = {
  currencySymbol: string;
  numAmount: number;
  toName: string;
  onBack: () => void;
};

export function SettlementConfirmSheet({
  currencySymbol,
  numAmount,
  toName,
  onBack
}: SettlementConfirmSheetProps) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center flex-1 py-20 space-y-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
        className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"
      >
        <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Request Sent</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          {currencySymbol}{numAmount.toFixed(2)} sent to <span className="font-semibold text-slate-900 dark:text-white">{toName}</span> for approval
        </p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onBack}
        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
      >
        Back to Group
      </motion.button>
    </motion.div>
  );
}
