import React from 'react';
import { AlertCircle, Banknote, ChevronRight } from '../../../constants/icons';
import { toast } from 'sonner';
import { formatCurrency } from '../../../utils/formatCurrency';

type ActionBannerProps = {
  groupId: string;
  group: any;
  quickInsight?: any;
  currentUserId: string;
  topYouOwe: any[];
  topOwesYou: any[];
  onSettle: () => void;
  onSettleUser: (userId: string, amount: string, currencyCode?: string) => void;
  onRemind: (userId: string) => Promise<void>;
};

export function ActionBanner({
  groupId,
  group,
  quickInsight,
  currentUserId,
  topYouOwe,
  topOwesYou,
  onSettle,
  onSettleUser,
  onRemind,
}: ActionBannerProps) {
  const netAmount = group?.balance?.netAmount ? Number(group.balance.netAmount) : 0;
  const quickMeta = quickInsight?.cta?.meta ?? {};
  const quickUserId = quickMeta.userId as string | undefined;
  const quickAmount = quickMeta.amount as string | undefined;
  const quickCurrency = (quickMeta.currencyCode as string | undefined) || group.currencyCode;

  // Priority 1 - You owe money
  if (netAmount < 0) {
    const amount = Math.abs(netAmount).toFixed(2);
    const topOwed = topYouOwe[0];
    const topAmount = topOwed?.balance?.netAmount ? Math.abs(parseFloat(topOwed.balance.netAmount)).toFixed(2) : amount;
    const oweName = topOwed?.displayName || 'the group';
    const displayAmount = quickAmount && quickCurrency
      ? formatCurrency(quickAmount, quickCurrency)
      : formatCurrency(topAmount, group.currencyCode || 'INR');
    const bannerTitle = `You owe ${displayAmount} to ${oweName}`;

    return (
      <button
        onClick={() => {
          if (quickInsight?.cta?.action === 'SETTLE_USER' && quickUserId) {
            const settleAmount = quickAmount ?? amount;
            onSettleUser(quickUserId, settleAmount, quickCurrency);
            return;
          }
          onSettle();
        }}
        className="w-full flex items-center justify-between bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-3 sm:p-4 rounded-2xl mb-6 text-left hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-rose-900 dark:text-rose-100">
              {bannerTitle}
            </p>
            <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-0.5">
              Settle now
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-rose-400 shrink-0" />
      </button>
    );
  }

  // Priority 2 - You are owed money
  if (netAmount > 0) {
    const amount = netAmount.toFixed(2);
    const displayAmount = quickAmount && quickCurrency
      ? formatCurrency(quickAmount, quickCurrency)
      : formatCurrency(amount, group.currencyCode || 'INR');
    const bannerTitle = quickInsight?.type === 'YOU_ARE_OWED'
      ? `You are owed ${displayAmount}`
      : (topOwesYou[0]?.displayName
        ? `${topOwesYou[0].displayName} owes you ${displayAmount}`
        : `You are owed ${displayAmount}`);

    return (
      <button
        onClick={async () => {
          if (quickInsight?.cta?.action === 'REMIND_USER' && quickUserId && groupId) {
            await onRemind(quickUserId);
            return;
          }
          toast.success('Reminder sent!');
        }}
        className="w-full flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 sm:p-4 rounded-2xl mb-6 text-left hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900 dark:text-emerald-100">
              {bannerTitle}
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5">
              Send a reminder?
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0" />
      </button>
    );
  }

  return null;
}
