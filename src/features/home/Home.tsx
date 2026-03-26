import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../providers/ThemeProvider';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Plus,
  Check,
  UserPlus,
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
import { MOCK_SETTLEMENTS } from '../../mock/settlements';
import { approveSettlement, rejectSettlement, MOCK_USER_ID } from '../../api/groups';
import { MOCK_GROUPS } from '../../mock/groups';
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
import { EmptyState } from '../../components/EmptyState';
import { useUser } from '../../providers/UserContext';
import { authService } from '../../services';

// Static non-settlement actions (group invites etc.)
const MOCK_STATIC_ACTIONS = [
  {
    id: 'invite-1',
    type: 'GROUP_INVITE' as const,
    user: { displayName: 'Sarah', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    groupName: 'Weekend Getaway',
    time: '5 hours ago'
  }
];

const MOCK_RECENT_ACTIVITY = [
  {
    id: 'act-1',
    type: 'EXPENSE_ADDED',
    description: 'You added "Flight Tickets"',
    groupName: 'Goa Trip 2026',
    amount: '₹4,500.00',
    amountType: 'POSITIVE',
    time: 'Today, 10:30 AM',
    icon: Plus
  },
  {
    id: 'act-2',
    type: 'SETTLEMENT_COMPLETED',
    description: 'You paid Sarah',
    groupName: 'Apartment Rent',
    amount: '₹450.00',
    amountType: 'NEGATIVE',
    time: 'Yesterday',
    icon: Check
  },
  {
    id: 'act-3',
    type: 'GROUP_JOINED',
    description: 'You joined the group',
    groupName: 'Friday Dinner',
    amount: null,
    amountType: 'NEUTRAL',
    time: 'Mar 1, 2026',
    icon: UserPlus
  }
];

// Helper to find member info from groups
function findMemberAcrossGroups(userId: string) {
  for (const g of MOCK_GROUPS) {
    const m = g.members.find(m => m.userPublicId === userId);
    if (m) return m;
  }
  return null;
}

const MAX_VISIBLE_ACTIONS = 2;

export function Home() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'activity'>('groups');
  const [staticActions, setStaticActions] = useState(MOCK_STATIC_ACTIONS);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [actionSheetOrigin, setActionSheetOrigin] = useState<'expense' | 'settle' | null>(null);
  const [pendingSheetOpen, setPendingSheetOpen] = useState(false);
  const [, forceUpdate] = useState(0); // trigger re-render after approve/reject
  const [loading, setLoading] = useState(true);

  // Build action items from real settlement store + static actions
  const pendingSettlements = MOCK_SETTLEMENTS
    .filter(s => s.toUserPublicId === MOCK_USER_ID && s.status === 'PENDING')
    .map(s => {
      const fromMember = findMemberAcrossGroups(s.fromUserPublicId);
      const group = MOCK_GROUPS.find(g => g.publicId === s.groupPublicId);
      return {
        id: s.publicId,
        type: 'SETTLEMENT' as const,
        user: { 
          displayName: fromMember?.displayName || 'Action Pending', 
          avatarUrl: fromMember?.avatarUrl || `https://i.pravatar.cc/150?u=${s.fromUserPublicId}` 
        },
        groupName: group?.name || 'Unknown Group',
        amount: s.amount,
        currencyCode: s.currencyCode,
        time: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    });

  const allActions = [
    ...pendingSettlements,
    ...staticActions.map(a => ({ ...a, amount: undefined, currencyCode: undefined }))
  ];

  const visibleActions = allActions.slice(0, MAX_VISIBLE_ACTIONS);
  const hiddenCount = Math.max(0, allActions.length - MAX_VISIBLE_ACTIONS);

  const handleAction = async (id: string, type: string, action: 'approve' | 'reject') => {
    if (type === 'SETTLEMENT') {
      if (action === 'approve') {
        await approveSettlement(id);
        toast.success('Settlement approved!');
      } else {
        await rejectSettlement(id);
        toast('Settlement rejected');
      }
      forceUpdate(n => n + 1); // re-render to reflect updated MOCK_SETTLEMENTS
    } else {
      setStaticActions(prev => prev.filter(a => a.id !== id));
      if (action === 'approve') {
        toast.success('You joined the group!');
      } else {
        toast.info('Group invitation declined');
      }
    }
  };

  const handleApproveAll = async () => {
    for (const action of pendingSettlements) {
      await approveSettlement(action.id);
    }
    toast.success(`Approved ${pendingSettlements.length} settlements!`);
    forceUpdate(n => n + 1);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/login');
  };

  const filteredGroups = MOCK_GROUPS.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
        <HomeHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onNotificationsClick={() => navigate('/notifications')}
          onAvatarClick={() => navigate('/profile')}
          onLogout={handleLogout}
          brandLogo={brandLogo}
          user={{
            displayName: 'Rais',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
          }}
          unreadCount={1}
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

  const firstName = user?.displayName?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      
      <HomeHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        onNotificationsClick={() => navigate('/notifications')}
        onAvatarClick={() => navigate('/profile')}
        onLogout={handleLogout}
        brandLogo={brandLogo}
        unreadCount={1}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Stories Row — all groups, gradient ring only for active (non-settled) groups */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {MOCK_GROUPS.map((group, i) => {
              const firstName = group.name.split(' ')[0].slice(0, 8);
              return (
                <motion.div 
                  key={group.publicId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                  onClick={() => navigate(`/group/${group.publicId}`)}
                  className="flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0"
                >
                  <GroupAvatar name={group.name} emoji={group.emoji} size="sm" hasActivity={group.hasActivity} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 text-center truncate">
                    {firstName}
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
              groups={MOCK_GROUPS}
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
              {(() => {
                const totalOwed = MOCK_GROUPS.filter(g => g.myNetInGroup.direction === 'CREDITOR').reduce((s, g) => s + parseFloat(g.myNetInGroup.amount), 0);
                const totalOwe = MOCK_GROUPS.filter(g => g.myNetInGroup.direction === 'I_OWE').reduce((s, g) => s + parseFloat(g.myNetInGroup.amount), 0);
                const net = totalOwed - totalOwe;
                const isPositive = net >= 0;
                return (
                  <div className={`text-5xl font-extrabold tracking-tight flex items-center gap-3 ${isPositive ? 'text-emerald-200' : 'text-rose-200'}`}>
                    {isPositive ? <ArrowUp className="w-7 h-7" /> : <ArrowDown className="w-7 h-7" />}
                    {isPositive ? '+' : '-'}₹{Math.abs(net).toFixed(2)}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex gap-6 sm:gap-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                  You are owed
                </div>
                <div className="text-xl font-bold text-white">₹450.00</div>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-rose-300" />
                  You owe
                </div>
                <div className="text-xl font-bold text-white">₹120.00</div>
              </div>
            </div>
          </div>
        </motion.div>

        <QuickActions
          groups={MOCK_GROUPS}
          allActions={allActions}
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
            {MOCK_GROUPS.length === 0 ? (
              <EmptyState
                title="No groups yet"
                description="Create your first group to start splitting expenses."
                action={{ label: 'Create group', onClick: () => navigate('/group/new') }}
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {filteredGroups.map((group, index) => (
                  <GroupCard
                    key={group.publicId}
                    group={group}
                    index={index}
                    onClick={() => navigate(`/group/${group.publicId}`)}
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
          <RecentActivityList activities={MOCK_RECENT_ACTIVITY} />
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
                    ? MOCK_GROUPS.filter(g => g.myNetInGroup.direction === 'I_OWE')
                    : MOCK_GROUPS
                  ).map((group, index) => (
                    <GroupListItem
                      key={group.publicId}
                      group={group}
                      index={index}
                      onClick={() => {
                        setActionSheetOrigin(null);
                        navigate(`/group/${group.publicId}/${actionSheetOrigin === 'expense' ? 'add-expense' : 'settle'}`);
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
        approvals={pendingSettlements as any[]}
        onApprove={async (id) => { await handleAction(id, 'SETTLEMENT', 'approve'); }}
        onReject={async (id) => { await handleAction(id, 'SETTLEMENT', 'reject'); }}
        onApproveAll={handleApproveAll}
      />

    </div>
  );
}
