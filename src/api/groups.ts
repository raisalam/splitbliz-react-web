import { MOCK_GROUPS, MOCK_USER_ID } from '../mock/groups';
import { MOCK_GROUP_MEMBERS } from '../mock/members';
import { MOCK_PAIR_BALANCES } from '../mock/balances';
import { MOCK_EXPENSES } from '../mock/expenses';
import { MOCK_SETTLEMENTS, type Settlement } from '../mock/settlements';

export { MOCK_USER_ID };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getGroupById(groupId: string) {
  await delay(500);
  const group = MOCK_GROUPS.find(g => g.publicId === groupId);
  if (!group) throw new Error('Group not found');
  return group;
}

export async function getGroupMembers(groupId: string) {
  await delay(500);
  return MOCK_GROUP_MEMBERS[groupId] || [];
}

export async function getGroupPairwiseBalances(groupId: string) {
  await delay(500);
  return MOCK_PAIR_BALANCES[groupId] || [];
}

export async function getGroupExpenses(groupId: string) {
  await delay(500);
  return {
    content: MOCK_EXPENSES[groupId] || [],
    page: 0,
    size: 20,
    totalElements: (MOCK_EXPENSES[groupId] || []).length
  };
}

export async function createExpense(groupId: string, data: any) {
  await delay(800);
  
  const newExpense = {
    publicId: `exp-${Math.random().toString(36).substring(7)}`,
    groupPublicId: groupId,
    title: data.title,
    totalAmount: data.totalAmount,
    currencyCode: data.currencyCode,
    splitType: data.splitType,
    expenseDate: data.expenseDate || new Date().toISOString(),
    status: 'ACTIVE',
    category: data.category || 'GENERAL',
    payers: data.payers,
    participants: data.participants,
    // Add backward compatible payer mock logic for rendering in lists
    paidByUserPublicId: data.payers && data.payers.length > 0 ? data.payers[0].userPublicId : undefined
  };

  if (!MOCK_EXPENSES[groupId]) {
    MOCK_EXPENSES[groupId] = [];
  }
  MOCK_EXPENSES[groupId].unshift(newExpense); // add to top
  
  return newExpense;
}

export async function requestSettlement(groupId: string, data: any) {
  await delay(800);
  const newSettlement: Settlement = {
    publicId: `stl-${Math.random().toString(36).substring(7)}`,
    groupPublicId: groupId,
    fromUserPublicId: MOCK_USER_ID,
    toUserPublicId: data.payeeUserPublicId,
    amount: data.amount,
    currencyCode: data.currencyCode,
    note: data.note,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  MOCK_SETTLEMENTS.push(newSettlement);
  return newSettlement;
}

export async function getGroupSettlements(groupId: string): Promise<Settlement[]> {
  await delay(300);
  return MOCK_SETTLEMENTS.filter(s => s.groupPublicId === groupId);
}

export async function approveSettlement(settlementId: string) {
  await delay(500);
  const s = MOCK_SETTLEMENTS.find(s => s.publicId === settlementId);
  if (s) {
    s.status = 'APPROVED';
    s.resolvedAt = new Date().toISOString();
  }
  return s;
}

export async function rejectSettlement(settlementId: string) {
  await delay(500);
  const s = MOCK_SETTLEMENTS.find(s => s.publicId === settlementId);
  if (s) {
    s.status = 'REJECTED';
    s.resolvedAt = new Date().toISOString();
  }
  return s;
}

export async function remindMember(groupId: string, targetUserId: string) {
  await delay(500);
  return { success: true };
}
