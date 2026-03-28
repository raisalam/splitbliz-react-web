import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { useUser } from '../../providers/UserContext';
import { useGroupDetail } from '../../hooks/useGroupDetail';
import { useGroupMqtt } from '../../hooks/useGroupMqtt';
import { toast } from 'sonner';
import { useRemindMember } from '../../hooks/useSettlementMutations';
import { InviteMemberSheet } from '../../components/InviteMemberSheet';
import { GroupHeader } from './components/GroupHeader';
import { BalanceSummaryCard } from './components/BalanceSummaryCard';
import { MemberList } from './components/MemberList';
import { Skeleton } from '../../components/ui/skeleton';
import { ActionBanner } from './components/ActionBanner';
import { AllMembersSheet } from './components/AllMembersSheet';
import { SettlementHistorySheet } from './components/SettlementHistorySheet';
import { MemberStackRow } from './components/MemberStackRow';
import { GroupQuickActions } from './components/GroupQuickActions';
import { GroupTabs } from './components/GroupTabs';
import { GroupExpensesPanel } from './components/GroupExpensesPanel';

export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  useGroupMqtt(groupId || '');

  const [activeTab, setActiveTab] = useState<'expenses' | 'members'>('expenses');
  const [expenseFilter, setExpenseFilter] = useState<'ALL' | 'THIS_MONTH' | 'UNSETTLED'>('ALL');

  const { data, isLoading: loading, error } = useGroupDetail(groupId);
  const { group, members, expenses, settlements, quickInsight } = data ?? {};

  const [historySheet, setHistorySheet] = useState<{ open: boolean; fromId: string; toId: string } | null>(null);
  const [allMembersSheetOpen, setAllMembersSheetOpen] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  const remindMember = useRemindMember();

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

        <MemberStackRow
          members={members || []}
          onShowAll={() => setAllMembersSheetOpen(true)}
          onInvite={() => setInviteSheetOpen(true)}
        />

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

        <GroupQuickActions
          onAddExpense={() => navigate(`/group/${groupId}/add-expense`)}
          onSettleUp={() => navigate(`/group/${groupId}/settle`)}
          onWhiteboard={() => navigate(`/group/${groupId}/whiteboard`)}
        />

        <GroupTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <GroupExpensesPanel
            expenses={expenses || []}
            members={members || []}
            currencySymbol={currencySymbol}
            expenseFilter={expenseFilter}
            onFilterChange={setExpenseFilter}
            onExpenseClick={(expenseId) => navigate(`/group/${groupId}/expense/${expenseId}`)}
            onAddExpense={() => navigate(`/group/${groupId}/add-expense`)}
            currentUserId={currentUserId}
          />
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <MemberList
            members={members || []}
            group={group}
            currencySymbol={currencySymbol}
            currentUserId={currentUserId}
            onShowHistory={() => setHistorySheet({ open: true, fromId: '', toId: '' })}
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
