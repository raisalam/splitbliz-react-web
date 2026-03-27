// =============================================================================
// SplitBliz — AI Insights service
// Endpoint: /groups/:groupId/ai-insights
// =============================================================================

import apiClient from './apiClient';

export type GroupAiInsightsResponse = {
  generatedAt: string | null;
  windowStart: string | null;
  windowEnd: string | null;
  fairnessScore: number;
  overview: {
    totalSpent: string | number;
    expenseCount: number;
    memberCount: number;
    avgPerPerson: string | number;
  } | null;
  spendingBreakdown: Array<{
    category: string;
    amount: string | number;
    percentage: number;
  }> | null;
  topSpender: {
    userId: string;
    name: string;
    amount: string | number;
  } | null;
  topDebtor: {
    userId: string;
    name: string;
    amountOwed: string | number;
  } | null;
  trendAnalysis: {
    overallTrend: string;
    trendInsight: string | null;
    averageMonthlySpend: string | number;
    dataPoints: Array<{
      month: string;
      type: 'HISTORICAL' | 'FORECAST' | string;
      amount: string | number;
    }>;
  } | null;
  anomaly: {
    expenseTitle: string;
    expenseAmount: string | number;
    groupAverageExpense: string | number;
    reason?: string | null;
  } | null;
  settlement: {
    unsettledTransactionCount: number;
    strategyMessage?: string | null;
  } | null;
  aiChat: {
    initialMessage?: string | null;
  } | null;
  actions?: unknown;
};

export const aiInsightsService = {
  async getGroupInsights(groupId: string): Promise<GroupAiInsightsResponse> {
    const res = await apiClient.get<GroupAiInsightsResponse>(`/groups/${groupId}/ai-insights`);
    return res.data;
  },
};
