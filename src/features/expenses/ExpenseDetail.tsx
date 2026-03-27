import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, User, Receipt, Banknote, Edit3, Trash2, MoreHorizontal, Plus, X } from 'lucide-react';
import { colors } from '../../constants/colors';
import { Skeleton } from '../../components/ui/skeleton';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { expensesService, groupsService } from '../../services';
import { useUser } from '../../providers/UserContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { EXPENSE_ACTION_EMOJI, EXPENSE_CATEGORY_EMOJI, UI_EMOJI } from '../../constants/emoji';

export function ExpenseDetail() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: groupDetail, isLoading: groupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsService.getGroupDetail(groupId || ''),
    enabled: !!groupId,
  });
  const group = groupDetail?.group;
  const members = groupDetail?.members ?? [];

  const { data: expense, isLoading: expenseLoading } = useQuery({
    queryKey: ['expense', groupId, expenseId],
    queryFn: () => expensesService.getExpense(groupId || '', expenseId || ''),
    enabled: !!groupId && !!expenseId,
  });

  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const deleteExpenseMutation = useMutation({
    mutationFn: async () => {
      if (!groupId || !expenseId) {
        throw new Error('Missing group or expense id');
      }
      await expensesService.deleteExpense(groupId, expenseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense', groupId, expenseId] });
      navigate(-1);
    },
  });

  if (groupLoading || expenseLoading || !expense) {
    return (
      <div className="min-h-screen font-sans pb-10 flex flex-col" style={{ backgroundColor: colors.pageBg }}>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-6 w-2/3 rounded-lg" />
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currencyCode = expense.currencyCode || group?.currencyCode || 'INR';
  const formattedAmount = formatCurrency(expense.amount, currencyCode);
  const payer = expense.payers?.[0];
  const currentUserId = user?.id || '';
  const isCreatorOrAdmin = expense.createdBy?.userId === currentUserId || group?.myRole === 'OWNER';
  const canEdit = expense.isEditable || isCreatorOrAdmin;
  const canDelete = expense.isDeletable || isCreatorOrAdmin;

  const formattedDate = new Date(expense.expenseDate || expense.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const categoryEmoji = EXPENSE_CATEGORY_EMOJI[expense.category] || EXPENSE_CATEGORY_EMOJI.OTHER;
  const participants = expense.splits || [];

  const getParticipantStatus = (participant: any) => {
    if (participant.userId === currentUserId) return 'YOU';
    if (participant.isSettled) return 'SETTLED';
    if (participant.settledAmount === participant.splitAmount) return 'SETTLED';
    return 'OWES';
  };

  const visibleParticipants = showAllMembers ? participants : participants.slice(0, 4);
  const hiddenCount = Math.max(0, participants.length - 4);

  return (
    <div className="min-h-screen font-sans pb-10 flex flex-col" style={{ backgroundColor: colors.pageBg }}>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 h-16" style={{ borderBottom: `0.5px solid ${colors.border}` }}>
        <button
          onClick={() => navigate(-1)}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: colors.primaryFaint }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: colors.primary }} />
        </button>

        <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
          Expense detail
        </h1>

        <button
          onClick={() => setActionsSheetOpen(true)}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: colors.pageBg }}
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: colors.textMuted }} />
        </button>
      </header>

      {/* Hero Banner */}
      <div
        className="p-4"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-[44px] h-[44px] rounded-full flex items-center justify-center text-xl shrink-0"
            style={{
              background: colors.white20,
              border: '2px solid rgba(255,255,255,0.35)'
            }}
          >
            {categoryEmoji}
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">{expense.title}</h2>
            <p className="mt-0.5" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{group?.name || 'Group'}</p>
          </div>
        </div>

        <div className="mt-4 mb-3">
          <span className="font-extrabold text-white" style={{ fontSize: '26px' }}>
            {formattedAmount}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 flex items-center gap-1.5" style={{ background: colors.white18, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px' }}>
            <span className="text-white font-medium" style={{ fontSize: '9px' }}>
              {expense.splitType === 'EQUAL' ? `${UI_EMOJI.SPLIT_EQUAL} Equal split` : `${UI_EMOJI.SPLIT_CUSTOM} Custom split`}
            </span>
          </div>
          <div className="px-3 py-1 flex items-center gap-1.5" style={{ background: colors.white18, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px' }}>
            <span className="text-white font-medium" style={{ fontSize: '9px' }}>
              {UI_EMOJI.CALENDAR} {formattedDate}
            </span>
          </div>
          <div className="px-3 py-1 flex items-center gap-1.5" style={{ background: colors.white18, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px' }}>
            <span className="text-white font-medium capitalize" style={{ fontSize: '9px' }}>
              {categoryEmoji} {expense.category?.toLowerCase() || 'expense'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Paid By Card */}
        <div>
          <h3 className="mb-2 font-bold uppercase" style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.06em', marginLeft: '8px' }}>
            PAID BY
          </h3>
          <div className="bg-white p-4" style={{ border: '0.5px solid #e8e4f8', borderRadius: '14px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {payer?.resolvedAvatar ? (
                  <img src={payer.resolvedAvatar} className="w-[32px] h-[32px] rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-[32px] h-[32px] rounded-full bg-slate-200" />
                )}
                <div>
                  <p className="font-semibold text-[#1a1625] text-xs">{payer?.displayName || 'Unknown'}</p>
                  <p className="mt-0.5" style={{ fontSize: '10px', color: colors.textMuted }}>Paid full amount</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="font-bold text-[#1a1625] text-xs">
                  {formattedAmount}
                </span>
                <span className="px-2.5 py-0.5 font-semibold" style={{ background: colors.successLight, color: colors.success, borderRadius: '20px', fontSize: '9px' }}>
                  Paid
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Split Between Card */}
        <div>
          <h3 className="mb-2 font-bold uppercase" style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.06em', marginLeft: '8px' }}>
            SPLIT BETWEEN - {participants.length} MEMBERS
          </h3>
          <div className="bg-white p-4" style={{ border: '0.5px solid #e8e4f8', borderRadius: '14px' }}>
            <div className="space-y-4">
              {visibleParticipants.map((p: any) => {
                const m = members.find(mb => mb.userId === p.userId);
                const isMe = p.userId === currentUserId;
                const isPayer = payer?.userId === p.userId;
                const status = getParticipantStatus(p);

                // Badge colors
                let badgeStyle = {};
                let badgeText = '';
                if (status === 'SETTLED') {
                  badgeStyle = { background: colors.successLight, color: colors.success };
                  badgeText = 'Settled';
                } else if (status === 'OWES') {
                  badgeStyle = { background: '#fceaea', color: '#e24b4a' };
                  badgeText = 'Owes';
                } else {
                  badgeStyle = { background: '#ede9ff', color: colors.primary };
                  badgeText = 'Pending';
                }

                // Random pastel colors for simple avatar
                const pastelColors = ['#e6f1fb', '#fceaea', '#faeeda', colors.successLight, '#ede9ff'];
                const displayName = p.displayName || m?.displayName || 'Unknown';
                const letter = displayName[0]?.toUpperCase() || '?';
                const avatarColor = pastelColors[p.userId.charCodeAt(p.userId.length - 1) % pastelColors.length];

                return (
                  <div key={p.userId}
                    className="flex items-center justify-between"
                    onClick={() => m && navigate(`/group/${groupId}/balance/${p.userId}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center font-bold text-[#1a1625]" style={{ backgroundColor: avatarColor, fontSize: '11px' }}>
                        {letter}
                      </div>
                      <p className="font-medium text-[#1a1625]" style={{ fontSize: '11px' }}>
                        {displayName}
                        {isMe && <span className="ml-1" style={{ color: colors.textMuted }}>(you)</span>}
                        {isPayer && !isMe && <span className="ml-1" style={{ color: colors.textMuted }}>(paid)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1a1625]" style={{ fontSize: '11px' }}>
                        {formatCurrency(p.splitAmount || '0', currencyCode)}
                      </span>
                      <span className="px-2 py-0.5 font-semibold" style={{ ...badgeStyle, borderRadius: '4px', fontSize: '9px' }}>
                        {badgeText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {!showAllMembers && hiddenCount > 0 && (
              <button
                onClick={() => setShowAllMembers(true)}
                className="w-full mt-4 pt-4 border-t"
                style={{ borderTopColor: colors.border, fontSize: '10px', fontWeight: 600, color: colors.primary }}
              >
                View all {participants.length} members
              </button>
            )}
          </div>
        </div>

        {/* Notes Card */}
        {expense.notes && (
          <div>
            <h3 className="mb-2 font-bold uppercase" style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.06em', marginLeft: '8px' }}>
              NOTES
            </h3>
            <div className="bg-white p-4" style={{ border: '0.5px solid #e8e4f8', borderRadius: '14px' }}>
              <p style={{ fontSize: '11px', color: '#5f5e5a', lineHeight: 1.4 }}>
                {expense.notes}
              </p>
            </div>
          </div>
        )}

        {/* Receipt Card */}
        {(expense.receiptUrl || !expense.notes) && (
          <div>
            <h3 className="mb-2 font-bold uppercase" style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.06em', marginLeft: '8px' }}>
              RECEIPT
            </h3>
            <div className="bg-white" style={{ border: '0.5px solid #e8e4f8', borderRadius: '14px' }}>
              {expense.receiptUrl ? (
                <button
                  onClick={() => setReceiptViewOpen(true)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#ede9ff' }}>
                      {EXPENSE_ACTION_EMOJI.RECEIPT}
                    </div>
                    <span className="font-semibold" style={{ fontSize: '11px', color: colors.primary }}>
                      View attached receipt
                    </span>
                  </div>
                  <ChevronRight color="#6c5ce7" />
                </button>
              ) : (
                <div className="p-4 flex items-center gap-3 opacity-60">
                  <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-[#9490b8]" style={{ backgroundColor: colors.pageBg }}>
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="font-medium" style={{ fontSize: '11px', color: colors.textMuted }}>
                    Add note or receipt
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions Bottom Sheet */}
      <AnimatePresence>
        {actionsSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActionsSheetOpen(false)}
              className="fixed inset-0 z-[60] bg-[#1a1625]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white flex flex-col font-sans"
              style={{ borderRadius: '24px 24px 0 0' }}
            >
              <div className="pt-4 pb-4 px-6 relative bg-white" style={{ borderRadius: '24px 24px 0 0' }}>
                <div className="flex justify-center mb-4">
                  <div className="w-[32px] h-[3px] rounded-full" style={{ backgroundColor: colors.border }} />
                </div>
                <div className="text-center mb-2">
                  <h3 className="font-bold text-[#1a1625] text-xs" style={{ color: colors.textPrimary }}>
                    {expense.title} - {formattedAmount}
                  </h3>
                </div>
              </div>

              <div className="px-4 pb-10 space-y-1">
                {canEdit && (
                  <button
                    onClick={() => {
                      setActionsSheetOpen(false);
                      navigate(`/group/${groupId}/add-expense?edit=${expenseId}`);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f4f2fb]"
                  >
                    <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#ede9ff' }}>
                      {EXPENSE_ACTION_EMOJI.EDIT}
                    </div>
                    <span className="font-semibold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Edit expense</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActionsSheetOpen(false);
                    const lines = [
                      `Expense: ${expense.title}`,
                      `Amount: ${formattedAmount}`,
                      `Group: ${group?.name ?? 'Group'}`,
                      `Date: ${formattedDate}`,
                    ];
                    const shareText = lines.join('\n');
                    if (navigator.share) {
                      navigator.share({ title: 'Expense breakdown', text: shareText }).catch(() => {});
                    } else {
                      navigator.clipboard?.writeText(shareText).catch(() => {});
                    }
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f4f2fb]"
                >
                  <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#e6f1fb' }}>
                    {EXPENSE_ACTION_EMOJI.SHARE}
                  </div>
                  <span className="font-semibold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Share breakdown</span>
                </button>

                {canEdit && (
                  <>
                    <button
                      onClick={() => {
                        setActionsSheetOpen(false);
                        navigate(`/group/${groupId}/add-expense?duplicate=${expenseId}`);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f4f2fb]"
                    >
                      <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#faeeda' }}>
                        {EXPENSE_ACTION_EMOJI.DUPLICATE}
                      </div>
                      <span className="font-semibold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Duplicate expense</span>
                    </button>

                    {canDelete && (
                      <button
                        onClick={() => {
                          setActionsSheetOpen(false);
                          setTimeout(() => setDeleteConfirmOpen(true), 200);
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#fceaea]/50"
                      >
                        <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#fceaea' }}>
                          {EXPENSE_ACTION_EMOJI.DELETE}
                        </div>
                        <span className="font-semibold" style={{ color: '#e24b4a', fontSize: '13px' }}>Delete expense</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Sheet */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmOpen(false)}
              className="fixed inset-0 z-[80] bg-[#1a1625]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[90] bg-white p-6 pb-10"
              style={{ borderRadius: '24px 24px 0 0' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fceaea', color: '#e24b4a' }}>
                <Trash2 className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-[#1a1625] text-lg text-center mb-2" style={{ color: colors.textPrimary }}>
                Delete {expense.title}?
              </h3>
              <p className="text-center mb-8" style={{ fontSize: '13px', color: colors.textMuted }}>
                This cannot be undone. Balances will be recalculated.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="py-3.5 font-bold text-sm transition-colors active:scale-95"
                  style={{ backgroundColor: colors.pageBg, color: colors.textPrimary, borderRadius: '14px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    deleteExpenseMutation.mutate();
                  }}
                  className="py-3.5 font-bold text-sm text-white transition-colors active:scale-95 shadow-sm"
                  style={{ backgroundColor: '#e24b4a', borderRadius: '14px' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Full Screen Receipt Viewer */}
      <AnimatePresence>
        {receiptViewOpen && expense.receiptUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="flex items-center justify-between p-4 text-white">
              <span className="font-semibold text-sm">Receipt</span>
              <button onClick={() => setReceiptViewOpen(false)} className="p-2 bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img src={expense.receiptUrl} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ChevronRight SVG inline for Receipt row
const ChevronRight = ({ color = "currentColor" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
