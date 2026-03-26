import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from './ThemeProvider';
import { 
  ArrowLeft, Sparkles, TrendingUp, Users, Target, 
  BarChart3, RefreshCw, AlertTriangle, Send, Bot, 
  LineChart, MessageSquare, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { MOCK_USER_ID } from '../../api/groups';
import { MOCK_GROUPS } from '../../mock/groups';
import { MOCK_EXPENSES } from '../../mock/expenses';
import { MOCK_PAIR_BALANCES } from '../../mock/balances';

// --- FINAL UNIFIED API JSON CONTRACT ---
export interface GroupAIResponse {
  groupId: string;
  groupName: string;
  currencyCode: string;
  currencySymbol: string;
  
  overview: {
    totalSpent: number;
    expenseCount: number;
    memberCount: number;
    avgPerPerson: number;
  };

  spendingBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];

  topSpender: {
    userPublicId: string;
    displayName: string;
    avatarUrl: string;
    amount: number;
  } | null;

  topDebtor: {
    userPublicId: string;
    displayName: string;
    avatarUrl: string;
    amountOwed: number;
  } | null;

  fairnessScore: number;

  trendAnalysis: {
    timeframe: string;
    overallTrend: 'UPWARD' | 'DOWNWARD' | 'STABLE';
    averageMonthlySpend: number;
    dataPoints: {
      month: string;
      type: 'HISTORICAL' | 'FORECAST';
      amount: number;
    }[];
    trendInsight: string;
  };

  anomaly: {
    hasAnomaly: boolean;
    expenseTitle?: string;
    expenseAmount?: number;
    reason?: string;
  } | null;

  settlement: {
    unsettledTransactionCount: number;
    strategyMessage: string;
  };

  aiChat: {
    initialMessage: string;
  };
}

// --- MOCK API GENERATOR ---
function generateInsights(groupId: string): GroupAIResponse | null {
  const group = MOCK_GROUPS.find(g => g.publicId === groupId);
  if (!group) return null;

  const expenses = MOCK_EXPENSES[groupId] || [];
  const balances = MOCK_PAIR_BALANCES[groupId] || [];
  const members = group.members || [];
  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.totalAmount), 0);
  const currSym = group.currencyCode === 'INR' ? '₹' : '$';
  const perPerson = totalSpent / Math.max(members.length, 1);

  // Spender Map
  const spenderMap: Record<string, number> = {};
  members.forEach((m: any) => spenderMap[m.userPublicId] = 0);
  expenses.forEach((e: any) => {
    if (spenderMap[e.paidByUserPublicId] !== undefined) {
      spenderMap[e.paidByUserPublicId] += parseFloat(e.totalAmount);
    }
  });

  const catMap: Record<string, number> = {};
  expenses.forEach((e: any) => {
    catMap[e.category] = (catMap[e.category] || 0) + parseFloat(e.totalAmount);
  });
  const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ category: name, amount, percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0 }));

  const topSpenderEntry = Object.entries(spenderMap).sort((a, b) => b[1] - a[1])[0];
  const topSpender = (topSpenderEntry && topSpenderEntry[1] > 0) ? {
    userPublicId: members.find((m: any) => m.userPublicId === topSpenderEntry[0])?.userPublicId || '',
    displayName: members.find((m: any) => m.userPublicId === topSpenderEntry[0])?.displayName || 'User',
    avatarUrl: members.find((m: any) => m.userPublicId === topSpenderEntry[0])?.avatarUrl || '',
    amount: topSpenderEntry[1]
  } : null;

  const balanceMap: Record<string, number> = {};
  members.forEach((m: any) => balanceMap[m.userPublicId] = 0);
  Object.values(balances).forEach((b: any) => {
    const amt = parseFloat(b.netAmount);
    if (balanceMap[b.userHighPublicId] !== undefined) balanceMap[b.userHighPublicId] += amt;
    if (balanceMap[b.userLowPublicId] !== undefined) balanceMap[b.userLowPublicId] -= amt;
  });

  const topDebtorEntry = Object.entries(balanceMap).sort((a, b) => a[1] - b[1])[0];
  const topDebtor = (topDebtorEntry && topDebtorEntry[1] < 0) ? {
    userPublicId: members.find((m: any) => m.userPublicId === topDebtorEntry[0])?.userPublicId || '',
    displayName: members.find((m: any) => m.userPublicId === topDebtorEntry[0])?.displayName || 'User',
    avatarUrl: members.find((m: any) => m.userPublicId === topDebtorEntry[0])?.avatarUrl || '',
    amountOwed: Math.abs(topDebtorEntry[1])
  } : null;

  const maxDev = Object.values(spenderMap).reduce((max, spent) => Math.max(max, Math.abs(spent - perPerson)), 0);
  const fairnessScore = totalSpent > 0 ? Math.max(0, Math.min(100, Math.round(100 - (maxDev / perPerson) * 100))) : 100;

  let anomaly: GroupAIResponse['anomaly'] = { hasAnomaly: false };
  if (expenses.length > 0) {
    const largest = [...expenses].sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount))[0];
    if (parseFloat(largest.totalAmount) > perPerson * 1.5) {
      anomaly = {
        hasAnomaly: true,
        expenseTitle: largest.title,
        expenseAmount: parseFloat(largest.totalAmount),
        reason: `Unusually large compared to group average (${currSym}${perPerson.toFixed(0)})`
      };
    }
  }

  const unsettled = balances.filter((b: any) => parseFloat(b.netAmount) !== 0);

  // Trend Mock Logic (simulating 6 months history based on totalSpent)
  const baseLine = totalSpent > 0 ? totalSpent : 10000;
  const trendAnalysis = {
    timeframe: "6_MONTHS",
    overallTrend: "UPWARD" as const,
    averageMonthlySpend: Math.round(baseLine * 0.9),
    dataPoints: [
      { month: "Oct 25", type: "HISTORICAL" as const, amount: Math.round(baseLine * 0.7) },
      { month: "Nov 25", type: "HISTORICAL" as const, amount: Math.round(baseLine * 0.8) },
      { month: "Dec 25", type: "HISTORICAL" as const, amount: Math.round(baseLine * 1.3) },
      { month: "Jan 26", type: "HISTORICAL" as const, amount: Math.round(baseLine * 0.9) },
      { month: "Feb 26", type: "HISTORICAL" as const, amount: Math.round(baseLine * 1.0) },
      { month: "Mar 26", type: "FORECAST" as const, amount: Math.round(baseLine * 1.15) }
    ],
    trendInsight: "Spending spiked 30% in December. Based on current habits, March spending is projected to end 15% higher than your average."
  };

  const aiChat = {
    initialMessage: totalSpent > 5000
      ? `I noticed your group spending is quite high lately. The ${categories[0]?.category || 'top'} category makes up ${categories[0]?.percentage || 0}% of all expenses. Your trend shows a 15% predicted increase for next month.`
      : expenses.length === 0
      ? 'No expenses yet. Add your first expense and I will start analyzing your group spending patterns.'
      : `Your group spends around ${currSym}${perPerson.toFixed(0)} per person. Things look well balanced! Keep it up.`
  };

  return {
    groupId: group.publicId,
    groupName: group.name,
    currencyCode: group.currencyCode,
    currencySymbol: currSym,
    overview: {
      totalSpent,
      expenseCount: expenses.length,
      memberCount: members.length,
      avgPerPerson: perPerson
    },
    spendingBreakdown: categories,
    topSpender,
    topDebtor,
    fairnessScore,
    trendAnalysis,
    anomaly,
    settlement: {
      unsettledTransactionCount: unsettled.length,
      strategyMessage: unsettled.length === 0
        ? 'Everyone is settled up! No transactions needed. 🎉'
        : unsettled.length === 1
        ? `Just 1 transaction needed to settle everything!`
        : `${unsettled.length} optimal transactions needed to clear all balances. Use the Settle Up feature for the fastest resolution.`
    },
    aiChat
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  TRAVEL: 'bg-sky-500', FOOD: 'bg-amber-500', RENT: 'bg-violet-500',
  ENTERTAINMENT: 'bg-rose-500', SHOPPING: 'bg-emerald-500', OTHER: 'bg-slate-500'
};
const CATEGORY_EMOJIS: Record<string, string> = {
  TRAVEL: '✈️', FOOD: '🍕', RENT: '🏠', ENTERTAINMENT: '🎬', SHOPPING: '🛍️', OTHER: '📦'
};

// Typewriter Effect Component
const TypewriterText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

export function GroupAI() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<GroupAIResponse | null>(null);
  
  // Local Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const loadInsights = () => {
    setLoading(true);
    setTimeout(() => {
      const data = generateInsights(groupId || '');
      setInsights(data);
      if (data) {
        setChatMessages([{ id: 1, sender: 'ai', text: data.aiChat.initialMessage }]);
      }
      setLoading(false);
    }, 2000);
  };

  useEffect(() => { loadInsights(); }, [groupId]);

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !insights) return;
    
    const newMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = { id: Date.now(), sender: 'ai', text: "I'm analyzing that for you... Based on the 6-month data, your group tends to spend more on weekends. I suggest splitting large bills evenly to maintain fairness." };
      setChatMessages(prev => [...prev, aiReply]);
      setIsTyping(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-24 h-24 mb-6"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-indigo-500" />
          </div>
        </motion.div>
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-2">Analyzing Group Data</h2>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Running advanced machine learning models...</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        No data available for this group
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-white transition-colors pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#0A0F1C]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/group/${groupId}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                SplitBliz AI
              </h1>
            </div>
          </div>
          <button onClick={loadInsights} className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          
          {/* AI Welcome Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }}
            className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 right-0 w-64 h-64 bg-pink-400/30 rounded-full blur-3xl pointer-events-none" 
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-indigo-100 font-medium mb-4">
                <Bot className="w-5 h-5" />
                <span>AI Financial Summary</span>
              </div>
              <div className="text-5xl font-black tracking-tight mb-2 drop-shadow-lg">
                {insights.currencySymbol}{insights.overview.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/20">
                <TrendingUp className="w-4 h-4" />
                <span>{insights.overview.expenseCount} records analyzed</span>
              </div>
            </div>
          </motion.div>

          {/* AI Chat Initial Bubble */}
          <div className="space-y-4 pt-2">
            <AnimatePresence>
              {chatMessages.map((msg: any, idx) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.sender === 'ai' ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                        <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                    }`}>
                      {msg.sender === 'ai' && idx === 0 ? (
                        <TypewriterText text={msg.text} delay={0.5} />
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New 6-Month Comparison Widget using Recharts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-xl">
                <LineChart className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h3 className="font-bold">6-Month Trend</h3>
                <p className="text-xs text-slate-500">Historical vs Forecast</p>
              </div>
            </div>
            
            <div className="h-48 w-full mt-2 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.trendAnalysis.dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} tickFormatter={(val) => `${insights.currencySymbol}${val/1000}k`} />
                  <RechartsTooltip 
                    cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    formatter={(value: number) => [`${insights.currencySymbol}${value.toLocaleString()}`, 'Amount']}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 6, 6]}>
                    {insights.trendAnalysis.dataPoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'FORECAST' ? '#a855f7' : '#6366f1'} fillOpacity={entry.type === 'FORECAST' ? 0.6 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {insights.trendAnalysis.trendInsight}
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Spender & Debtor Split Grid */}
            <div className="grid grid-cols-2 gap-4">
              {insights.topSpender && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Top Spender</h3>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <img src={insights.topSpender.avatarUrl} alt={insights.topSpender.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {insights.topSpender.userPublicId === MOCK_USER_ID ? 'You' : insights.topSpender.displayName}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                        {insights.currencySymbol}{insights.topSpender.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {insights.topDebtor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                  className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-800/30 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm">Top Debtor</h3>
                  </div>
                  <div className="flex items-center gap-3 relative z-10">
                    <img src={insights.topDebtor.avatarUrl} alt={insights.topDebtor.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {insights.topDebtor.userPublicId === MOCK_USER_ID ? 'You' : insights.topDebtor.displayName}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate">
                        Owes {insights.currencySymbol}{insights.topDebtor.amountOwed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Fairness Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm flex items-center gap-5"
            >
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-800" />
                  <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" strokeWidth="3" strokeLinecap="round"
                    className={insights.fairnessScore >= 70 ? 'text-emerald-500' : insights.fairnessScore >= 40 ? 'text-amber-500' : 'text-rose-500'}
                    stroke="currentColor" initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${insights.fairnessScore}, 100` }} transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black">{insights.fairnessScore}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1 flex items-center gap-1.5">
                  Fairness Score
                  {insights.fairnessScore >= 80 && <span className="flex w-2 h-2 rounded-full bg-emerald-500"></span>}
                </h3>
                <p className="text-sm text-slate-500">
                  {insights.fairnessScore >= 80 ? 'Spending is well balanced.' : insights.fairnessScore >= 50 ? 'Some skew in spending.' : 'Highly imbalanced spending.'}
                </p>
              </div>
            </motion.div>

            {/* Expense Anomaly (If present) */}
            {insights.anomaly?.hasAnomaly && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
                className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm relative overflow-hidden md:col-span-2"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-2 relative z-10">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <h3 className="font-bold text-rose-600 dark:text-rose-400">Expense Anomaly Detected</h3>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {insights.anomaly.expenseTitle}
                    </p>
                    <p className="text-xs text-rose-500 mt-1 font-medium">{insights.anomaly.reason}</p>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white shrink-0 ml-4">
                    {insights.currencySymbol}{insights.anomaly.expenseAmount?.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Action Items / Settle Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 shadow-md text-white overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl"><Sparkles className="w-5 h-5 text-white" /></div>
              <h3 className="font-bold text-lg">Smart Settlement Strategy</h3>
            </div>
            <p className="text-violet-100 leading-relaxed mb-5 relative z-10">{insights.settlement.strategyMessage}</p>
            {insights.settlement.unsettledTransactionCount > 0 && (
              <button
                onClick={() => navigate(`/group/${groupId}/settle`)}
                className="w-full relative z-10 py-3.5 bg-white hover:bg-slate-50 text-indigo-600 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                View Action Items <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>

          {/* Spending Breakdown Banner */}
          {insights.spendingBreakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/50 p-6 shadow-sm overflow-hidden"
            >
              <h3 className="font-bold flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Where your money goes
              </h3>
              <div className="w-full h-4 rounded-full flex overflow-hidden mb-6">
                {insights.spendingBreakdown.map((cat, i) => (
                  <motion.div
                    key={cat.category} initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 1, delay: 1.1 + (i * 0.1) }}
                    className={`h-full border-r border-white/20 dark:border-black/20 last:border-0 ${CATEGORY_COLORS[cat.category] || 'bg-slate-500'}`}
                    title={`${cat.category}: ${cat.percentage}%`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {insights.spendingBreakdown.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${CATEGORY_COLORS[cat.category] || 'bg-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate flex items-center gap-1.5">{CATEGORY_EMOJIS[cat.category] || '📦'} {cat.category}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{insights.currencySymbol}{cat.amount.toLocaleString()} ({cat.percentage}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          <div className="h-6"></div>
        </motion.div>
      </main>

      {/* Sticky Bottom Chat Input */}
      {insights && !loading && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-[#0A0F1C] dark:via-[#0A0F1C] dark:to-transparent z-40"
        >
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendQuery} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50">
                <div className="pl-4 pr-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask SplitBliz AI about your expenses..."
                  className="flex-1 py-4 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  type="submit" disabled={!chatInput.trim() || isTyping}
                  className="mr-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
