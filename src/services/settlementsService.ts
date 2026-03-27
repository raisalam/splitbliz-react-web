// =============================================================================
// SplitBliz — Settlements service
// Bounded context: Treasury
// Endpoints: /groups/:id/settlements, /settlements/:id/*
// =============================================================================

import apiClient, { generateIdempotencyKey } from './apiClient';
import { Settlement, CreateSettlementRequest, PaginationResponse } from '../types';

export const settlementsService = {

  async getSettlements(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ settlements: Settlement[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/settlements`, { params });
    const items = res.data?.items ?? [];
    return {
      settlements: items.map((s: any) => ({
        id: s.id,
        groupId: s.groupId,
        fromUser: s.fromUser,
        toUser: s.toUser,
        amount: s.amount,
        currencyCode: s.currencyCode,
        status: s.status,
        paymentMethod: s.paymentMethod ?? null,
        notes: s.notes ?? null,
        correlationId: null,
        createdAt: s.createdAt,
        updatedAt: s.resolvedAt ?? s.createdAt,
      })),
      pagination: res.data?.pagination ?? { nextCursor: null, hasMore: false, limit: 20 },
    };
  },

  async createSettlement(groupId: string, data: CreateSettlementRequest): Promise<Settlement> {
    const payload = {
      toUserId: data.toUserId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentReference: (data as any).paymentReference,
      notes: data.notes,
    };
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements`,
      payload,
      { headers: { 'Idempotency-Key': generateIdempotencyKey() } }
    );
    const s: any = (res.data as any).settlement ?? res.data;
    return {
      id: s.id,
      groupId: s.groupId,
      fromUser: s.fromUser,
      toUser: s.toUser,
      amount: s.amount,
      currencyCode: s.currencyCode,
      status: s.status,
      paymentMethod: s.paymentMethod ?? null,
      notes: s.notes ?? null,
      correlationId: null,
      createdAt: s.createdAt,
      updatedAt: s.resolvedAt ?? s.createdAt,
    };
  },

  async approveSettlement(groupId: string, settlementId: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement; correlationId: string }>(
      `/groups/${groupId}/settlements/${settlementId}/approve`
    );
    const s: any = (res.data as any).settlement ?? res.data;
    return {
      id: s.id,
      groupId: s.groupId,
      fromUser: s.fromUser,
      toUser: s.toUser,
      amount: s.amount,
      currencyCode: s.currencyCode,
      status: s.status,
      paymentMethod: s.paymentMethod ?? null,
      notes: s.notes ?? null,
      correlationId: (res.data as any).correlationId ?? null,
      createdAt: s.createdAt,
      updatedAt: s.resolvedAt ?? s.createdAt,
    };
  },

  async rejectSettlement(groupId: string, settlementId: string, reason?: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements/${settlementId}/reject`,
      { reason }
    );
    const s: any = (res.data as any).settlement ?? res.data;
    return {
      id: s.id ?? settlementId,
      groupId,
      fromUser: s.fromUser,
      toUser: s.toUser,
      amount: s.amount,
      currencyCode: s.currencyCode,
      status: s.status ?? 'REJECTED',
      paymentMethod: s.paymentMethod ?? null,
      notes: s.notes ?? null,
      correlationId: null,
      createdAt: s.createdAt ?? new Date().toISOString(),
      updatedAt: s.resolvedAt ?? new Date().toISOString(),
    };
  },

  async cancelSettlement(groupId: string, settlementId: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements/${settlementId}/cancel`
    );
    const s: any = (res.data as any).settlement ?? res.data;
    return {
      id: s.id ?? settlementId,
      groupId,
      fromUser: s.fromUser,
      toUser: s.toUser,
      amount: s.amount,
      currencyCode: s.currencyCode,
      status: s.status ?? 'CANCELLED',
      paymentMethod: s.paymentMethod ?? null,
      notes: s.notes ?? null,
      correlationId: null,
      createdAt: s.createdAt ?? new Date().toISOString(),
      updatedAt: s.resolvedAt ?? new Date().toISOString(),
    };
  },

  async remindMember(groupId: string, toUserId: string): Promise<void> {
    await apiClient.post(`/groups/${groupId}/remind`, { toUserId });
  },
};
