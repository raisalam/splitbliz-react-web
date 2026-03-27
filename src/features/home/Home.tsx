import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../providers/ThemeProvider';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  ArrowDown,
  Search,
  Users,
  History
} from 'lucide-react';
import { GroupAvatar } from '../../components/GroupAvatar';
import { GroupListItem } from '../../components/GroupListItem';
import { PendingApprovalsSheet } from '../../components/PendingApprovalsSheet';
import brandLogo from '../../assets/brand/logo.png';
import { HomeHeader } from './components/HomeHeader';
import { InsightBar } from './components/InsightBar';
import { QuickActions } from './components/QuickActions';
import { GroupCard } from './components/GroupCard';
import { RecentActivityList } from './components/RecentActivityList';
import { HomeFAB } from './components/HomeFAB';
import { Skeleton } from '../../components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EmptyState } from '../../components/EmptyState';
import { useUser } from '../../providers/UserContext';
import { authService, groupsService, settlementsService } from '../../services';
import { extractApiError } from '../../services/apiClient';
import { useHomeData } from '../../hooks/useGroups';
import { useApproveSettlement, useRejectSettlement } from '../../hooks/useSettlementMutations';
import { useAcceptInvite, useRejectInvite } from '../../hooks/useGroupMutations';
import { GROUP_TYPE_EMOJI } from '../../constants/app';
import { formatCurrency, formatBalance } from '../../utils/formatCurrency';
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
      // GROUP_INVITE — accept/decline by inviteId
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
    await authService.logout();
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
  const isPositive = net >= 0;
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
        
        {/* Stories Row — all groups, gradient ring only for active (non-settled) groups */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {groups.map((group, i) => {
              const shortName = group.name.split(' ')[0].slice(0, 8);
              const emoji = GROUP_TYPE_EMOJI[group.groupType] ?? GROUP_TYPE_EMOJI['OTHER'];
              const hasActivity = getNet(group) !== 0;
              return (
                <motion.div 
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0"
                >
                  <GroupAvatar name={group.name} emoji={emoji} size="sm" hasActivity={hasActivity} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 text-center truncate">
                    {shortName}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

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

        {/* Glassmorphic Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 mb-10"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
                <Wallet className="w-4 h-4" />
                <span>Total Balance</span>
              </div>
              <div className={`text-5xl font-extrabold tracking-tight flex items-center gap-3 ${isPositive ? 'text-emerald-200' : 'text-rose-200'}`}>
                {isPositive ? <ArrowUp className="w-7 h-7" /> : <ArrowDown className="w-7 h-7" />}
                {isPositive ? '+' : '-'}{formatCurrency(Math.abs(net).toFixed(2), currency)}
              </div>
            </div>
            
            <div className="flex gap-6 sm:gap-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                  You are owed
                </div>
                <div className="text-xl font-bold text-white">{formatCurrency(totalOwed.toFixed(2), currency)}</div>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-rose-300" />
                  You owe
                </div>
                <div className="text-xl font-bold text-white">{formatCurrency(totalOwe.toFixed(2), currency)}</div>
              </div>
            </div>
          </div>
        </motion.div>

        <QuickActions
          groups={groups}
          allActions={actionItems}
          visibleActions={visibleActions}
          hiddenCount={hiddenCount}
          onShowAll={() => setPendingSheetOpen(true)}
          onAction={handleAction}
        />

        {/* Search Bar — always visible */}
        <div className="mb-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('groups')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'groups' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Your Groups
            </div>
            {activeTab === 'groups' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'activity' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Activity
            </div>
            {activeTab === 'activity' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Groups Content */}
        {activeTab === 'groups' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {groups.length === 0 ? (
              <EmptyState
                title="No groups yet"
                description="Create your first group to start splitting expenses."
                action={{ label: 'Create group', onClick: () => navigate('/group/new') }}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {filteredGroups.map((group, index) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    index={index}
                    onClick={() => navigate(`/group/${group.id}`)}
                  />
                ))}
                
                {filteredGroups.length === 0 && (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">No groups found</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Try adjusting your search query.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
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

      {/* Select Group Sheet for Action Routing */}
      <AnimatePresence>
        {actionSheetOrigin && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActionSheetOrigin(null)}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col sm:max-w-xl sm:mx-auto"
            >
              <div className="pt-4 pb-2 px-6 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Select Group
                  </h3>
                  <button onClick={() => setActionSheetOrigin(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-1 pb-4">
                  Where would you like to {actionSheetOrigin === 'expense' ? 'add an expense' : 'settle up'}?
                </p>
              </div>

              <div className="pb-12 pt-2 overflow-y-auto custom-scrollbar">
                <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                  {(actionSheetOrigin === 'settle'
                    ? groups.filter(g => getNet(g) < 0)
                    : groups
                  ).map((group, index) => (
                    <GroupListItem
                      key={group.id}
                      group={group}
                      index={index}
                      onClick={() => {
                        setActionSheetOrigin(null);
                        navigate(`/group/${group.id}/${actionSheetOrigin === 'expense' ? 'add-expense' : 'settle'}`);
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
