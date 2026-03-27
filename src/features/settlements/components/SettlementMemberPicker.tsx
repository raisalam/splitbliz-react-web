import React from 'react';
import { Check } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

type BalanceInfo = { amount: number; direction: 'owe' | 'owed' };

type SettlementMemberPickerProps = {
  members: any[];
  mode: 'FROM' | 'TO';
  selectedUserId: string;
  currentUserId: string;
  currencyCode: string;
  getBalanceWithMember: (memberId: string) => BalanceInfo;
  onSelect: (memberId: string, balanceInfo?: BalanceInfo) => void;
};

export function SettlementMemberPicker({
  members,
  mode,
  selectedUserId,
  currentUserId,
  currencyCode,
  getBalanceWithMember,
  onSelect
}: SettlementMemberPickerProps) {
  return (
    <div className="space-y-2 py-2">
      {members.map((member: any) => {
        const isSelected = member.userPublicId === selectedUserId;
        const displayName = member.userPublicId === currentUserId ? `${member.displayName} (You)` : member.displayName;

        const balanceInfo = mode === 'TO' ? getBalanceWithMember(member.userPublicId) : null;
        const borderColor = balanceInfo
          ? (balanceInfo.direction === 'owe' ? 'border-l-rose-500' : 'border-l-emerald-500')
          : '';

        return (
          <button
            key={member.userPublicId}
            onClick={() => onSelect(member.userPublicId, balanceInfo || undefined)}
            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all active:scale-[0.98] ${
              mode === 'TO' ? `border-l-4 ${borderColor}` : ''
            } ${
              isSelected
                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-500'
                : `bg-slate-50 dark:bg-slate-800/50 ${mode === 'TO' ? '' : 'border-2 border-transparent'} hover:bg-slate-100 dark:hover:bg-slate-800`
            }`}
          >
            <img
              src={member.avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">{displayName}</p>
              {member.role === 'OWNER' && (
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Owner</span>
              )}
            </div>
            {mode === 'TO' && balanceInfo && balanceInfo.amount > 0 && (
              <span className={`text-sm font-bold ${
                balanceInfo.direction === 'owe'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {balanceInfo.direction === 'owe' ? 'You owe' : 'Owes you'} {formatCurrency(balanceInfo.amount.toFixed(2), currencyCode)}
              </span>
            )}
            {isSelected && (
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
