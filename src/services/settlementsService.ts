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
    return res.data;
  },

  async createSettlement(groupId: string, data: CreateSettlementRequest): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements`,
      data,
      { headers: { 'Idempotency-Key': generateIdempotencyKey() } }
    );
    return res.data.settlement;
  },

  async approveSettlement(groupId: string, settlementId: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement; correlationId: string }>(
      `/groups/${groupId}/settlements/${settlementId}/approve`
    );
    return res.data.settlement;
  },

  async rejectSettlement(groupId: string, settlementId: string, reason?: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements/${settlementId}/reject`,
      { reason }
    );
    return res.data.settlement;
  },

  async cancelSettlement(groupId: string, settlementId: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements/${settlementId}/cancel`
    );
    return res.data.settlement;
  },

  async remindMember(groupId: string, toUserId: string): Promise<void> {
    await apiClient.post(`/groups/${groupId}/remind`, { toUserId });
  },
};
