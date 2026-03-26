import { MOCK_GROUPS } from './groups';

// Dynamically generate MOCK_GROUP_MEMBERS mapping from the centralized 10x10 mock groups data
export const MOCK_GROUP_MEMBERS: Record<string, any[]> = {};

MOCK_GROUPS.forEach((group, gIndex) => {
  MOCK_GROUP_MEMBERS[group.publicId] = group.members.map((member, index) => {
    const isMe = index === 0;
    
    // Mock consistent paid amounts
    let paidAmount = 0;
    if (index === 1 && gIndex === 0) paidAmount = 4200; // User 1 top spender
    else if (isMe) paidAmount = 1500;
    else paidAmount = Math.floor(Math.random() * 1000);

    const groupTotal = 15000;
    const percentageOfGroup = Math.round((paidAmount / groupTotal) * 100);
    
    // Balance logic: positive = owes you, negative = you owe them
    let balance = 0;
    if (!isMe) {
      if (index === 1 && gIndex === 0) balance = -420; // I owe User 1 420
      else if (index === 2 && gIndex === 0) balance = 300; // User 2 owes me 300
      else if (index === 4 && gIndex === 1) balance = 450; // User 4 owes me 450
    }

    return {
      userPublicId: member.userPublicId,
      displayName: member.displayName,
      avatarUrl: member.avatarUrl,
      role: index === 0 ? 'OWNER' : 'MEMBER',
      status: 'ACTIVE',
      joinedAt: new Date(Date.now() - index * 86400000).toISOString(),
      paidAmount: paidAmount.toFixed(2),
      percentageOfGroup,
      balance: balance.toFixed(2),
      isSettled: balance === 0
    };
  });
});
