import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowDownLeft, ArrowUp, ArrowUpRight, Wallet } from '../../../constants/icons';
import { formatCurrency } from '../../../utils/formatCurrency';

type HeroBalanceCardProps = {
  totalOwed: number;
  totalOwe: number;
  net: number;
  currencyCode: string;
};

export function HeroBalanceCard({ totalOwed, totalOwe, net, currencyCode }: HeroBalanceCardProps) {
  const isPositive = net >= 0;
  const absNet = Math.abs(net);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 mb-10"
    >
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
            <Wallet className="w-4 h-4" />
            <span>Total Balance</span>
          </div>
          <div
            className={`text-5xl font-extrabold tracking-tight flex items-center gap-3 ${
              isPositive ? 'text-emerald-200' : 'text-rose-200'
            }`}
          >
            {isPositive ? <ArrowUp className="w-7 h-7" /> : <ArrowDown className="w-7 h-7" />}
            {isPositive ? '+' : '-'}
            {formatCurrency(absNet.toFixed(2), currencyCode)}
          </div>
        </div>

        <div className="flex gap-6 sm:gap-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
              <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
              You are owed
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(totalOwed.toFixed(2), currencyCode)}
            </div>
          </div>
          <div className="w-px bg-white/20"></div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
              <ArrowUpRight className="w-4 h-4 text-rose-300" />
              You owe
            </div>
            <div className="text-xl font-bold text-white">
              {formatCurrency(totalOwe.toFixed(2), currencyCode)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
