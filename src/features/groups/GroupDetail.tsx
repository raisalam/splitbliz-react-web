import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { useUser } from '../../providers/UserContext';
import { useGroupDetail } from '../../hooks/useGroupDetail';
import { useGroupMqtt } from '../../hooks/useGroupMqtt';
import {
  Plus, Banknote,
  Users, Receipt,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';
import { useApproveSettlement, useRejectSettlement, useRemindMember } from '../../hooks/useSettlementMutations';
import { InviteMemberSheet } from '../../components/InviteMemberSheet';
import { GroupHeader } from './components/GroupHeader';
import { BalanceSummaryCard } from './components/BalanceSummaryCard';
import { ExpenseList } from './components/ExpenseList';
import { MemberList } from './components/MemberList';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/EmptyState';
import { MemberAvatar } from './components/MemberAvatar';
import { ActionBanner } from './components/ActionBanner';
import { AllMembersSheet } from './components/AllMembersSheet';
import { SettlementHistorySheet } from './components/SettlementHistorySheet';

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  useGroupMqtt(groupId || '');

  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');
  const [expenseFilter, setExpenseFilter] = useState<'ALL' | 'THIS_MONTH' | 'UNSETTLED'>('ALL');

  const { data, isLoading: loading, error } = useGroupDetail(groupId);
  const { group, members, expenses, balances, settlements, quickInsight } = data ?? {};

  const [historySheet, setHistorySheet] = useState<{ open: boolean; fromId: string; toId: string } | null>(null);
  const [showSettlementHistory, setShowSettlementHistory] = useState(false);
  const [allMembersSheetOpen, setAllMembersSheetOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  const approveSettlement = useApproveSettlement();
  const rejectSettlement = useRejectSettlement();
  const remindMember = useRemindMember();

  const handleApprove = async (settlementId: string) => {
    if (!groupId) return;
    try {
      await approveSettlement.mutateAsync({ groupId, settlementId });
      toast.success('Settlement approved!');
    } catch {
      toast.error('Failed to approve settlement');
    }
  };

  const handleReject = async (settlementId: string) => {
    if (!groupId) return;
    try {
      await rejectSettlement.mutateAsync({ groupId, settlementId });
      toast('Settlement rejected');
    } catch {
      toast.error('Failed to reject settlement');
    }
  };

  const handleRemind = async (memberId: string) => {
    if (!groupId) return;
    try {
      await remindMember.mutateAsync({ groupId, toUserId: memberId });
      toast.success('Reminder sent!');
    } catch {
      toast.error('Failed to send reminder.');
    }
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

        {/* Stacked Members Row */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer relative"
              onClick={() => setAllMembersSheetOpen(true)}
            >
              {(members || []).slice(0, 5).map((member: any, i: number) => (
                <div
                  key={member.userId}
                  className="relative hover:-translate-y-1 transition-transform"
                  style={{ zIndex: 10 - i, marginLeft: i === 0 ? 0 : '-10px' }}
                >
                  <MemberAvatar
                    member={member}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 dark:border-slate-950"
                  />
                </div>
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

        <ActionBanner
          groupId={groupId || ''}
          group={group}
          quickInsight={quickInsight}
          currentUserId={currentUserId}
          topYouOwe={topYouOwe}
          topOwesYou={topOwesYou}
          onSettle={() => navigate(`/group/${groupId}/settle`)}
          onSettleUser={(userId, amount, currencyCode) => {
            navigate(`/group/${groupId}/settle?from=${currentUserId}&to=${userId}&amount=${amount}&currency=${currencyCode || group.currencyCode}`);
          }}
          onRemind={handleRemind}
        />

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
            onRemind={handleRemind}
          />
        )}
      </main>

      <SettlementHistorySheet
        open={!!historySheet?.open}
        fromId={historySheet?.fromId || ''}
        toId={historySheet?.toId || ''}
        settlements={settlements || []}
        currentUserId={currentUserId}
        currencyCode={group.currencyCode}
        getMemberName={getMemberName}
        onClose={() => setHistorySheet(null)}
      />

      <AllMembersSheet
        open={allMembersSheetOpen}
        members={members || []}
        currentUserId={currentUserId}
        onClose={() => setAllMembersSheetOpen(false)}
        onInvite={() => { setAllMembersSheetOpen(false); setInviteSheetOpen(true); }}
      />

      <InviteMemberSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        groupId={groupId}
        existingMemberIds={(members || []).map((m: any) => m.userId)}
      />
    </div>
  );
}
