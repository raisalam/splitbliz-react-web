import React from 'react';
import { Check, Clock, X } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';

type SettlementRowProps = {
  settlement: any;
  currencyCode: string;
  currentUserId: string;
  getMemberName: (userId: string) => string;
};

export function SettlementRow({ settlement, currencyCode, currentUserId, getMemberName }: SettlementRowProps) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 ${
      settlement.status === 'PENDING' ? 'border-l-amber-400 bg-amber-50/50 dark:bg-amber-500/5' :
      settlement.status === 'APPROVED' ? 'border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5' :
      'border-l-rose-400 bg-rose-50/50 dark:bg-rose-500/5'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
        settlement.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
        settlement.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
        'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
      }`}>
        {settlement.status === 'PENDING' ? <Clock className="w-4 h-4" /> :
         settlement.status === 'APPROVED' ? <Check className="w-4 h-4" /> :
         <X className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(settlement.amount, currencyCode)}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            settlement.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
            settlement.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
          }`}>
            {settlement.status === 'PENDING' ? 'Pending' : settlement.status === 'APPROVED' ? 'Settled' : 'Rejected'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {getMemberName(settlement.fromUser?.userId || settlement.fromUserPublicId)} → {getMemberName(settlement.toUser?.userId || settlement.toUserPublicId)}
        </p>
        {(settlement.notes || settlement.note) && <p className="text-xs text-slate-400 mt-0.5">"{settlement.notes || settlement.note}"</p>}
        <p className="text-xs text-slate-400 mt-1">
          {new Date(settlement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
