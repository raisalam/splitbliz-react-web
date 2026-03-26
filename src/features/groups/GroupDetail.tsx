import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import {
  Plus, Banknote,
  Users, History, Receipt,
  X, AlertCircle, ChevronRight,
  ClipboardList
} from 'lucide-react';
import { 
  getGroupById, getGroupMembers, getGroupPairwiseBalances, 
  getGroupExpenses, getGroupSettlements, approveSettlement, rejectSettlement,
  MOCK_USER_ID 
} from '../../api/groups';
import type { Settlement } from '../../mock/settlements';
import { toast } from 'sonner';
import { GroupAvatar } from '../../components/GroupAvatar';
import { InviteMemberSheet } from '../../components/InviteMemberSheet';
import { GroupHeader } from './components/GroupHeader';
import { BalanceSummaryCard } from './components/BalanceSummaryCard';
import { ExpenseList } from './components/ExpenseList';
import { MemberList } from './components/MemberList';
import { SettlementRow } from './components/SettlementRow';
import { Skeleton } from '../../components/ui/skeleton';

// Smart banners merged inline into SmartActionBanner below

export function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [expenseFilter, setExpenseFilter] = useState<'ALL' | 'THIS_MONTH' | 'UNSETTLED'>('ALL');
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  // Bottom sheet & expand state
  const [historySheet, setHistorySheet] = useState<{ open: boolean; fromId: string; toId: string } | null>(null);
  const [showSettlementHistory, setShowSettlementHistory] = useState(false);
  const [allMembersSheetOpen, setAllMembersSheetOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!groupId) return;
      try {
        setLoading(true);
        const [g, m, b, e, s] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
          getGroupPairwiseBalances(groupId),
          getGroupExpenses(groupId),
          getGroupSettlements(groupId)
        ]);
        setGroup(g);
        setMembers(m);
        setBalances(b);
        setExpenses(e.content);
        setSettlements(s);
      } catch (err) {
        console.error("Error fetching group data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupId]);

  // Settlement helpers
  const getPendingAmountBetween = (fromId: string, toId: string) => {
    return settlements
      .filter(s => s.fromUserPublicId === fromId && s.toUserPublicId === toId && s.status === 'PENDING')
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);
  };

  const getSettlementsBetween = (fromId: string, toId: string) => {
    return settlements
      .filter(s => 
        (s.fromUserPublicId === fromId && s.toUserPublicId === toId) ||
        (s.fromUserPublicId === toId && s.toUserPublicId === fromId)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const incomingRequests = settlements.filter(
    s => s.toUserPublicId === MOCK_USER_ID && s.status === 'PENDING'
  );

  const handleApprove = async (settlementId: string) => {
    await approveSettlement(settlementId);
    setSettlements(prev => prev.map(s => s.publicId === settlementId ? { ...s, status: 'APPROVED', resolvedAt: new Date().toISOString() } : s));
    toast.success('Settlement approved!');
  };

  const handleReject = async (settlementId: string) => {
    await rejectSettlement(settlementId);
    setSettlements(prev => prev.map(s => s.publicId === settlementId ? { ...s, status: 'REJECTED', resolvedAt: new Date().toISOString() } : s));
    toast('Settlement rejected');
  };

  const getMemberName = (userId: string) => {
    if (userId === MOCK_USER_ID) return 'You';
    const m = members.find(m => m.userPublicId === userId);
    return m?.displayName || 'Unknown';
  };

  const getMember = (userId: string) => members.find(m => m.userPublicId === userId);

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

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500">
        <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Group Not Found</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Return to Home</button>
      </div>
    );
  }

  const currencySymbol = group.currencyCode === 'INR' ? '₹' : '$';

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
          members={members}
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
               {members.slice(0, 5).map((member, i) => (
                 <img 
                   key={member.userPublicId}
                   src={member.avatarUrl} 
                   alt={member.displayName}
                   className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 dark:border-slate-950 relative hover:-translate-y-1 transition-transform"
                   style={{ zIndex: 10 - i, marginLeft: i === 0 ? 0 : '-10px' }}
                 />
               ))}
               {members.length > 5 && (
                 <div 
                   className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-950 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 relative hover:-translate-y-1 transition-transform"
                   style={{ zIndex: 5, marginLeft: '-10px' }}
                 >
                   +{members.length - 5}
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
          // Priority 1 — You owe money
          if (group?.myNetInGroup?.direction === 'I_OWE') {
            const amount = group.myNetInGroup.amount;
            // Best guess for {name} based on topSpender or Group Owner, typically this involves a specific pairwise balance but we'll use topSpender for the mock UI
            const oweName = group.topSpender?.displayName || 'the group';

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
                      You owe {currencySymbol}{amount} to {oweName}
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
          if (group?.myNetInGroup?.direction === 'CREDITOR') {
            const amount = group.myNetInGroup.amount;
            const oweName = group.topSpender?.displayName || 'Someone'; // Again, simplified for mock UI

            return (
              <button
                onClick={() => toast.success('Reminder sent to all debtors!')}
                className="w-full flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 sm:p-4 rounded-2xl mb-6 text-left hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                      {oweName} owes you {currencySymbol}{amount}
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
          <ExpenseList
            expenses={expenses}
            members={members}
            currencySymbol={currencySymbol}
            expenseFilter={expenseFilter}
            onFilterChange={setExpenseFilter}
            onExpenseClick={(expenseId) => navigate(`/group/${groupId}/expense/${expenseId}`)}
            onAddExpense={() => navigate(`/group/${groupId}/add-expense`)}
            currentUserId={MOCK_USER_ID}
          />
        )}



        {/* Members Tab */}
        {activeTab === 'members' && (
          <MemberList
            members={members}
            group={group}
            currencySymbol={currencySymbol}
            currentUserId={MOCK_USER_ID}
            onShowHistory={() => setShowSettlementHistory(true)}
            onSettle={(memberId, amount) => navigate(`/group/${groupId}/settle?from=${MOCK_USER_ID}&to=${memberId}&amount=${amount}&currency=${group?.currencyCode || 'INR'}`)}
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
                    Settlements with {getMemberName(historySheet.fromId === MOCK_USER_ID ? historySheet.toId : historySheet.fromId)}
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
                      <div className="text-center py-10 text-slate-400">
                        <History className="w-8 h-8 mx-auto mb-2" />
                        <p>No settlement history yet</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {history.map((s) => (
                        <SettlementRow
                          key={s.publicId}
                          settlement={s}
                          currencyCode={group.currencyCode}
                          currentUserId={MOCK_USER_ID}
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
                    All Members ({members.length})
                  </h3>
                  <button onClick={() => setAllMembersSheetOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-24 pt-4 overflow-y-auto space-y-3">
                {members.map((member: any) => {
                  const isMe = member.userPublicId === MOCK_USER_ID;
                  return (
                    <div key={member.userPublicId} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                      <img src={member.avatarUrl} className="w-12 h-12 rounded-full object-cover" alt="" />
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
