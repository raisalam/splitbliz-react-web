import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsService } from '../services';
import type { CreateSettlementRequest } from '../types';

export function useApproveSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, settlementId }: { groupId: string; settlementId: string }) =>
      settlementsService.approveSettlement(groupId, settlementId),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
    },
  });
}

export function useRejectSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, settlementId, reason }: { groupId: string; settlementId: string; reason?: string }) =>
      settlementsService.rejectSettlement(groupId, settlementId, reason),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
    },
  });
}

export function useRemindMember() {
  return useMutation({
    mutationFn: ({ groupId, toUserId }: { groupId: string; toUserId: string }) =>
      settlementsService.remindMember(groupId, toUserId),
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: CreateSettlementRequest }) =>
      settlementsService.createSettlement(groupId, data),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
    },
  });
}
