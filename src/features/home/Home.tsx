import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../providers/ThemeProvider';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { PendingApprovalsSheet } from '../../components/PendingApprovalsSheet';
import brandLogo from '../../assets/brand/logo.png';
import { HomeHeader } from './components/HomeHeader';
import { InsightBar } from './components/InsightBar';
import { QuickActions } from './components/QuickActions';
import { RecentActivityList } from './components/RecentActivityList';
import { HomeFAB } from './components/HomeFAB';
import { SelectGroupSheet } from './components/SelectGroupSheet';
import { StoriesRow } from './components/StoriesRow';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { GroupSearchBar } from './components/GroupSearchBar';
import { HomeTabs } from './components/HomeTabs';
import { GroupsTabPanel } from './components/GroupsTabPanel';
import { Skeleton } from '../../components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../providers/UserContext';
import { extractApiError } from '../../services/apiClient';
import { useHomeData } from '../../hooks/useGroups';
import { useApproveSettlement, useRejectSettlement } from '../../hooks/useSettlementMutations';
import { useAcceptInvite, useRejectInvite } from '../../hooks/useGroupMutations';
import { useLogout } from '../../hooks/useAuthMutations';
import type { Group, ActionItem } from '../../types';

const MAX_VISIBLE_ACTIONS = 2;

/** Derive balance direction from the API's netAmount string */
function getNet(group: Group): number {
  return group.balance ? Number(group.balance.netAmount) : 0;
}

export function Home() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser } = useUser();
  const logout = useLogout();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'activity'>('groups');
  const [fabExpanded, setFabExpanded] = useState(false);
  const [actionSheetOrigin, setActionSheetOrigin] = useState<'expense' | 'settle' | null>(null);
  const [pendingSheetOpen, setPendingSheetOpen] = useState(false);

  // Mutation hooks
  const approveSettlement = useApproveSettlement();
  const rejectSettlement = useRejectSettlement();
  const acceptInvite = useAcceptInvite();
  const rejectInvite = useRejectInvite();

  // --- Real API data ---
  const { data, isLoading, error } = useHomeData();
  const groups = data?.groups ?? [];
  const actionItems = data?.actionItemsPreview?.items ?? [];
  const actionItemsTotalCount = data?.actionItemsPreview?.totalCount ?? 0;
  const unreadNotifications = data?.user?.unreadNotificationCount ?? 0;
  const recentActivity = data?.recentActivity ?? [];

  const visibleActions = actionItems.slice(0, MAX_VISIBLE_ACTIONS);
  const hiddenCount = Math.max(0, actionItems.length - MAX_VISIBLE_ACTIONS);

  const handleAction = async (referenceId: string, type: ActionItem['type'], action: 'approve' | 'reject') => {
    if (type === 'SETTLEMENT_APPROVAL') {
      const item = actionItems.find(a => a.referenceId === referenceId);
      const groupId = item?.groupId;
      if (!groupId) {
        toast.error('Missing group for settlement.');
        return;
      }
      try {
        if (action === 'approve') {
          await approveSettlement.mutateAsync({ groupId, settlementId: referenceId });
          toast.success('Settlement approved!');
        } else {
          await rejectSettlement.mutateAsync({ groupId, settlementId: referenceId });
          toast('Settlement rejected');
        }
      } catch (err) {
        const apiErr = extractApiError(err);
        if (apiErr?.code === 'ERR_ALREADY_PROCESSING') {
          toast.error('Settlement is already being processed.');
        } else {
          toast.error(`Failed to ${action}. Please try again.`);
        }
      }
    } else {
      // GROUP_INVITE - accept/decline by inviteId
      const item = actionItems.find(a => a.referenceId === referenceId);
      if (action === 'approve' && item?.inviteId) {
        try {
          await acceptInvite.mutateAsync(item.inviteId);
          toast.success('You joined the group!');
        } catch {
          toast.error('Failed to join group.');
        }
      } else if (action === 'reject' && item?.inviteId) {
        try {
          await rejectInvite.mutateAsync(item.inviteId);
          toast.info('Group invitation declined');
        } catch {
          toast.error('Failed to decline invite.');
        }
      }
    }
  };

  const handleApproveAll = async () => {
    const settlements = actionItems.filter(a => a.type === 'SETTLEMENT_APPROVAL');
    for (const item of settlements) {
      try {
        await approveSettlement.mutateAsync({ groupId: item.groupId, settlementId: item.referenceId });
      } catch {
        // continue with next
      }
    }
    toast.success(`Approved ${settlements.length} settlements!`);
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    setUser(null);
    navigate('/login');
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
        <HomeHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onNotificationsClick={() => navigate('/notifications')}
          onAvatarClick={() => navigate('/profile')}
          onLogout={handleLogout}
          brandLogo={brandLogo}
          unreadCount={0}
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
        <HomeHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onNotificationsClick={() => navigate('/notifications')}
          onAvatarClick={() => navigate('/profile')}
          onLogout={handleLogout}
          brandLogo={brandLogo}
          unreadCount={0}
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Failed to load. Please try again.</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['home'] })}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const firstName = user?.displayName?.split(' ')[0] ?? '';

  // --- Compute hero card balances from real groups ---
  const totalOwed = groups.filter(g => getNet(g) > 0).reduce((s, g) => s + getNet(g), 0);
  const totalOwe = groups.filter(g => getNet(g) < 0).reduce((s, g) => s + Math.abs(getNet(g)), 0);
  const net = totalOwed - totalOwe;
  const currency = groups[0]?.currencyCode ?? 'INR';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      
      <HomeHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onNotificationsClick={() => navigate('/notifications')}
        onAvatarClick={() => navigate('/profile')}
        onLogout={handleLogout}
        brandLogo={brandLogo}
        unreadCount={unreadNotifications || actionItemsTotalCount}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        <StoriesRow
          groups={groups}
          onSelectGroup={(groupId) => navigate(`/group/${groupId}`)}
          getNet={getNet}
        />

        {/* Dynamic Insight Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight mb-3">Good morning, {firstName}</h1>
            <InsightBar
              groups={groups}
              onNavigate={navigate}
              onSetActionSheetOrigin={setActionSheetOrigin}
            />
          </motion.div>
        </div>

        <HeroBalanceCard
          totalOwed={totalOwed}
          totalOwe={totalOwe}
          net={net}
          currencyCode={currency}
        />

        <QuickActions
          groups={groups}
          allActions={actionItems}
          visibleActions={visibleActions}
          hiddenCount={hiddenCount}
          onShowAll={() => setPendingSheetOpen(true)}
          onAction={handleAction}
        />

        <GroupSearchBar value={searchQuery} onChange={setSearchQuery} />

        <HomeTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Groups Content */}
        {activeTab === 'groups' && (
          <GroupsTabPanel
            groups={groups}
            filteredGroups={filteredGroups}
            onCreateGroup={() => navigate('/group/new')}
            onSelectGroup={(groupId) => navigate(`/group/${groupId}`)}
          />
        )}

        {/* Activity Content */}
        {activeTab === 'activity' && (
          <RecentActivityList activities={recentActivity} />
        )}

      </main>

      <HomeFAB
        expanded={fabExpanded}
        onToggle={() => setFabExpanded(!fabExpanded)}
        onNewGroup={() => {
          setFabExpanded(false);
          navigate('/group/new');
        }}
        onQuickSettle={() => {
          setFabExpanded(false);
          setActionSheetOrigin('settle');
        }}
        onAddExpense={() => {
          setFabExpanded(false);
          setActionSheetOrigin('expense');
        }}
        onBackdropClick={() => setFabExpanded(false)}
      />

      <SelectGroupSheet
        origin={actionSheetOrigin}
        groups={groups}
        getNet={getNet}
        onClose={() => setActionSheetOrigin(null)}
        onSelectGroup={(groupId) => {
          setActionSheetOrigin(null);
          navigate(`/group/${groupId}/${actionSheetOrigin === 'expense' ? 'add-expense' : 'settle'}`);
        }}
      />

      {/* Pending Approvals Bottom Sheet */}
      <PendingApprovalsSheet 
        isOpen={pendingSheetOpen}
        onClose={() => setPendingSheetOpen(false)}
        approvals={actionItems.filter(a => a.type === 'SETTLEMENT_APPROVAL').map(a => ({
          id: a.referenceId,
          user: {
            displayName: a.fromUser?.displayName ?? 'Unknown',
            avatarUrl: a.fromUser?.resolvedAvatar ?? '',
          },
          groupName: a.groupName,
          amount: a.amount ?? '0.00',
          currencyCode: a.currencyCode ?? 'INR',
          time: new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        }))}
        onApprove={async (id) => { await handleAction(id, 'SETTLEMENT_APPROVAL', 'approve'); }}
        onReject={async (id) => { await handleAction(id, 'SETTLEMENT_APPROVAL', 'reject'); }}
        onApproveAll={handleApproveAll}
      />

    </div>
  );
}
