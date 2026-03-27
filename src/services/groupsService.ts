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
    const res = await apiClient.get<any>('/home');
    const raw = res.data;

    return {
      groups: (raw.groupsPreview?.items ?? []).map((g: any) => ({
        id: g.groupId,
        name: g.name,
        groupType: g.groupType,
        currencyCode: g.currencyCode,
        status: g.status,
        myRole: g.myRole,
        memberCount: g.memberCount,
        balance: {
          netAmount: g.netBalance,
          lastComputedAt: g.lastActivityAt
        },
        version: 1,
        createdAt: g.lastActivityAt,
        updatedAt: g.lastActivityAt,
        totalExpenses: '0.00',
        settings: { simplifyDebts: true, allowMemberExpenses: true, requireApproval: false },
        features: { chat: false, whiteboard: false, aiInsights: false }
      })),
      actionItemsPreview: {
        totalCount: raw.actionItemsPreview?.totalCount ?? 0,
        items: (raw.actionItemsPreview?.items ?? []).map((a: any) => ({
          type: a.type === 'SETTLEMENT_PENDING' ? 'SETTLEMENT_APPROVAL' : 'GROUP_INVITE',
          groupId: a.group?.groupId,
          groupName: a.group?.name,
          referenceId: a.actionId,
          amount: a.amount,
          currencyCode: a.currency,
          fromUser: a.fromUser,
          createdAt: a.createdAt
        }))
      },
      recentActivity: (raw.activityPreview?.items ?? []).map((act: any) => ({
        id: act.activityId,
        groupId: act.groupId,
        eventType: act.type,
        actor: { userId: '', displayName: 'Someone', resolvedAvatar: null },
        metadata: { title: act.title, amount: act.amount },
        createdAt: act.createdAt
      }))
    };
  },

  /** BFF — single call for entire group detail screen */
  async getGroupDetail(groupId: string): Promise<GroupDetailData> {
    const res = await apiClient.get<any>(`/groups/${groupId}/detail`);
    const raw = res.data;

    // Safely extract arrays in case the backend wraps them in .items or .content
    const safeArray = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (Array.isArray(val.items)) return val.items;
      if (Array.isArray(val.content)) return val.content;
      return [];
    };

    const membersRaw = safeArray(raw.members);
    const expensesRaw = safeArray(raw.expensesPreview ?? raw.expenses);
    const currencyCode = raw.group?.currency ?? raw.group?.currencyCode ?? 'INR';

    const youAreOwed = raw.hero?.youAreOwed ?? '0.00';
    const youOwe = raw.hero?.youOwe ?? '0.00';
    const netAmount = (parseFloat(youAreOwed) - parseFloat(youOwe)).toFixed(2);

    const group = {
      id: raw.group?.groupId ?? groupId,
      name: raw.group?.name ?? 'Group',
      groupType: raw.group?.groupType ?? 'OTHER',
      currencyCode,
      status: raw.group?.status ?? 'ACTIVE',
      myRole: raw.group?.myRole ?? 'MEMBER',
      memberCount: raw.members?.totalCount ?? membersRaw.length,
      totalExpenses: raw.hero?.totalSpent ?? '0.00',
      balance: { netAmount, lastComputedAt: new Date().toISOString() },
      myNetInGroup: parseFloat(youAreOwed) > 0
        ? { direction: 'CREDITOR', amount: youAreOwed }
        : parseFloat(youOwe) > 0
          ? { direction: 'I_OWE', amount: youOwe }
          : { direction: 'SETTLED', amount: '0.00' },
      settings: { simplifyDebts: !!raw.group?.configuration?.simplifyDebts, allowMemberExpenses: true, requireApproval: !!raw.group?.configuration?.requireSettlementApproval },
      features: { chat: true, whiteboard: true, aiInsights: true },
      version: 1,
      createdAt: raw.group?.createdAt ?? new Date().toISOString(),
      updatedAt: raw.group?.updatedAt ?? new Date().toISOString()
    };

    const balanceNetAmount = (balance: any) => {
      if (!balance) return '0.00';
      if (balance.type === 'THEY_OWE') return balance.amount ?? '0.00';
      if (balance.type === 'YOU_OWE') return `-${balance.amount ?? '0.00'}`;
      if (balance.type === 'SETTLED') return '0.00';
      return balance.amount ?? '0.00';
    };

    const members = membersRaw.map((m: any) => ({
      userId: m.userId,
      userPublicId: m.userId,
      displayName: m.name,
      resolvedAvatar: m.avatarUrl ?? null,
      avatarUrl: m.avatarUrl ?? null,
      role: m.role ?? 'MEMBER',
      status: 'ACTIVE',
      balance: {
        netAmount: balanceNetAmount(m.balance),
        paidAmount: m.totalPaid ?? '0.00',
        lastComputedAt: new Date().toISOString(),
      },
      percentageOfGroup: m.percentage ?? 0,
      joinedAt: new Date().toISOString(),
    }));

    const categoryEmojiMap: Record<string, string> = {
      FOOD: '🍽️',
      TRAVEL: '✈️',
      TRANSPORT: '🚌',
      ACCOMMODATION: '🏠',
      ENTERTAINMENT: '🎬',
      SHOPPING: '🛍️',
      UTILITIES: '💡',
      MEDICAL: '🩺',
      EDUCATION: '📚',
      OTHER: '🧾',
    };

    const expenses = expensesRaw.map((e: any) => ({
      id: e.expenseId ?? e.id,
      publicId: e.expenseId ?? e.id,
      groupId,
      title: e.title,
      amount: e.amount,
      currencyCode,
      category: e.category?.type ?? e.category ?? 'OTHER',
      categoryEmoji: categoryEmojiMap[e.category?.type ?? e.category ?? 'OTHER'] ?? '🧾',
      expenseDate: e.createdAt ?? e.expenseDate ?? new Date().toISOString(),
      splitType: e.splitType ?? 'EQUAL',
      paidByUserPublicId: e.paidBy?.userId,
      paidBy: e.paidBy,
      youPaid: !!e.youPaid,
      yourShare: e.yourShare ?? '0.00',
      yourShareTotal: e.yourShareTotal ?? e.yourShare ?? '0.00',
      payers: e.paidBy ? [{
        userId: e.paidBy.userId,
        displayName: e.paidBy.name,
        resolvedAvatar: e.paidBy.avatarUrl ?? null,
        paidAmount: e.amount,
      }] : [],
      splits: [],
      createdAt: e.createdAt ?? new Date().toISOString(),
    }));

    return {
      group,
      quickInsight: raw.quickInsight,
      members,
      expenses,
      balances: safeArray(raw.balances),
      settlements: safeArray(raw.settlements),
      pagination: raw.pagination || {
        expenses: raw.expensesPreview ?? { hasMore: false, nextCursor: null, limit: 20 },
        settlements: { hasMore: false, nextCursor: null, limit: 20 }
      }
    };
  },

  async getGroups(): Promise<Group[]> {
    const res = await apiClient.get<{ groups: Group[] }>('/groups');
    return res.data.groups;
  },

  async getGroup(groupId: string): Promise<Group> {
    const res = await apiClient.get<{ group: Group } | Group>(`/groups/${groupId}`);
    const data = res.data as { group?: Group };
    return data.group ?? (res.data as Group);
  },

  async createGroup(data: CreateGroupRequest): Promise<Group> {
    const res = await apiClient.post<{ group: Group } | Group>('/groups', data);
    const payload = res.data as { group?: Group };
    return payload.group ?? (res.data as Group);
  },

  async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<Group> {
    const res = await apiClient.patch<{ group: Group } | Group>(`/groups/${groupId}`, data);
    const payload = res.data as { group?: Group };
    return payload.group ?? (res.data as Group);
  },

  async deleteGroup(groupId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}`);
  },

  async archiveGroup(groupId: string): Promise<Group> {
    const res = await apiClient.post<{ group: Group }>(`/groups/${groupId}/archive`);
    return res.data.group;
  },

  async getMembers(groupId: string): Promise<GroupMember[]> {
    const res = await apiClient.get<{ members?: any[]; items?: any[] }>(
      `/groups/${groupId}/members`
    );
    const items = res.data.members ?? res.data.items ?? [];
    return items.map((m: any) => ({
      userId: m.userId,
      displayName: m.displayName,
      resolvedAvatar: m.resolvedAvatar ?? null,
      role: m.role ?? 'MEMBER',
      status: 'ACTIVE',
      balance: {
        netAmount: m.balance?.netBalance ?? '0.00',
        paidAmount: m.balance?.paidAmount ?? '0.00',
        lastComputedAt: m.balance?.lastComputedAt ?? new Date().toISOString(),
      },
      joinedAt: m.joinedAt ?? new Date().toISOString(),
    }));
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

  async updateMemberRole(groupId: string, userId: string, role: string): Promise<void> {
    await apiClient.patch(
      `/groups/${groupId}/members/${userId}/role`,
      { role }
    );
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
