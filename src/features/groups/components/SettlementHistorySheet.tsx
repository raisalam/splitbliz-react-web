import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Settlement } from '../../../types';
import { EmptyState } from '../../../components/EmptyState';
import { SettlementRow } from './SettlementRow';

type SettlementHistorySheetProps = {
  open: boolean;
  fromId: string;
  toId: string;
  settlements: Settlement[];
  currentUserId: string;
  currencyCode: string;
  getMemberName: (userId: string) => string;
  onClose: () => void;
};

export function SettlementHistorySheet({
  open,
  fromId,
  toId,
  settlements,
  currentUserId,
  currencyCode,
  getMemberName,
  onClose,
}: SettlementHistorySheetProps) {
  if (!open) return null;

  const history = settlements
    .filter((s: Settlement) =>
      (s.fromUser?.userId === fromId && s.toUser?.userId === toId) ||
      (s.fromUser?.userId === toId && s.toUser?.userId === fromId)
    )
    .sort((a: Settlement, b: Settlement) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const otherMemberId = fromId === currentUserId ? toId : fromId;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="pt-4 pb-2 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Settlements with {getMemberName(otherMemberId)}
                </h3>
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-12 pt-4 overflow-y-auto">
              {history.length === 0 ? (
                <EmptyState
                  title="All settled up"
                  description="No pending settlements in this group."
                />
              ) : (
                <div className="space-y-4">
                  {history.map((s: any) => (
                    <SettlementRow
                      key={s.id}
                      settlement={s}
                      currencyCode={currencyCode}
                      currentUserId={currentUserId}
                      getMemberName={getMemberName}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
