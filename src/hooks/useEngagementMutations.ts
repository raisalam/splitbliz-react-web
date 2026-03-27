import { useMutation, useQueryClient } from '@tanstack/react-query';
import { engagementService } from '../services';
import type { SendMessageRequest } from '../types';

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: SendMessageRequest }) =>
      engagementService.sendMessage(groupId, data),
  });
}

export function useCreateWhiteboardItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: { title: string; content?: string } }) =>
      engagementService.createWhiteboardItem(groupId, data),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['whiteboard', groupId] });
    },
  });
}

export function useUpdateWhiteboardItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, itemId, data }: { groupId: string; itemId: string; data: { title?: string; content?: string } }) =>
      engagementService.updateWhiteboardItem(groupId, itemId, data),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['whiteboard', groupId] });
    },
  });
}

export function useDeleteWhiteboardItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, itemId }: { groupId: string; itemId: string }) =>
      engagementService.deleteWhiteboardItem(groupId, itemId),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['whiteboard', groupId] });
    },
  });
}
