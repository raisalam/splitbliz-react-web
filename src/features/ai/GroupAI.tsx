import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Sparkles, RefreshCw, Bot, TrendingUp } from 'lucide-react';
import { AIInsightCards } from './components/AIInsightCards';
import { SpendingChart } from './components/SpendingChart';
import { AIChatPanel } from './components/AIChatPanel';
import { useUser } from '../../providers/UserContext';
import { CURRENCY_CONFIG } from '../../constants/app';
import { aiInsightsService, aiService, groupsService, extractApiError } from '../../services';
import type { Group, GroupMember } from '../../types';
import type { GroupAiInsightsResponse } from '../../services/aiInsightsService';
import { EmptyState } from '../../components/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

// --- Normalized UI model for AI insights ---
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
    avatarUrl: string | null;
    amount: number;
  } | null;

  topDebtor: {
    userPublicId: string;
    displayName: string;
    avatarUrl: string | null;
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

const TREND_MAP: Record<string, 'UPWARD' | 'DOWNWARD' | 'STABLE'> = {
  INCREASING: 'UPWARD',
  DECREASING: 'DOWNWARD',
  STABLE: 'STABLE',
  UPWARD: 'UPWARD',
  DOWNWARD: 'DOWNWARD',
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const parseMaybeJson = <T,>(value: T | string | null | undefined): T | null => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return (value ?? null) as T | null;
};

const resolveCurrencySymbol = (currencyCode?: string): string => {
  if (!currencyCode) return '';
  return CURRENCY_CONFIG[currencyCode]?.symbol ?? currencyCode;
};

const resolveTrend = (value?: string): 'UPWARD' | 'DOWNWARD' | 'STABLE' => {
  if (!value) return 'STABLE';
  const key = value.toUpperCase();
  return TREND_MAP[key] ?? 'STABLE';
};

const buildInsights = (
  groupId: string,
  group: Group,
  members: GroupMember[],
  raw: GroupAiInsightsResponse
): GroupAIResponse => {
  const currencyCode = group.currencyCode ?? 'INR';
  const currencySymbol = resolveCurrencySymbol(currencyCode);
  const memberById = new Map(members.map((m) => [m.userId, m]));

  const overviewRaw = parseMaybeJson(raw.overview) ?? {};
  const totalSpent = toNumber((overviewRaw as any).totalSpent);
  const expenseCount = Number((overviewRaw as any).expenseCount ?? 0);
  const memberCount = Number((overviewRaw as any).memberCount ?? group.memberCount ?? members.length ?? 0);
  const avgPerPerson = toNumber((overviewRaw as any).avgPerPerson);

  const breakdownRaw = parseMaybeJson(raw.spendingBreakdown);
  const spendingBreakdown = Array.isArray(breakdownRaw)
    ? breakdownRaw.map((b: any) => ({
      category: b.category,
      amount: toNumber(b.amount),
      percentage: Number(b.percentage ?? 0),
    }))
    : [];

  const topSpenderRaw = parseMaybeJson(raw.topSpender);
  const topSpenderMember = topSpenderRaw?.userId ? memberById.get(topSpenderRaw.userId) : null;
  const topSpender = topSpenderRaw?.userId ? {
    userPublicId: topSpenderRaw.userId,
    displayName: topSpenderMember?.displayName || topSpenderRaw.name || 'Member',
    avatarUrl: topSpenderMember?.resolvedAvatar ?? null,
    amount: toNumber(topSpenderRaw.amount),
  } : null;

  const topDebtorRaw = parseMaybeJson(raw.topDebtor);
  const topDebtorMember = topDebtorRaw?.userId ? memberById.get(topDebtorRaw.userId) : null;
  const topDebtor = topDebtorRaw?.userId ? {
    userPublicId: topDebtorRaw.userId,
    displayName: topDebtorMember?.displayName || topDebtorRaw.name || 'Member',
    avatarUrl: topDebtorMember?.resolvedAvatar ?? null,
    amountOwed: toNumber(topDebtorRaw.amountOwed),
  } : null;

  const trendRaw = parseMaybeJson(raw.trendAnalysis) ?? {};
  const trendPointsRaw = Array.isArray((trendRaw as any).dataPoints) ? (trendRaw as any).dataPoints : [];
  const trendAnalysis = {
    timeframe: '6_MONTHS',
    overallTrend: resolveTrend((trendRaw as any).overallTrend),
    averageMonthlySpend: toNumber((trendRaw as any).averageMonthlySpend),
    dataPoints: trendPointsRaw.map((p: any) => ({
      month: p.month,
      type: p.type === 'FORECAST' ? 'FORECAST' : 'HISTORICAL',
      amount: toNumber(p.amount),
    })),
    trendInsight: (trendRaw as any).trendInsight || 'No trend insights yet.',
  };

  const anomalyRaw = parseMaybeJson(raw.anomaly);
  const hasAnomaly = !!(anomalyRaw && anomalyRaw.expenseTitle);
  const anomaly = hasAnomaly ? {
    hasAnomaly: true,
    expenseTitle: anomalyRaw.expenseTitle,
    expenseAmount: toNumber(anomalyRaw.expenseAmount),
    reason: anomalyRaw.reason || (
      anomalyRaw.groupAverageExpense
        ? `Unusually large compared to group average (${formatCurrency(toNumber(anomalyRaw.groupAverageExpense).toFixed(2), currencyCode)})`
        : undefined
    ),
  } : { hasAnomaly: false };

  const settlementRaw = parseMaybeJson(raw.settlement) ?? {};
  const settlement = {
    unsettledTransactionCount: Number((settlementRaw as any).unsettledTransactionCount ?? 0),
    strategyMessage: (settlementRaw as any).strategyMessage || 'No settlement strategy available yet.',
  };

  const aiChatRaw = parseMaybeJson(raw.aiChat) ?? {};
  const aiChat = {
    initialMessage: (aiChatRaw as any).initialMessage || 'I am ready to help analyze your group spending.',
  };

  return {
    groupId,
    groupName: group.name ?? 'Group',
    currencyCode,
    currencySymbol,
    overview: {
      totalSpent,
      expenseCount,
      memberCount,
      avgPerPerson,
    },
    spendingBreakdown,
    topSpender,
    topDebtor,
    fairnessScore: raw.fairnessScore ?? 0,
    trendAnalysis,
    anomaly,
    settlement,
    aiChat,
  };
};

export function GroupAI() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useUser();
  const currentUserId = user?.id ?? '';

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<GroupAIResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<Group | null>(null);
  
  // Local Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const loadInsights = async () => {
    if (!groupId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setErrorCode(null);
    try {
      const group = await groupsService.getGroup(groupId);
      setGroupInfo(group);
      const [rawInsights, members] = await Promise.all([
        aiInsightsService.getGroupInsights(groupId),
        groupsService.getMembers(groupId),
      ]);
      const data = buildInsights(groupId, group, members, rawInsights);
      setInsights(data);
      setChatMessages([{ id: 1, sender: 'ai', text: data.aiChat.initialMessage }]);
    } catch (err) {
      const apiError = extractApiError(err);
      setErrorMessage(apiError?.message ?? 'Unable to load AI insights for this group.');
      setErrorCode(apiError?.code ?? null);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInsights(); }, [groupId]);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !insights) return;
    
    const newMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsTyping(true);
    try {
      const response = await aiService.prompt(chatInput, {
        groupId: insights.groupId,
        groupName: insights.groupName,
        currencyCode: insights.currencyCode,
        overview: insights.overview,
        spendingBreakdown: insights.spendingBreakdown,
        trendAnalysis: insights.trendAnalysis,
        settlement: insights.settlement,
      });
      const aiReply = { id: Date.now(), sender: 'ai', text: response.result || 'No response available.' };
      setChatMessages(prev => [...prev, aiReply]);
    } catch {
      const aiReply = { id: Date.now(), sender: 'ai', text: 'Unable to fetch AI response right now.' };
      setChatMessages(prev => [...prev, aiReply]);
    } finally {
      setIsTyping(false);
    }
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
    if (errorCode === 'ERR_INSIGHTS_NOT_READY') {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] text-slate-900 dark:text-white">
          <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#0A0F1C]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/5">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
              <button onClick={() => navigate(`/group/${groupId}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-bold text-base truncate">{groupInfo?.name ?? 'Group AI'}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Insights are being generated</p>
              </div>
            </div>
          </header>

          <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
              <EmptyState
                title="Insights are still preparing"
                description="Add a few expenses and check back shortly. We’ll generate spending patterns, trends, and smart settlement tips."
                action={{
                  label: 'Add expense',
                  onClick: () => navigate(`/group/${groupId}/add-expense`),
                }}
              />
              <div className="pb-8 flex items-center justify-center">
                <button
                  onClick={() => navigate(`/group/${groupId}`)}
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  Back to group
                </button>
              </div>
            </div>
          </main>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        {errorMessage ?? 'No data available for this group'}
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
                {formatCurrency(insights.overview.totalSpent.toFixed(2), insights.currencyCode)}
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
            currentUserId={currentUserId}
            onNavigate={navigate}
          />
        </motion.div>
      </main>

    </div>
  );
}
