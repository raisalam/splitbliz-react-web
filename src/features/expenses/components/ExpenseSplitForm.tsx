import React from 'react';
import { Info } from 'lucide-react';
import { SplitType } from '../../../utils/expenseCalculator';
import { SplitTypeToggle } from './SplitTypeToggle';

type ExpenseSplitFormProps = {
  splitType: SplitType;
  numAmount: number;
  members: any[];
  selectedMemberIds: Set<string>;
  customSplits: Record<string, string>;
  onSplitTypeChange: (value: SplitType) => void;
  onCustomSplitChange: (userId: string, value: string) => void;
  splitValidation: { isValid: boolean; errorMsg?: string };
  currencyCode: string;
};

export function ExpenseSplitForm({
  splitType,
  numAmount,
  members,
  selectedMemberIds,
  customSplits,
  onSplitTypeChange,
  onCustomSplitChange,
  splitValidation,
  currencyCode
}: ExpenseSplitFormProps) {
  return (
    <div className="flex flex-col">
      <SplitTypeToggle value={splitType} onChange={onSplitTypeChange} />

      {splitType !== 'EQUAL' && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Adjust Shares</h4>
          {members.filter(m => selectedMemberIds.has(m.userPublicId)).map(member => (
            <div key={member.userPublicId} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <img src={member.avatarUrl} alt={member.displayName} className="w-8 h-8 rounded-full" />
                <span className="font-semibold">{member.displayName}</span>
              </div>
              <div className="relative w-32">
                {splitType === 'FIXED' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{currencyCode === 'INR' ? '₹' : '$'}</span>}
                <input type="number"
                  value={customSplits[member.userPublicId] || ''}
                  onChange={(e) => onCustomSplitChange(member.userPublicId, e.target.value)}
                  className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${splitType === 'PERCENTAGE' ? 'px-3 pr-8' : 'pl-7 pr-3'}`}
                />
                {splitType === 'PERCENTAGE' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>}
              </div>
            </div>
          ))}

          {!splitValidation.isValid && (
            <div className="text-rose-500 text-sm font-medium mt-2 flex items-center gap-1.5"><Info className="w-4 h-4" /> {splitValidation.errorMsg}</div>
          )}
        </div>
      )}

      {splitType !== 'EQUAL' && (() => {
        const totalAssigned = Object.entries(customSplits)
          .filter(([id]) => selectedMemberIds.has(id))
          .reduce((sum, [, val]) => sum + (parseFloat(val) || 0), 0);
        const target = splitType === 'PERCENTAGE' ? 100 : numAmount;
        const diff = target - totalAssigned;
        const isBalanced = Math.abs(diff) < 0.01;
        const isOver = diff < -0.01;
        return (
          <div className={`sticky bottom-0 mt-4 flex items-center justify-between p-3.5 rounded-xl text-sm font-semibold shadow-lg ${
            isBalanced ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : isOver ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
            : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            <span>Total: {totalAssigned.toFixed(2)}{splitType === 'PERCENTAGE' ? '%' : ''}</span>
            <span>
              {isBalanced ? '✓ Balanced' : isOver ? `Over by ${Math.abs(diff).toFixed(2)}${splitType === 'PERCENTAGE' ? '%' : ''}` : `Remaining: ${diff.toFixed(2)}${splitType === 'PERCENTAGE' ? '%' : ''}`}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
