export const MOCK_USER_ID = 'u0-0'; // Rais (Current User)

// Generate 10 mock groups with 10 members each
const emojis = ['✈️', '🏠', '🍕', '⚽', '💼', '🎉', '🏖️', '☕', '🏕️', '🎮'];
const groupNames = ['Goa Trip 2026', 'Apartment Rent', 'Friday Dinner', 'Weekend Football', 'Office Lunch', 'New Year Party', 'Bali Vacay', 'Coffee Club', 'Hiking Trip', 'Gaming Squad'];

export const MOCK_GROUPS = Array.from({ length: 10 }).map((_, gIndex) => {
  const members = Array.from({ length: 10 }).map((_, mIndex) => ({
    userPublicId: `u${gIndex}-${mIndex}`,
    displayName: mIndex === 0 ? 'Rais' : `User ${mIndex}`,
    avatarUrl: `https://i.pravatar.cc/150?u=${gIndex}${mIndex}`
  }));

  // Assign the current user (Rais) as owner of the first 3 groups, member otherwise
  const isOwner = gIndex < 3;
  
  return {
    publicId: `g-mock-${gIndex}`,
    name: groupNames[gIndex],
    emoji: emojis[gIndex],
    ownerPublicId: `u${gIndex}-0`, // Owner is always index 0 (Rais) for simplicity
    planTierCode: gIndex % 2 === 0 ? 'PRO' : 'FREE',
    currencyCode: 'INR', // Forced to INR
    myRole: isOwner ? 'OWNER' : 'MEMBER',
    unreadNotificationCount: (gIndex % 3) + 1,
    lastActivityAt: new Date(Date.now() - gIndex * 86400000).toISOString(),
    memberCount: members.length,
    owedToYou: gIndex % 2 === 0 ? '450.00' : '0.00',
    youOwe: gIndex % 2 !== 0 ? '120.00' : '0.00',
    topSpender: {
      userPublicId: `u${gIndex}-1`,
      displayName: 'User 1',
      amount: '4200.00'
    },
    pendingSettlements: Math.floor(Math.random() * 3), // e.g. 0 to 2
    myNetInGroup: {
      currencyCode: 'INR',
      amount: [2, 5, 7, 9].includes(gIndex) ? '0.00' : (gIndex % 2 === 0 ? '450.00' : '120.00'),
      direction: [2, 5, 7, 9].includes(gIndex) ? 'SETTLED' as const : (gIndex % 2 === 0 ? 'CREDITOR' as const : 'I_OWE' as const)
    },
    hasActivity: ![2, 5, 7, 9].includes(gIndex),
    financialSummary: {
      currencyCode: 'INR',
      totalExpenseAmount: '15000.00',
      totalSettledAmount: '3000.00',
      pendingSettlementAmount: '12000.00'
    },
    // Adding inline members array for easy UI looping where deep fetch isn't provided
    members
  };
});
