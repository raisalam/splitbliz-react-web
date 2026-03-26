import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MoreHorizontal, FileText, Edit2, Share, Copy, Trash2, X, Plus } from 'lucide-react';
import { getGroupById, getGroupMembers, getGroupExpenses, MOCK_USER_ID } from '../../api/groups';
import { colors } from '../../constants/colors';
import { Skeleton } from '../../components/ui/skeleton';

export function ExpenseDetail() {
  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expense, setExpense] = useState<any>(null);

  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [receiptViewOpen, setReceiptViewOpen] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!groupId || !expenseId) return;
      try {
        setLoading(true);
        const [g, m, e] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
          getGroupExpenses(groupId)
        ]);
        setGroup(g);
        setMembers(m);
        setExpense(e.content.find((exp: any) => exp.publicId === expenseId) || null);
      } catch (err) {
        console.error("Error fetching expense data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupId, expenseId]);

  if (loading || !expense) {
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

  const currencySymbol = expense.currencyCode === 'INR' ? '₹' : '$';
  const payer = members.find(m => m.userPublicId === expense.paidByUserPublicId);
  const isCreatorOrAdmin = expense.paidByUserPublicId === MOCK_USER_ID || members.find(m => m.userPublicId === MOCK_USER_ID)?.role === 'OWNER';
  
  const formattedDate = new Date(expense.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  // Logic to determine settlement status (simplified using member balance as proxy for mock)
  const getParticipantStatus = (participant: any) => {
    const isMe = participant.userPublicId === MOCK_USER_ID;
    const isPayer = participant.userPublicId === expense.paidByUserPublicId;
    if (isMe) return 'YOU'; // You/pending
    
    // In a real app we'd check explicit settlement links for THIS expense. 
    // Here we use the mockup's member balance state.
    const m = members.find(mb => mb.userPublicId === participant.userPublicId);
    if (!m) return 'OWES';
    
    const isSettled = m.isSettled ?? (Math.abs(parseFloat(m.balance || '0')) === 0);
    if (isPayer) return 'SETTLED'; // Payer doesn't owe themselves
    return isSettled ? 'SETTLED' : 'OWES';
  };

  const visibleParticipants = showAllMembers ? expense.participants : expense.participants.slice(0, 4);
  const hiddenCount = Math.max(0, expense.participants.length - 4);

  return (
    <div className="min-h-screen font-sans pb-10 flex flex-col" style={{ backgroundColor: colors.pageBg }}>
      
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white flex items-center justify-between px-4 h-16" style={{ borderBottom: `0.5px solid ${colors.border}` }}>
        <button 
          onClick={() => navigate(-1)} // Preserves scroll on previous page
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
            {expense.categoryEmoji || '🧾'}
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">{expense.title}</h2>
            <p className="mt-0.5" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{group?.name || 'Group'}</p>
          </div>
        </div>
        
        <div className="mt-4 mb-3">
          <span className="font-extrabold text-white" style={{ fontSize: '26px' }}>
            {currencySymbol}{expense.totalAmount}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 flex items-center gap-1.5" style={{ background: colors.white18, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px' }}>
            <span className="text-white font-medium" style={{ fontSize: '9px' }}>
              {expense.splitType === 'EQUAL' ? '⚖️ Equal split' : '✏️ Custom split'}
            </span>
          </div>
          <div className="px-3 py-1 flex items-center gap-1.5" style={{ background: colors.white18, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px' }}>
            <span className="text-white font-medium" style={{ fontSize: '9px' }}>
              📅 {formattedDate}
            </span>
          </div>
          <div className="px-3 py-1 flex items-center gap-1.5" style={{ background: colors.white18, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px' }}>
            <span className="text-white font-medium capitalize" style={{ fontSize: '9px' }}>
              {expense.categoryEmoji} {expense.category?.toLowerCase() || 'Expense'}
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
                {payer?.avatarUrl ? (
                  <img src={payer.avatarUrl} className="w-[32px] h-[32px] rounded-full object-cover" alt="" />
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
                  {currencySymbol}{expense.totalAmount}
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
            SPLIT BETWEEN · {expense.participants?.length || 0} MEMBERS
          </h3>
          <div className="bg-white p-4" style={{ border: '0.5px solid #e8e4f8', borderRadius: '14px' }}>
            <div className="space-y-4">
              {visibleParticipants.map((p: any) => {
                const m = members.find(mb => mb.userPublicId === p.userPublicId);
                const isMe = p.userPublicId === MOCK_USER_ID;
                const isPayer = p.userPublicId === expense.paidByUserPublicId;
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
                const letter = (m?.displayName || '?')[0].toUpperCase();
                const avatarColor = pastelColors[p.userPublicId.charCodeAt(p.userPublicId.length - 1) % pastelColors.length];

                return (
                  <div key={p.userPublicId} 
                    className="flex items-center justify-between"
                    onClick={() => m && navigate(`/group/${groupId}/balance/${p.userPublicId}`)} // Theoretical navigation
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center font-bold text-[#1a1625]" style={{ backgroundColor: avatarColor, fontSize: '11px' }}>
                        {letter}
                      </div>
                      <p className="font-medium text-[#1a1625]" style={{ fontSize: '11px' }}>
                        {m?.displayName || 'Unknown'}
                        {isMe && <span className="ml-1" style={{ color: colors.textMuted }}>(you)</span>}
                        {isPayer && !isMe && <span className="ml-1" style={{ color: colors.textMuted }}>(paid)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1a1625]" style={{ fontSize: '11px' }}>
                        {currencySymbol}{parseFloat(p.shareAmount || '0').toFixed(2)}
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
                View all {expense.participants.length} members ›
              </button>
            )}
          </div>
        </div>

        {/* Notes Card */}
        {expense.note && (
          <div>
            <h3 className="mb-2 font-bold uppercase" style={{ fontSize: '10px', color: colors.textMuted, letterSpacing: '0.06em', marginLeft: '8px' }}>
              NOTES
            </h3>
            <div className="bg-white p-4" style={{ border: '0.5px solid #e8e4f8', borderRadius: '14px' }}>
              <p style={{ fontSize: '11px', color: '#5f5e5a', lineHeight: 1.4 }}>
                {expense.note}
              </p>
            </div>
          </div>
        )}

        {/* Receipt Card */}
        {(expense.receiptUrl || !expense.note) && (
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
                      🧾
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

      {/* ⋯ Actions Bottom Sheet */}
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
                    {expense.title} · {currencySymbol}{expense.totalAmount}
                  </h3>
                </div>
              </div>

              <div className="px-4 pb-10 space-y-1">
                {isCreatorOrAdmin && (
                  <button 
                    onClick={() => {
                      setActionsSheetOpen(false);
                      // Theoretical navigation to edit mode
                       navigate(`/group/${groupId}/add-expense?edit=${expenseId}`);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f4f2fb]"
                  >
                    <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#ede9ff' }}>
                      ✏️
                    </div>
                    <span className="font-semibold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Edit expense</span>
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    setActionsSheetOpen(false);
                    // Native share action logic here
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f4f2fb]"
                >
                  <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#e6f1fb' }}>
                    📤
                  </div>
                  <span className="font-semibold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Share breakdown</span>
                </button>

                {isCreatorOrAdmin && (
                  <>
                    <button 
                      onClick={() => {
                        setActionsSheetOpen(false);
                        // Navigate to Add Expense with duplicated pre-fill
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#f4f2fb]"
                    >
                      <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#faeeda' }}>
                        📋
                      </div>
                      <span className="font-semibold text-[#1a1625]" style={{ fontSize: '13px', color: colors.textPrimary }}>Duplicate expense</span>
                    </button>

                    <button 
                      onClick={() => {
                        setActionsSheetOpen(false);
                        setTimeout(() => setDeleteConfirmOpen(true), 200);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-colors hover:bg-[#fceaea]/50"
                    >
                      <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: '#fceaea' }}>
                        🗑️
                      </div>
                      <span className="font-semibold" style={{ color: '#e24b4a', fontSize: '13px' }}>Delete expense</span>
                    </button>
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
                    // Actual delete API call here
                    setDeleteConfirmOpen(false);
                    navigate(-1);
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
