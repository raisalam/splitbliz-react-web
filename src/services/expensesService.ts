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
    return res.data;
  },

  async getExpense(groupId: string, expenseId: string): Promise<Expense> {
    const res = await apiClient.get<{ expense: Expense } | Expense>(
      `/groups/${groupId}/expenses/${expenseId}`
    );
    const data = res.data as { expense?: Expense };
    return data.expense ?? (res.data as Expense);
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
    const res = await apiClient.patch<{ expense: Expense }>(
      `/groups/${groupId}/expenses/${expenseId}`,
      data
    );
    return res.data.expense;
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
    formData.append('receipt', file);
    const res = await apiClient.post(
      `/groups/${groupId}/expenses/${expenseId}/receipt`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  async deleteReceipt(groupId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/expenses/${expenseId}/receipt`);
  },
};
