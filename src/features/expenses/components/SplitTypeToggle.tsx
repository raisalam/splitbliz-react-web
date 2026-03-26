import React from 'react';
import { SplitType } from '../../../utils/expenseCalculator';

type SplitTypeToggleProps = {
  value: SplitType;
  onChange: (value: SplitType) => void;
};

export function SplitTypeToggle({ value, onChange }: SplitTypeToggleProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      {[{ id: 'EQUAL', label: '=', title: 'Equal' }, { id: 'PERCENTAGE', label: '%', title: 'Percent' }, { id: 'FIXED', label: '123', title: 'Fixed' }].map((type) => (
        <button
          key={type.id} onClick={() => onChange(type.id as SplitType)}
          className={`py-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all ${value === type.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
        >
          <span className="text-2xl font-black opacity-80">{type.label}</span>
          <span className="text-sm font-bold">{type.title}</span>
        </button>
      ))}
    </div>
  );
}
