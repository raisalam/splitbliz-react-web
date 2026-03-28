import React from 'react';
import { Info, Users } from '../../../constants/icons';
import { formatCurrency, formatCurrencyParts } from '../../../utils/formatCurrency';
import { CachedAvatar } from '../../../components/CachedAvatar';

type PayerSelectorProps = {
  members: any[];
  payers: Record<string, string>;
  selectedMemberIds: Set<string>;
  numAmount: number;
  currencyCode: string;
  currentUserId: string;
  onTogglePayer: (userId: string) => void;
  onPayerAmountChange: (userId: string, value: string) => void;
  payerValidation: { isValid: boolean };
  numericPayers: Record<string, number>;
};

export function PayerSelector({
  members,
  payers,
  selectedMemberIds,
  numAmount,
  currencyCode,
  currentUserId,
  onTogglePayer,
  onPayerAmountChange,
  payerValidation,
  numericPayers
}: PayerSelectorProps) {
  const currencyParts = formatCurrencyParts('0', currencyCode);
  const getInitial = (name?: string | null) => name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div className="space-y-3">
      {members.map(member => {
        const isPayer = payers[member.userPublicId] !== undefined;
        const payerVal = payers[member.userPublicId] || '';
        const equalShare = selectedMemberIds.size > 0 ? (numAmount / selectedMemberIds.size) : 0;
        const avatarValue = member.resolvedAvatar || member.avatarUrl || null;
        const isAvatarUrl = typeof avatarValue === 'string' && avatarValue.startsWith('http');
        const fallbackInitials = getInitial(member.displayName);
        return (
          <div key={member.userPublicId} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isPayer ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-500' : 'border-slate-100 dark:border-slate-800'}`}>
            <div onClick={() => onTogglePayer(member.userPublicId)} className="flex items-center gap-3 cursor-pointer flex-1">
              {isAvatarUrl ? (
                <CachedAvatar
                  src={avatarValue}
                  alt={member.displayName}
                  fallbackInitials={fallbackInitials}
                  className={`w-10 h-10 rounded-full object-cover transition-opacity ${!isPayer && 'opacity-40 grayscale'}`}
                />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-700 bg-slate-200 transition-opacity ${!isPayer && 'opacity-40 grayscale'}`}>
                  {avatarValue || fallbackInitials}
                </div>
              )}
              <div>
                <span className={`font-semibold text-base block ${isPayer ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {member.displayName} {member.userPublicId === currentUserId && '(You)'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Equal share: {formatCurrency(equalShare.toFixed(2), currencyCode)}
                </span>
              </div>
            </div>
            {isPayer && (
              <div className="relative w-28">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{currencyParts.symbol}</span>
                <input type="number" value={payerVal} onChange={(e) => onPayerAmountChange(member.userPublicId, e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-7 pr-3 text-right font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="0" />
              </div>
            )}
          </div>
        )
      })}
      <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Users className="w-5 h-5" />
        </div>
        <span className="font-medium">Multiple people paid</span>
      </div>
      {!payerValidation.isValid && (
        <div className="flex items-start gap-2 text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-4 rounded-xl text-sm font-medium">
          <Info className="w-5 h-5 shrink-0" />
          Diff: {formatCurrency(Math.abs(numAmount - Object.values(numericPayers).reduce((a, b) => a + b, 0)).toFixed(2), currencyCode)} off from the total.
        </div>
      )}
    </div>
  );
}
