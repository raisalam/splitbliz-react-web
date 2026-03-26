import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { 
  Bell, 
  Moon, 
  Sun, 
  Plus, 
  LogOut, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Search,
  Users,
  Check,
  X,
  UserPlus,
  Banknote,
  Activity,
  History,
  Sparkles,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { MOCK_SETTLEMENTS } from '../../mock/settlements';
import { approveSettlement, rejectSettlement, MOCK_USER_ID } from '../../api/groups';
import { MOCK_GROUPS } from '../../mock/groups';
import { GroupAvatar } from './ui/GroupAvatar';
import { GroupListItem } from './ui/GroupListItem';
import { PendingApprovalsSheet } from './ui/PendingApprovalsSheet';

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

// --- Rotating Insight Bar ---
type Insight = {
  emoji: string;
  text: React.ReactNode;
  bg: string;
  actionLabel: string;
  onAction: () => void;
};

function InsightBar({ groups, navigate, setActionSheetOrigin }: {
  groups: typeof MOCK_GROUPS;
  navigate: ReturnType<typeof useNavigate>;
  setActionSheetOrigin: (v: 'expense' | 'settle' | null) => void;
}) {
  const [index, setIndex] = useState(0);

  const insights = useMemo<Insight[]>(() => {
    const oweGroups = groups.filter(g => g.myNetInGroup.direction === 'I_OWE');
    const owedGroups = groups.filter(g => g.myNetInGroup.direction === 'CREDITOR');
    const settledGroups = groups.filter(g => g.myNetInGroup.direction === 'SETTLED');
    const totalOwe = oweGroups.reduce((sum, g) => sum + parseFloat(g.myNetInGroup.amount), 0);
    const totalOwed = owedGroups.reduce((sum, g) => sum + parseFloat(g.myNetInGroup.amount), 0);
    const topOwedGroup = [...owedGroups].sort((a, b) => parseFloat(b.myNetInGroup.amount) - parseFloat(a.myNetInGroup.amount))[0];
    const topOweGroup = [...oweGroups].sort((a, b) => parseFloat(b.myNetInGroup.amount) - parseFloat(a.myNetInGroup.amount))[0];

    const list: Insight[] = [];

    if (owedGroups.length > 0 && topOwedGroup) {
      list.push({
        emoji: '💰',
        text: <>You're owed <strong>₹{totalOwed.toFixed(0)}</strong> across {owedGroups.length} group{owedGroups.length > 1 ? 's' : ''}. Nudge <strong>{topOwedGroup.name}</strong>?</>,
        bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
        actionLabel: 'Nudge',
        onAction: () => navigate(`/group/${topOwedGroup.publicId}`),
      });
    }
    if (oweGroups.length > 0 && topOweGroup) {
      list.push({
        emoji: '⚡',
        text: <>You owe <strong>₹{totalOwe.toFixed(0)}</strong> across {oweGroups.length} group{oweGroups.length > 1 ? 's' : ''}. Settle <strong>{topOweGroup.name}</strong> first?</>,
        bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
        actionLabel: 'Settle',
        onAction: () => setActionSheetOrigin('settle'),
      });
    }
    if (settledGroups.length > 0) {
      list.push({
        emoji: '🎉',
        text: <><strong>{settledGroups.length}</strong> group{settledGroups.length > 1 ? 's' : ''} fully settled! Keep it up.</>,
        bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
        actionLabel: 'View',
        onAction: () => {},
      });
    }
    if (list.length === 0) {
      list.push({
        emoji: '✨',
        text: <>All clear! No pending balances.</>,
        bg: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        actionLabel: '',
        onAction: () => {},
      });
    }
    return list;
  }, [groups, navigate, setActionSheetOrigin]);

  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % insights.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const current = insights[index % insights.length];

  return (
    <div className="relative h-9 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${current.bg}`}
        >
          <span>{current.emoji}</span>
          <span className="truncate">{current.text}</span>
          {current.actionLabel && (
            <button
              onClick={(e) => { e.stopPropagation(); current.onAction(); }}
              className="ml-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/10 text-xs font-bold hover:bg-white/90 dark:hover:bg-white/20 transition-colors shrink-0"
            >
              {current.actionLabel}
            </button>
          )}
          {insights.length > 1 && (
            <div className="flex gap-1 ml-1 shrink-0">
              {insights.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index % insights.length ? 'bg-current opacity-80' : 'bg-current opacity-20'}`} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
// --- End Insight Bar ---

export function Home() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'groups' | 'activity'>('groups');
  const [staticActions, setStaticActions] = useState(MOCK_STATIC_ACTIONS);
  const [fabExpanded, setFabExpanded] = useState(false);
  const [actionSheetOrigin, setActionSheetOrigin] = useState<'expense' | 'settle' | null>(null);
  const [pendingSheetOpen, setPendingSheetOpen] = useState(false);
  const [, forceUpdate] = useState(0); // trigger re-render after approve/reject

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

  const handleLogout = () => {
    navigate('/login');
  };

  const filteredGroups = MOCK_GROUPS.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <span className="font-semibold text-lg hidden sm:block tracking-tight">SplitBliz</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => navigate('/notifications')}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/profile')} className="relative rounded-full hover:ring-2 hover:ring-indigo-500/50 transition-all">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
              </button>
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

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
            <h1 className="text-3xl font-bold tracking-tight mb-3">Good morning, Rais</h1>
            <InsightBar groups={MOCK_GROUPS} navigate={navigate} setActionSheetOrigin={setActionSheetOrigin} />
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

        {/* Pending Actions */}
        <AnimatePresence>
          {allActions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  Action Items
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 text-xs font-bold">
                    {allActions.length} Pending
                  </span>
                </h2>
              </div>
              
              <div className="grid gap-3">
                <AnimatePresence>
                  {visibleActions.map((action) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group"
                    >
                      {/* Left accent border */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/80 group-hover:bg-rose-500 transition-colors"></div>
                      
                      <div className="flex items-start sm:items-center gap-3 pl-2">
                        {/* Group emoji avatar */}
                        {(() => {
                          const grp = MOCK_GROUPS.find(g => g.name === action.groupName);
                          return <GroupAvatar name={action.groupName} emoji={grp?.emoji || '👥'} size="sm" />;
                        })()}
                        <div className="relative shrink-0">
                          <img src={action.user.avatarUrl} alt={action.user.displayName} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                            {action.type === 'SETTLEMENT' ? (
                              <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Banknote className="w-2.5 h-2.5" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <UserPlus className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-semibold text-slate-900 dark:text-white">{action.user.displayName}</span>
                            {action.type === 'SETTLEMENT' ? (
                              <> requested a settlement of <span className="font-semibold text-slate-900 dark:text-white">{action.currencyCode === 'INR' ? '₹' : '$'}{action.amount}</span> in <span className="font-semibold text-slate-900 dark:text-white">{action.groupName}</span></>
                            ) : (
                              <> invited you to join <span className="font-semibold text-slate-900 dark:text-white">{action.groupName}</span></>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto pl-2 sm:pl-0 mt-2 sm:mt-0">
                        <button 
                          onClick={() => handleAction(action.id, action.type, 'reject')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {action.type === 'SETTLEMENT' ? 'Reject' : 'Decline'}
                        </button>
                        <button 
                          onClick={() => handleAction(action.id, action.type, 'approve')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          {action.type === 'SETTLEMENT' ? 'Approve' : 'Join'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Show all / collapse toggle */}
              {hiddenCount > 0 && (
                <button
                  onClick={() => setPendingSheetOpen(true)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors"
                >
                  <ChevronDown className="w-4 h-4 transition-transform" />
                  Show all {allActions.length} items
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {filteredGroups.map((group, index) => (
                <GroupListItem
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
          </motion.div>
        )}

        {/* Activity Content */}
        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {MOCK_RECENT_ACTIVITY.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        activity.type === 'EXPENSE_ADDED' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' :
                        activity.type === 'SETTLEMENT_COMPLETED' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          in <span className="font-medium">{activity.groupName}</span> • {activity.time}
                        </p>
                      </div>
                    </div>
                    
                    {activity.amount && (
                      <div className={`font-semibold text-sm ${
                        activity.amountType === 'POSITIVE' ? 'text-emerald-600 dark:text-emerald-400' :
                        activity.amountType === 'NEGATIVE' ? 'text-rose-600 dark:text-rose-400' :
                        'text-slate-400 dark:text-slate-500'
                      }`}>
                        {activity.amountType === 'POSITIVE' ? '+' : activity.amountType === 'NEGATIVE' ? '-' : ''}{activity.amount}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                View all activity
              </button>
            </div>
          </motion.div>
        )}

      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 sm:bottom-10 sm:right-10">
        <AnimatePresence>
          {fabExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2.5 items-end"
            >
              <button 
                onClick={() => {
                  setFabExpanded(false);
                  navigate('/group/new');
                }}
                className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span className="font-semibold text-sm whitespace-nowrap">New Group</span>
              </button>
              
              <button 
                onClick={() => {
                  setFabExpanded(false);
                  setActionSheetOrigin('settle');
                }}
                className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95"
              >
                <Banknote className="w-4 h-4" />
                <span className="font-semibold text-sm whitespace-nowrap">Quick Settle</span>
              </button>
              
              <button 
                onClick={() => {
                  setFabExpanded(false);
                  setActionSheetOrigin('expense');
                }}
                className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all active:scale-95"
              >
                <Receipt className="w-4 h-4" />
                <span className="font-semibold text-sm whitespace-nowrap">Add Expense</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Backdrop */}
        {fabExpanded && (
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setFabExpanded(false)} 
          />
        )}

        <button
          onClick={() => setFabExpanded(!fabExpanded)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all active:scale-95 z-50 ${
            fabExpanded 
              ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white rotate-45' 
              : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-white hover:scale-105'
          }`}
        >
          <Plus className="w-6 h-6 transition-transform duration-300" />
        </button>
      </div>

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
