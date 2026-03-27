import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { formatCurrencyParts } from '../../../utils/formatCurrency';
import { EXPENSE_CATEGORY_CHIPS } from '../../../constants/emoji';

type ExpenseBasicFormProps = {
  amountStr: string;
  numAmount: number;
  currencyCode: string;
  selectedCategory: string;
  onAmountChange: (value: string) => void;
  onSelectCategory: (value: string) => void;
  onNext: () => void;
};

export function ExpenseBasicForm({
  amountStr,
  numAmount,
  currencyCode,
  selectedCategory,
  onAmountChange,
  onSelectCategory,
  onNext
}: ExpenseBasicFormProps) {
  const currencyParts = formatCurrencyParts('0', currencyCode);
  return (
    <motion.div
      key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center flex-1 justify-center space-y-8"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-8 w-full">
        <h2 className="text-slate-400 font-medium tracking-wide uppercase text-sm">Enter Amount</h2>
        <div className="flex items-center justify-center text-7xl font-bold tracking-tighter text-slate-900 dark:text-white">
          <span className="text-slate-400/60 mr-2 text-5xl font-medium">{currencyParts.symbol}</span>
          <input
            autoFocus type="number" value={amountStr} onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0" className="bg-transparent border-none outline-none focus:ring-0 p-0 text-center w-full max-w-[250px] font-bold caret-indigo-500 placeholder:text-slate-200 dark:placeholder:text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && numAmount > 0) onNext(); }}
          />
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar -mx-2">
          <div className="flex gap-2 px-2 pb-2 w-max">
            {EXPENSE_CATEGORY_CHIPS.map(cat => (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat.key
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: numAmount > 0 ? 1 : 0 }}
          disabled={numAmount <= 0} onClick={onNext}
          className="w-full max-w-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white rounded-2xl py-4 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 font-bold text-lg active:scale-[0.98]"
        >
          Continue
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </motion.button>
      </div>
    </motion.div>
  );
}
