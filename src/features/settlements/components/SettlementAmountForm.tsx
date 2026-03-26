import React from 'react';
import { ChevronRight } from 'lucide-react';

type PaymentMethod = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type SettlementAmountFormProps = {
  currencySymbol: string;
  numAmount: number;
  paymentMethods: PaymentMethod[];
  paymentMethod: string;
  onAmountClick: () => void;
  onPaymentMethodChange: (value: string) => void;
};

export function SettlementAmountForm({
  currencySymbol,
  numAmount,
  paymentMethods,
  paymentMethod,
  onAmountClick,
  onPaymentMethodChange
}: SettlementAmountFormProps) {
  return (
    <>
      <div onClick={onAmountClick} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Amount</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">{currencySymbol}{numAmount.toFixed(2)}</span>
          <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 px-5">
        <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Via</span>
        <div className="flex items-center gap-2">
          {paymentMethods.map(pm => {
            const Icon = pm.icon;
            const isActive = paymentMethod === pm.id;
            return (
              <button
                key={pm.id}
                onClick={() => onPaymentMethodChange(pm.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {pm.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
