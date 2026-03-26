import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { colors } from '../constants/colors';
import { CachedAvatar } from './CachedAvatar';

export interface PendingApproval {
  id: string;
  user: {
    displayName: string;
    avatarUrl: string;
  };
  groupName: string;
  amount: string;
  currencyCode: string;
  time: string;
}

interface PendingApprovalsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  approvals: PendingApproval[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onApproveAll: () => Promise<void>;
}

export function PendingApprovalsSheet({ isOpen, onClose, approvals, onApprove, onReject, onApproveAll }: PendingApprovalsSheetProps) {
  const [rejectConfirmId, setRejectConfirmId] = useState<string | null>(null);
  const [showApproveAllConfirm, setShowApproveAllConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const totalAmount = approvals.reduce((sum, a) => sum + parseFloat(a.amount.replace(/,/g, '')), 0);
  const formattedTotal = totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  const currencySymbol = approvals[0]?.currencyCode === 'INR' ? '₹' : '$';

  const handleApproveAllConfirm = async () => {
    setIsProcessing(true);
    await onApproveAll();
    setIsProcessing(false);
    setShowApproveAllConfirm(false);
    onClose();
  };

  const handleRejectConfirm = async (id: string) => {
    setIsProcessing(true);
    await onReject(id);
    setIsProcessing(false);
    setRejectConfirmId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onClose()}
            className="fixed inset-0 z-[60] bg-[#1a1625]/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white shadow-2xl flex flex-col font-sans"
            style={{ maxHeight: '85vh', borderRadius: '24px 24px 0 0' }}
          >
            {/* Drag Handle & Header */}
            <div className="pt-4 pb-4 px-6 relative bg-white z-[71]" style={{ borderRadius: '24px 24px 0 0' }}>
              <div className="flex justify-center mb-5">
                <div className="w-[32px] h-[3px] rounded-full" style={{ backgroundColor: colors.border }} />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Pending approvals</h3>
                  <p className="mt-0.5" style={{ fontSize: '10px', color: colors.textMuted }}>{approvals.length} requests waiting</p>
                </div>
                {approvals.length > 1 && (
                  <button 
                    onClick={() => setShowApproveAllConfirm(true)}
                    className="px-4 py-1.5 font-bold transition-all active:scale-95 flex-shrink-0"
                    style={{ backgroundColor: colors.successLight, color: colors.success, borderRadius: '20px', fontSize: '10px' }}
                  >
                    ✓ Approve all
                  </button>
                )}
              </div>
            </div>

            {/* Total Bar */}
            <div className="px-6 py-3 flex justify-between items-center z-[71]" style={{ backgroundColor: colors.pageBg, borderBottom: `0.5px solid ${colors.primaryFaint}` }}>
              <span className="font-bold text-[#3d3a4a] text-xs">Total amount</span>
              <span className="font-bold text-[#1a1625] text-xs" style={{ color: colors.textPrimary }}>{currencySymbol}{formattedTotal}</span>
            </div>

            {/* List */}
            <div className="overflow-y-auto px-6 py-2 hide-scrollbar pb-10 flex-1 relative z-[70]">
              {approvals.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-3xl mb-2 text-[#9490b8] block" style={{ color: colors.textMuted }}>🎉</span>
                  <p className="font-bold text-[#3d3a4a] text-sm">All caught up!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {approvals.map((approval) => (
                    <motion.div 
                      key={approval.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between py-4"
                      style={{ borderBottom: `0.5px solid ${colors.primaryFaint}` }}
                    >
                      <div className="flex items-center gap-3 pr-2">
                        <CachedAvatar src={approval.user.avatarUrl} alt={approval.user.displayName} className="w-[32px] h-[32px] rounded-full object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1a1625] leading-tight truncate" style={{ fontSize: '11px', color: colors.textPrimary }}>{approval.user.displayName}</p>
                          <p className="mt-0.5 truncate" style={{ fontSize: '9px', color: colors.textMuted }}>Bank / UPI • {approval.time}</p>
                          <p className="mt-0.5 font-semibold truncate" style={{ fontSize: '9px', color: colors.primary }}>{approval.groupName}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-bold text-[#1a1625] text-xs" style={{ color: colors.textPrimary }}>{currencySymbol}{approval.amount}</span>
                        
                        {rejectConfirmId === approval.id ? (
                          <div className="flex gap-2">
                             <button onClick={() => setRejectConfirmId(null)} className="px-3 py-1.5 rounded-lg text-[10px] bg-slate-100 text-[#3d3a4a] font-semibold">Cancel</button>
                             <button onClick={() => handleRejectConfirm(approval.id)} className="px-3 py-1.5 rounded-lg text-[10px] bg-rose-100 text-rose-600 font-bold">Reject</button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5 items-center">
                            <button 
                              onClick={() => {
                                setIsProcessing(true);
                                onApprove(approval.id).then(() => {
                                  toast.success('Approved');
                                }).finally(() => setIsProcessing(false));
                              }}
                              className="px-3 h-[28px] flex items-center justify-center gap-1 transition-colors active:scale-95"
                              style={{ backgroundColor: colors.primary, color: 'white', borderRadius: '6px', fontSize: '9px', fontWeight: 700 }}
                            >
                              <Check className="w-3 h-3" strokeWidth={3} /> Approve
                            </button>
                            <button 
                              onClick={() => setRejectConfirmId(approval.id)}
                              className="w-[28px] h-[28px] flex items-center justify-center transition-colors active:scale-95"
                              style={{ backgroundColor: colors.pageBg, color: colors.textMuted, borderRadius: '6px' }}
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Internal nested Approve All Confirmation Sheet */}
            <AnimatePresence>
              {showApproveAllConfirm && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setShowApproveAllConfirm(false)}
                    className="absolute inset-0 z-[72] bg-white/80 backdrop-blur-sm rounded-t-[24px]"
                  />
                  <motion.div
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 z-[73] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[24px] p-6 pb-10"
                  >
                    <p className="font-bold text-[#1a1625] text-center mb-6" style={{ fontSize: '15px', color: colors.textPrimary }}>
                      Approve all {approvals.length} payments totalling {currencySymbol}{formattedTotal}?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setShowApproveAllConfirm(false)}
                        className="py-3 font-bold text-[#3d3a4a] text-sm rounded-xl transition-colors active:scale-95"
                        style={{ backgroundColor: colors.pageBg }}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleApproveAllConfirm}
                        className="py-3 font-bold text-sm text-white rounded-xl transition-colors active:scale-95 shadow-sm"
                        style={{ backgroundColor: colors.success }}
                      >
                        Yes, approve all
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
