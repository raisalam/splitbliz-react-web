import { useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '../services';
import type { CreateGroupRequest, UpdateGroupRequest } from '../types';

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupRequest) =>
      groupsService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: UpdateGroupRequest }) =>
      groupsService.updateGroup(groupId, data),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      groupsService.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      groupsService.acceptInviteById(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useRejectInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      groupsService.rejectInviteById(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useGenerateInvite() {
  return useMutation({
    mutationFn: (groupId: string) =>
      groupsService.generateInvite(groupId),
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId, role }: { groupId: string; userId: string; role: string }) =>
      groupsService.updateMemberRole(groupId, userId, role),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      groupsService.removeMember(groupId, userId),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      groupsService.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useAddMembers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userIds }: { groupId: string; userIds: string[] }) =>
      groupsService.addMembers(groupId, userIds),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    },
  });
}
