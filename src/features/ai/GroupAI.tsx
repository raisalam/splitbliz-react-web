import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { 
  ArrowLeft, Sparkles, RefreshCw, Bot
} from 'lucide-react';
import { MOCK_USER_ID } from '../../api/groups';
import { MOCK_GROUPS } from '../../mock/groups';
import { MOCK_EXPENSES } from '../../mock/expenses';
import { MOCK_PAIR_BALANCES } from '../../mock/balances';
import { AIInsightCards } from './components/AIInsightCards';
import { SpendingChart } from './components/SpendingChart';
import { AIChatPanel } from './components/AIChatPanel';

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
          <AIChatPanel
            messages={chatMessages}
            isTyping={isTyping}
            chatInput={chatInput}
            onInputChange={setChatInput}
            onSend={handleSendQuery}
            showInput={!!insights && !loading}
          />

          {/* New 6-Month Comparison Widget using Recharts */}
          <SpendingChart
            chartData={insights.trendAnalysis.dataPoints}
            currencyCode={insights.currencyCode}
            currencySymbol={insights.currencySymbol}
            trendInsight={insights.trendAnalysis.trendInsight}
            theme={theme}
          />

          <AIInsightCards
            insights={insights}
            groupId={groupId}
            currentUserId={MOCK_USER_ID}
            onNavigate={navigate}
          />
        </motion.div>
      </main>

    </div>
  );
}
