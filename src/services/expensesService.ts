// =============================================================================
// SplitBliz — Expenses service
// Bounded context: Ledger
// Endpoints: /groups/:id/expenses, /groups/:id/balances, receipts
// =============================================================================

import apiClient, { generateIdempotencyKey } from './apiClient';
import {
  Expense,
  PairwiseBalance,
  PaginationResponse,
  CreateExpenseRequest,
} from '../types';

export const expensesService = {

  async getExpenses(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ expenses: Expense[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/expenses`, { params });
    const items = res.data?.items ?? [];
    return {
      expenses: items.map((e: any) => toExpense(e)),
      pagination: res.data?.pagination ?? { nextCursor: null, hasMore: false, limit: 20 },
    };
  },

  async getExpense(groupId: string, expenseId: string): Promise<Expense> {
    const res = await apiClient.get<{ expense: Expense } | Expense>(
      `/groups/${groupId}/expenses/${expenseId}`
    );
    const data: any = (res.data as any).expense ?? res.data;
    const expense = toExpense(data);
    if (data.receiptKey) {
      try {
        const receiptRes = await apiClient.get<{ signedUrl: string }>(`/receipts/${data.receiptKey}/url`);
        expense.receiptUrl = receiptRes.data?.signedUrl ?? null;
      } catch {
        expense.receiptUrl = null;
      }
    }
    return expense;
  },

  async createExpense(groupId: string, data: CreateExpenseRequest): Promise<Expense> {
    const payload = {
      title: data.title,
      amount: data.amount,
      currencyCode: data.currencyCode,
      category: data.category,
      expenseDate: data.expenseDate,
      splitType: data.splitType,
      notes: data.notes,
      payments: data.payers?.map((p) => ({ userId: p.userId, amount: p.paidAmount })) ?? [],
      splits: data.splits?.map((s) => ({ userId: s.userId, amount: s.splitAmount })) ?? [],
    };
    const res = await apiClient.post<{ expense: Expense }>(
      `/groups/${groupId}/expenses`,
      payload,
      { headers: { 'Idempotency-Key': generateIdempotencyKey() } }
    );
    return res.data.expense;
  },

  async updateExpense(
    groupId: string,
    expenseId: string,
    data: Partial<CreateExpenseRequest> & { version: number }
  ): Promise<Expense> {
    const payload = {
      version: data.version,
      title: data.title,
      amount: data.amount,
      category: data.category,
      notes: data.notes,
      expenseDate: data.expenseDate,
      receiptKey: (data as any).receiptKey,
      payments: data.payers?.map((p) => ({ userId: p.userId, amount: p.paidAmount })) ?? [],
      splits: data.splits?.map((s) => ({ userId: s.userId, amount: s.splitAmount })) ?? [],
    };
    const res = await apiClient.patch<{ expense: Expense }>(
      `/groups/${groupId}/expenses/${expenseId}`,
      payload
    );
    const updated: any = (res.data as any).expense ?? res.data;
    return toExpense(updated);
  },

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/expenses/${expenseId}`);
  },

  async getBalances(groupId: string): Promise<PairwiseBalance[]> {
    const res = await apiClient.get<{ balances: PairwiseBalance[] }>(
      `/groups/${groupId}/balances`
    );
    return res.data.balances;
  },

  async uploadReceipt(groupId: string, expenseId: string, file: File): Promise<{ receiptUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post(`/receipts/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const receiptKey = res.data?.receiptKey ?? res.data?.key;
    if (!receiptKey) return { receiptUrl: '' };
    const urlRes = await apiClient.get(`/receipts/${receiptKey}/url`);
    return { receiptUrl: urlRes.data?.signedUrl ?? '' };
  },

  async deleteReceipt(groupId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/expenses/${expenseId}/receipt`);
  },
};

function toExpense(payload: any): Expense {
  const payments = payload.payments ?? [];
  const splits = payload.splits ?? [];
  const createdBy = payload.createdBy ?? { userId: '', displayName: 'Member', resolvedAvatar: null };

  return {
    id: payload.id,
    groupId: payload.groupId,
    title: payload.title,
    amount: payload.amount,
    currencyCode: payload.currencyCode,
    category: payload.category,
    expenseDate: payload.expenseDate,
    splitType: payload.splitType,
    payers: payments.map((p: any) => ({
      userId: p.userId,
      displayName: p.displayName ?? 'Member',
      resolvedAvatar: p.resolvedAvatar ?? null,
      paidAmount: p.amount,
    })),
    splits: splits.map((s: any) => ({
      userId: s.userId,
      displayName: s.displayName ?? 'Member',
      resolvedAvatar: s.resolvedAvatar ?? null,
      splitType: payload.splitType,
      splitAmount: s.amount,
      settledAmount: s.partialSettledAmount ?? '0.00',
      isSettled: !!s.isSettled,
    })),
    createdBy,
    receiptUrl: null,
    notes: payload.notes ?? null,
    isEditable: !payload.isLocked,
    isDeletable: !payload.isLocked,
    createdAt: payload.createdAt,
    updatedAt: payload.createdAt,
    version: payload.version ?? 1,
  };
}
