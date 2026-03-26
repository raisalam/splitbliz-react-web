// =============================================================================
// SplitBliz — Groups service
// Bounded context: Group
// Endpoints: /groups, /groups/:id, /groups/:id/members, /groups/:id/invites
// =============================================================================

import apiClient from './apiClient';
import {
  Group,
  GroupMember,
  GroupDetailData,
  HomeScreenData,
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupInvite,
} from '../types';

export const groupsService = {

  /** BFF — single call for entire home screen */
  async getHomeData(): Promise<HomeScreenData> {
    const res = await apiClient.get<HomeScreenData>('/home');
    return res.data;
  },

  /** BFF — single call for entire group detail screen */
  async getGroupDetail(groupId: string): Promise<GroupDetailData> {
    const res = await apiClient.get<GroupDetailData>(`/groups/${groupId}/detail`);
    return res.data;
  },

  async getGroups(): Promise<Group[]> {
    const res = await apiClient.get<{ groups: Group[] }>('/groups');
    return res.data.groups;
  },

  async getGroup(groupId: string): Promise<Group> {
    const res = await apiClient.get<{ group: Group }>(`/groups/${groupId}`);
    return res.data.group;
  },

  async createGroup(data: CreateGroupRequest): Promise<Group> {
    const res = await apiClient.post<{ group: Group }>('/groups', data);
    return res.data.group;
  },

  async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    const res = await apiClient.patch<{ group: Group }>(`/groups/${groupId}`, data);
    return res.data.group;
  },

  async deleteGroup(groupId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}`);
  },

  async archiveGroup(groupId: string): Promise<Group> {
    const res = await apiClient.post<{ group: Group }>(`/groups/${groupId}/archive`);
    return res.data.group;
  },

  async getMembers(groupId: string): Promise<GroupMember[]> {
    const res = await apiClient.get<{ members: GroupMember[] }>(`/groups/${groupId}/members`);
    return res.data.members;
  },

  async addMembers(groupId: string, userIds: string[]): Promise<GroupMember[]> {
    const res = await apiClient.post<{ members: GroupMember[] }>(
      `/groups/${groupId}/members`,
      { userIds }
    );
    return res.data.members;
  },

  async removeMember(groupId: string, userId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<GroupMember> {
    const res = await apiClient.patch<{ member: GroupMember }>(
      `/groups/${groupId}/members/${userId}/role`,
      { role }
    );
    return res.data.member;
  },

  async leaveGroup(groupId: string): Promise<void> {
    await apiClient.post(`/groups/${groupId}/leave`);
  },

  async generateInvite(groupId: string): Promise<GroupInvite> {
    const res = await apiClient.post<GroupInvite>(`/groups/${groupId}/invites`);
    return res.data;
  },

  async joinByInvite(inviteCode: string): Promise<Group> {
    const res = await apiClient.post<{ group: Group }>(`/groups/join`, { inviteCode });
    return res.data.group;
  },
};
