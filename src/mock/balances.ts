export const MOCK_PAIR_BALANCES: Record<string, any[]> = {
  'g-mock-0': [
    {
      groupPublicId: 'g-mock-0',
      userLowPublicId: 'u0-1', // User 1
      userHighPublicId: 'u0-0', // Rais
      netAmount: '-420.00', // Rais owes User 1 420
      currencyCode: 'INR',
      computedAt: '2026-03-06T10:00:00Z',
      stale: false
    },
    {
      groupPublicId: 'g-mock-0',
      userLowPublicId: 'u0-2', // User 2
      userHighPublicId: 'u0-0', // Rais
      netAmount: '300.00', // User 2 owes Rais 300
      currencyCode: 'INR',
      computedAt: '2026-03-06T10:00:00Z',
      stale: false
    }
    // Net for Rais = -420 + 300 = -120 (I_OWE 120)
  ],
  'g-mock-1': [
    {
      groupPublicId: 'g-mock-1',
      userLowPublicId: 'u0-0', // Rais
      userHighPublicId: 'u1-4', // User 4 in Apartment Rent
      netAmount: '450.00', // User 4 owes Rais 450
      currencyCode: 'INR',
      computedAt: '2026-03-05T14:30:00Z',
      stale: false
    }
    // Net for Rais = 450 (CREDITOR 450)
  ]
};
