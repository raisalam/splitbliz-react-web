import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { 
  ArrowLeft, Moon, Sun, Plus, Banknote, 
  Users, History, Receipt, ArrowUpRight, ArrowDownLeft, Wallet,
  X, Check, Clock, AlertCircle, ChevronRight, ChevronDown, Settings,
  Sparkles, TrendingUp, Bell, ClipboardList, MessageSquare
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

// Smart banners merged inline into SmartActionBanner below

// --- Expense Row Component ---
function ExpenseRow({ expense, idx, payer, isMe, formattedDate, members, currencySymbol }: {
  expense: any; idx: number; payer: any; isMe: boolean; formattedDate: string; members: any[]; currencySymbol: string;
}) {
  const navigate = useNavigate();
  const { groupId } = useParams();

  // Calculate net balance for just this expense to determine "Your share" colour
  const totalAmount = parseFloat(expense.totalAmount || '0');
  const myShareAmount = parseFloat(expense.yourShare || '0');
  const netForExpense = isMe ? (totalAmount - myShareAmount) : -myShareAmount;

  let shareColorClass = 'text-slate-400 dark:text-slate-500'; // grey (zero)
  if (netForExpense > 0) shareColorClass = 'text-emerald-600 dark:text-emerald-400'; // green (you are owed)
  else if (netForExpense < 0) shareColorClass = 'text-amber-600 dark:text-amber-500'; // amber (you owe money / need to pay)

  const getBorderColor = (e: string) => {
    switch (e) {
      case '✈️': return 'border-l-indigo-500';
      case '🍽️': return 'border-l-orange-500';
      case '🏠': return 'border-l-emerald-500';
      case '🚕': return 'border-l-amber-500';
      case '🍿': return 'border-l-rose-500';
      default: return 'border-l-slate-300 dark:border-l-slate-700';
    }
  };
  const leftBorderClass = getBorderColor(expense.categoryEmoji || '🛒');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
      onClick={() => navigate(`/group/${groupId}/expense/${expense.publicId}`)}
      className={`bg-white dark:bg-slate-900 rounded-2xl border-y border-r border-slate-200 dark:border-slate-800 border-l-[3px] ${leftBorderClass} overflow-hidden hover:border-y-indigo-500/30 hover:border-r-indigo-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md`}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GroupAvatar name={expense.title} emoji={expense.categoryEmoji || '🛒'} size="md" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">{expense.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span>{isMe ? 'You' : payer.displayName} paid {currencySymbol}{expense.totalAmount}</span>
              <span className="hidden sm:inline">•</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${shareColorClass}`}>
                Your share: {currencySymbol}{myShareAmount.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="font-semibold text-slate-900 dark:text-white text-base">
            {currencySymbol}{expense.totalAmount}
          </div>
          <div className="flex flex-col items-end gap-1.5 mt-1">
            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
              expense.splitType === 'EQUAL' 
                ? 'bg-indigo-500 text-white dark:bg-indigo-500 dark:text-white' 
                : 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white'
            }`}>
              {expense.splitType}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex items-center gap-5">
              <GroupAvatar name={group.name} emoji={group.emoji} size="lg" />
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <h1 className="font-semibold text-lg leading-tight">{group.name}</h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{group.memberCount} members</p>
              </div>
            </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/group/${groupId}/chat`)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Group Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate(`/group/${groupId}/activity`)}
              className="p-2 relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Group Activity"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate(`/group/${groupId}/settings`)}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Group Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Glassmorphic Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 mb-6 group"
        >
          {/* Sparkline background texture */}
          <svg className="absolute top-1/2 right-0 -translate-y-1/2 w-2/3 h-full opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 80 Q 20 60, 40 70 T 70 30 T 100 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          
          {/* Floating AI Action Button */}
          <button 
             onClick={() => navigate(`/group/${groupId}/ai`)}
             className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white p-2 sm:p-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group/ai"
             aria-label="Group AI Insights"
          >
             <Sparkles className="w-5 h-5 group-hover/ai:text-purple-200 transition-colors" />
          </button>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-100 font-medium mb-2">
                <Wallet className="w-4 h-4" />
                <span>Group Total Spent</span>
              </div>
              <div className="text-5xl font-extrabold tracking-tight">
                {currencySymbol}{group.financialSummary?.totalExpenseAmount || '0.00'}
              </div>
            </div>
            
            <div className="flex gap-6 sm:gap-10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                  {group.myNetInGroup.direction === 'CREDITOR' ? 'You are owed' : 'Owed to you'}
                </div>
                <div className="text-xl font-bold text-white">
                  {group.myNetInGroup.direction === 'CREDITOR' ? `+${currencySymbol}${group.myNetInGroup.amount}` : `${currencySymbol}0.00`}
                </div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-indigo-100/80 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-rose-300" />
                  You owe
                </div>
                <div className="text-xl font-bold text-white">
                  {group.myNetInGroup.direction === 'I_OWE' ? `${currencySymbol}${group.myNetInGroup.amount}` : `${currencySymbol}0.00`}
                </div>
              </div>
            </div>
          </div>
          {/* Custom inline AI Insights */}
          <div className="relative z-10 mt-6 md:mt-8 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-indigo-50/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              <Sparkles className="w-4 h-4 text-purple-200 shrink-0" />
              <span className="truncate">Top Spender: {members[0]?.displayName || 'User'} • {currencySymbol}{members[0]?.paidAmount || '0'}</span>
            </div>
          </div>
        </motion.div>

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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {['ALL', 'THIS_MONTH', 'UNSETTLED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setExpenseFilter(filter as any)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    expenseFilter === filter 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter === 'ALL' ? 'All' : filter === 'THIS_MONTH' ? 'This Month' : 'Unsettled'}
                </button>
              ))}
            </div>
            
            <div className="grid gap-3">
              {expenses.map((expense: any, idx) => {
                const payer = members.find(m => m.userPublicId === expense.paidByUserPublicId) || { displayName: 'Someone' };
                const isMe = expense.paidByUserPublicId === MOCK_USER_ID;
                const formattedDate = new Date(expense.expenseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                
                return (
                  <ExpenseRow 
                    key={expense.publicId} 
                    expense={expense} 
                    idx={idx} 
                    payer={payer} 
                    isMe={isMe} 
                    formattedDate={formattedDate} 
                    members={members}
                    currencySymbol={currencySymbol}
                  />
                );
              })}
              
              {expenses.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 mt-4 shadow-sm">
                  <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">{currencySymbol}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No expenses yet</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-6">Start tracking your shared costs by adding the first expense to this group.</p>
                  <button 
                    onClick={() => navigate(`/group/${groupId}/add-expense`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-md transition-transform active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    Add the first expense
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}



        {/* Members Tab */}
        {activeTab === 'members' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            
            <div className="flex items-center justify-between mt-2 px-1">
              <h3 className="font-bold text-slate-900 dark:text-white">Group Members</h3>
              <button 
                onClick={() => setShowSettlementHistory(true)}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline transition-all"
              >
                View History
              </button>
            </div>

            {/* Balances Summary Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total owed to you</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {group?.myNetInGroup?.direction === 'CREDITOR' ? `+${currencySymbol}${group.myNetInGroup.amount}` : `${currencySymbol}0.00`}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">You owe</span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {group?.myNetInGroup?.direction === 'I_OWE' ? `${currencySymbol}${group.myNetInGroup.amount}` : `${currencySymbol}0.00`}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50 shadow-sm">
              {members.map((member: any, idx) => {
                const isMe = member.userPublicId === MOCK_USER_ID;
                
                // Pull data directly from the newly structured mock data
                const totalPaid = parseFloat(member.paidAmount || '0');
                const percent = member.percentageOfGroup || 0;
                
                const netBalance = parseFloat(member.balance || '0');
                const theyOweMe = netBalance > 0;
                const iOweThem = netBalance < 0;
                const amt = Math.abs(netBalance);
                const isSettled = member.isSettled ?? (amt === 0);

                return (
                  <motion.div 
                    key={member.userPublicId} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx }}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isSettled && !isMe ? 'opacity-60 grayscale-[0.5]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={member.avatarUrl} alt={member.displayName} className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent" />
                        {iOweThem && <div className="absolute inset-0 rounded-full ring-2 ring-rose-400 ring-offset-2 dark:ring-offset-slate-900" />}
                        {theyOweMe && <div className="absolute inset-0 rounded-full ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-bold text-base ${isSettled && !isMe ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {member.displayName} {isMe && <span className="text-slate-400 font-normal">(You)</span>}
                          </span>
                          {member.role === 'OWNER' && (
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Owner</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <span>Paid {currencySymbol}{totalPaid.toFixed(2)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span>{percent}% of group</span>
                        </div>
                      </div>
                    </div>

                    {!isMe && (
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-16 sm:pl-0">
                        {!isSettled ? (
                          <>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
                                {iOweThem ? 'You owe' : 'Owes you'}
                              </p>
                              <p className={`font-bold text-lg ${iOweThem ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {currencySymbol}{amt.toFixed(2)}
                              </p>
                            </div>
                            {iOweThem && (
                              <button
                                onClick={() => navigate(`/group/${groupId}/settle?from=${MOCK_USER_ID}&to=${member.userPublicId}&amount=${amt}&currency=${group?.currencyCode || 'INR'}`)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-transform active:scale-95 shrink-0"
                              >
                                Settle
                              </button>
                            )}
                            {theyOweMe && (
                              <button
                                onClick={() => {
                                  toast.success(`Reminder sent to ${member.displayName}!`);
                                }}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 text-sm font-semibold rounded-xl transition-colors shrink-0"
                              >
                                Remind
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-400 dark:text-slate-500">
                            <Check className="w-4 h-4" />
                            Settled up
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* All Settled Empty State */}
            {group?.myNetInGroup?.amount === '0.00' && (
              <div className="mt-8 text-center p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Everyone is even 🎉</h3>
                <p className="text-emerald-700/80 dark:text-emerald-400">No pending balances or settlements required.</p>
              </div>
            )}
          </motion.div>
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
                        <div key={s.publicId} className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 ${
                          s.status === 'PENDING' ? 'border-l-amber-400 bg-amber-50/50 dark:bg-amber-500/5' :
                          s.status === 'APPROVED' ? 'border-l-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/5' :
                          'border-l-rose-400 bg-rose-50/50 dark:bg-rose-500/5'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                            s.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                            s.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                            'bg-rose-100 dark:bg-rose-900/30 text-rose-600'
                          }`}>
                            {s.status === 'PENDING' ? <Clock className="w-4 h-4" /> :
                             s.status === 'APPROVED' ? <Check className="w-4 h-4" /> :
                             <X className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">{currencySymbol}{parseFloat(s.amount).toFixed(2)}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                s.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                s.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                              }`}>
                                {s.status === 'PENDING' ? 'Pending' : s.status === 'APPROVED' ? 'Settled' : 'Rejected'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              {getMemberName(s.fromUserPublicId)} → {getMemberName(s.toUserPublicId)}
                            </p>
                            {s.note && <p className="text-xs text-slate-400 mt-0.5">"{s.note}"</p>}
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
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
