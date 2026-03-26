import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { useUser } from '../../providers/UserContext';
import { useGroupDetail } from '../../hooks/useGroupDetail';
import {
  Plus, Banknote,
  Users, History, Receipt,
  X, AlertCircle, ChevronRight,
  ClipboardList
} from 'lucide-react';
import { approveSettlement, rejectSettlement } from '../../api/groups';
import type { Settlement } from '../../mock/settlements';
import { toast } from 'sonner';
import { InviteMemberSheet } from '../../components/InviteMemberSheet';
import { GroupHeader } from './components/GroupHeader';
import { BalanceSummaryCard } from './components/BalanceSummaryCard';
import { ExpenseList } from './components/ExpenseList';
import { MemberList } from './components/MemberList';
import { SettlementRow } from './components/SettlementRow';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/EmptyState';
import { CachedAvatar } from '../../components/CachedAvatar';

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [expenseFilter, setExpenseFilter] = useState<'ALL' | 'THIS_MONTH' | 'UNSETTLED'>('ALL');
  
  // Replace direct mock fetching with React Query hook
  const { data, isLoading: loading, error } = useGroupDetail(groupId);
  const { group, members, expenses, balances, settlements, quickInsight } = data ?? {};

  // Bottom sheet & expand state
  const [historySheet, setHistorySheet] = useState<{ open: boolean; fromId: string; toId: string } | null>(null);
  const [showSettlementHistory, setShowSettlementHistory] = useState(false);
  const [allMembersSheetOpen, setAllMembersSheetOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  // Settlement helpers
  const getSettlementsBetween = (fromId: string, toId: string) => {
    if (!settlements) return [];
    return settlements
      .filter((s: any) => 
        (s.fromUser?.userId === fromId && s.toUser?.userId === toId) ||
        (s.fromUser?.userId === toId && s.toUser?.userId === fromId)
      )
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const handleApprove = async (settlementId: string) => {
    await approveSettlement(settlementId); // MOCK LEFT FOR NOW, until Write Operations step
    toast.success('Settlement approved!');
  };

  const handleReject = async (settlementId: string) => {
    await rejectSettlement(settlementId); // MOCK LEFT FOR NOW
    toast('Settlement rejected');
  };

  const getMemberName = (userId: string) => {
    if (userId === user?.id) return 'You';
    const m = members?.find((m: any) => m.userId === userId);
    return m?.displayName || 'Unknown';
  };

  const currentUserId = user?.id || '';
  const otherMembers = (members || []).filter((m: any) => m.userPublicId !== currentUserId);
  const topOwesYou = otherMembers
    .filter((m: any) => parseFloat(m.balance?.netAmount || '0') > 0)
    .sort((a: any, b: any) => parseFloat(b.balance?.netAmount || '0') - parseFloat(a.balance?.netAmount || '0'));
  const topYouOwe = otherMembers
    .filter((m: any) => parseFloat(m.balance?.netAmount || '0') < 0)
    .sort((a: any, b: any) => parseFloat(a.balance?.netAmount || '0') - parseFloat(b.balance?.netAmount || '0'));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
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

  if (error || !group) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Group Not Found or Error</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Return to Home</button>
      </div>
    );
  }

  const currencySymbol = group.currencyCode || 'INR';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      
      <GroupHeader
        group={group}
        theme={theme}
        onBack={() => navigate('/')}
        onChat={() => navigate(`/group/${groupId}/chat`)}
        onActivity={() => navigate(`/group/${groupId}/activity`)}
        onSettingsClick={() => navigate(`/group/${groupId}/settings`)}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <BalanceSummaryCard
          group={group}
          members={members || []}
          currencySymbol={currencySymbol}
          onAiClick={() => navigate(`/group/${groupId}/ai`)}
        />

        {/* Smart Insight Bar successfully removed and merged */}

        {/* Stacked Members Row */}
        <div className="mb-6 flex flex-col gap-2">
           <div className="flex items-center">
             <div 
               className="flex items-center cursor-pointer relative"
               onClick={() => setAllMembersSheetOpen(true)}
             >
               {(members || []).slice(0, 5).map((member: any, i: number) => (
                 <CachedAvatar 
                   key={member.userId}
                   src={member.resolvedAvatar || member.avatarUrl} 
                   alt={member.displayName}
                   className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 dark:border-slate-950 relative hover:-translate-y-1 transition-transform"
                   style={{ zIndex: 10 - i, marginLeft: i === 0 ? 0 : '-10px' }}
                 />
               ))}
               {(members || []).length > 5 && (
                 <div 
                   className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-950 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 relative hover:-translate-y-1 transition-transform"
                   style={{ zIndex: 5, marginLeft: '-10px' }}
                 >
                   +{members!.length - 5}
                 </div>
               )}
             </div>

             <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-3" />

               <button 
                onClick={() => setInviteSheetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Invite
              </button>
            </div>
        </div>

        {/* Smart Action Banner Priority Logic */}
        {(() => {
          const netAmount = group?.balance?.netAmount ? Number(group.balance.netAmount) : 0;
          // Priority 1 — You owe money
          if (netAmount < 0) {
            const amount = Math.abs(netAmount).toFixed(2);
            const topOwed = topYouOwe[0];
            const topAmount = topOwed?.balance?.netAmount ? Math.abs(parseFloat(topOwed.balance.netAmount)).toFixed(2) : amount;
            const oweName = topOwed?.displayName || 'the group';
            const bannerTitle = topOwed
              ? `You owe ${currencySymbol}${topAmount} to ${oweName}`
              : `You owe ${currencySymbol}${amount} to ${oweName}`;

            return (
              <button
                onClick={() => navigate(`/group/${groupId}/settle`)}
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

          // Priority 2 — You are owed money
          if (netAmount > 0) {
            const amount = netAmount.toFixed(2);
            const bannerTitle = quickInsight?.type === 'YOU_ARE_OWED'
              ? quickInsight.title
              : (topOwesYou[0]?.displayName
                ? `${topOwesYou[0].displayName} owes you ${currencySymbol}${topOwesYou[0].balance?.netAmount ?? amount}`
                : `You are owed ${currencySymbol}${amount}`);

            return (
              <button
                onClick={() => toast.success('Reminder sent!')}
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
          
          // Priority 3 — Pending settlements (Removed from Group Detail - now handled exclusively on Home Action Items)
          
          // Priority 4 — All zero
          return null; 
        })()}

        {/* Quick Action Pills */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => navigate(`/group/${groupId}/add-expense`)}
            className="flex items-center gap-3 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start pr-2">
              <span className="text-sm font-bold leading-none">Add Expense</span>
              <span className="text-[10px] text-indigo-200 mt-1 font-medium">track costs</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate(`/group/${groupId}/settle`)}
            className="flex items-center gap-3 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start pr-2">
              <span className="text-sm font-bold leading-none">Settle Up</span>
              <span className="text-[10px] text-emerald-200 mt-1 font-medium">pay someone</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate(`/group/${groupId}/whiteboard`)}
            className="flex items-center gap-3 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-sm shadow-amber-500/20 transition-all shrink-0 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start pr-2">
              <span className="text-sm font-bold leading-none">Split Board</span>
              <span className="text-[10px] text-amber-200 mt-1 font-medium">who owes what</span>
            </div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6 sticky top-16 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm z-40 py-2">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'expenses' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Expenses
            </div>
            {activeTab === 'expenses' && (
              <motion.div layoutId="groupTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'members' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members & Balances
            </div>
            {activeTab === 'members' && (
              <motion.div layoutId="groupTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          (!expenses || expenses.length === 0) ? (
            <EmptyState
              title="No expenses yet"
              description="Add the first expense for this group."
              action={{ label: 'Add expense', onClick: () => navigate(`/group/${groupId}/add-expense`) }}
            />
          ) : (
            <ExpenseList
              expenses={expenses || []}
              members={members || []}
              currencySymbol={currencySymbol}
              expenseFilter={expenseFilter}
              onFilterChange={setExpenseFilter}
              onExpenseClick={(expenseId) => navigate(`/group/${groupId}/expense/${expenseId}`)}
              onAddExpense={() => navigate(`/group/${groupId}/add-expense`)}
              currentUserId={currentUserId}
            />
          )
        )}



        {/* Members Tab */}
        {activeTab === 'members' && (
          <MemberList
            members={members || []}
            group={group}
            currencySymbol={currencySymbol}
            currentUserId={currentUserId}
            onShowHistory={() => setShowSettlementHistory(true)}
            onSettle={(memberId, amount) => navigate(`/group/${groupId}/settle?from=${currentUserId}&to=${memberId}&amount=${amount}&currency=${group?.currencyCode || 'INR'}`)}
            onRemind={(memberName) => {
              toast.success(`Reminder sent to ${memberName}!`);
            }}
          />
        )}

      </main>

      {/* Settlement History Bottom Sheet */}
      <AnimatePresence>
        {historySheet?.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setHistorySheet(null)}
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
                    Settlements with {getMemberName(historySheet.fromId === currentUserId ? historySheet.toId : historySheet.fromId)}
                  </h3>
                  <button onClick={() => setHistorySheet(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-12 pt-4 overflow-y-auto">
                {(() => {
                  const history = getSettlementsBetween(historySheet.fromId, historySheet.toId);
                  if (history.length === 0) {
                    return (
                      <EmptyState
                        title="All settled up"
                        description="No pending settlements in this group."
                      />
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {history.map((s: any) => (
                        <SettlementRow
                          key={s.id}
                          settlement={s}
                          currencyCode={group.currencyCode}
                          currentUserId={currentUserId}
                          getMemberName={getMemberName}
                        />
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Action Required / Approvals Bottom Sheet — Removed to Home */}

      {/* All Members Bottom Sheet */}
      <AnimatePresence>
        {allMembersSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAllMembersSheetOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="pt-4 pb-2 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    All Members ({(members || []).length})
                  </h3>
                  <button onClick={() => setAllMembersSheetOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-24 pt-4 overflow-y-auto space-y-3">
                {(members || []).map((member: any) => {
                  const isMe = member.userId === currentUserId;
                  return (
                    <div key={member.userId} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                      <CachedAvatar src={member.resolvedAvatar || member.avatarUrl} className="w-12 h-12 rounded-full object-cover shrink-0" alt="" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{member.displayName}</h4>
                          {isMe && <span className="text-xs text-slate-400">(You)</span>}
                          {member.role === 'OWNER' && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">Owner</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pointer-events-none">
                <div className="pointer-events-auto">
                   <button 
                     onClick={() => { setAllMembersSheetOpen(false); setInviteSheetOpen(true); }}
                     className="w-full py-3.5 rounded-2xl font-bold text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                   >
                     <Plus className="w-5 h-5" />
                     Invite Members
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <InviteMemberSheet open={inviteSheetOpen} onOpenChange={setInviteSheetOpen} />

    </div>
  );
}
