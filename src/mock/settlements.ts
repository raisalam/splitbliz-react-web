export interface Settlement {
  publicId: string;
  groupPublicId: string;
  fromUserPublicId: string;
  toUserPublicId: string;
  amount: string;
  currencyCode: string;
  note?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt?: string;
}

// All IDs now match the centralized mock data in mock/groups.ts:
//   MOCK_USER_ID = 'u0-0' (Rais)
//   Group IDs: 'g-mock-0' (Goa Trip), 'g-mock-1' (Apartment Rent), etc.
//   User IDs: 'u{groupIdx}-{memberIdx}', e.g. 'u0-1' = User 1 in Goa Trip

export const MOCK_SETTLEMENTS: Settlement[] = [
  {
    publicId: 'stl-001',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-0', // Rais (me)
    toUserPublicId: 'u0-1',   // User 1
    amount: '200.00',
    currencyCode: 'INR',
    note: 'UPI transfer',
    status: 'APPROVED',
    createdAt: '2026-03-10T14:30:00Z',
    resolvedAt: '2026-03-10T15:00:00Z'
  },
  {
    publicId: 'stl-002',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-0', // Rais
    toUserPublicId: 'u0-1',   // User 1
    amount: '100.00',
    currencyCode: 'INR',
    note: 'Wrong amount sorry',
    status: 'REJECTED',
    createdAt: '2026-03-11T10:00:00Z',
    resolvedAt: '2026-03-11T11:30:00Z'
  },
  {
    publicId: 'stl-003',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-0', // Rais
    toUserPublicId: 'u0-1',   // User 1
    amount: '150.00',
    currencyCode: 'INR',
    note: 'Google Pay',
    status: 'PENDING',
    createdAt: '2026-03-13T09:00:00Z'
  },
  // --- Incoming requests TO me (u0-0) for testing ---
  {
    publicId: 'stl-004',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-2', // User 2 in Goa Trip
    toUserPublicId: 'u0-0',   // Rais (me)
    amount: '100.00',
    currencyCode: 'INR',
    note: 'PhonePe',
    status: 'PENDING',
    createdAt: '2026-03-13T08:00:00Z'
  },
  {
    publicId: 'stl-005',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-1', // User 1
    toUserPublicId: 'u0-0',
    amount: '75.00',
    currencyCode: 'INR',
    note: 'Cash payment',
    status: 'PENDING',
    createdAt: '2026-03-13T07:30:00Z'
  },
  {
    publicId: 'stl-006',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-2', // User 2
    toUserPublicId: 'u0-0',
    amount: '50.00',
    currencyCode: 'INR',
    note: 'Dinner share',
    status: 'PENDING',
    createdAt: '2026-03-13T07:00:00Z'
  },
  {
    publicId: 'stl-007',
    groupPublicId: 'g-mock-1',
    fromUserPublicId: 'u1-4', // User 4 in Apartment Rent
    toUserPublicId: 'u0-0',
    amount: '200.00',
    currencyCode: 'INR',
    note: 'March rent share',
    status: 'PENDING',
    createdAt: '2026-03-12T18:00:00Z'
  },
  {
    publicId: 'stl-008',
    groupPublicId: 'g-mock-1',
    fromUserPublicId: 'u1-4', // User 4 in Apartment Rent
    toUserPublicId: 'u0-0',
    amount: '125.00',
    currencyCode: 'INR',
    note: 'Electricity bill',
    status: 'PENDING',
    createdAt: '2026-03-12T16:00:00Z'
  },
  {
    publicId: 'stl-009',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-1', // User 1
    toUserPublicId: 'u0-0',
    amount: '300.00',
    currencyCode: 'INR',
    note: 'Hotel refund',
    status: 'PENDING',
    createdAt: '2026-03-12T14:00:00Z'
  },
  {
    publicId: 'stl-010',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-2', // User 2
    toUserPublicId: 'u0-0',
    amount: '80.00',
    currencyCode: 'INR',
    note: 'Cab fare',
    status: 'PENDING',
    createdAt: '2026-03-12T12:00:00Z'
  },
  {
    publicId: 'stl-011',
    groupPublicId: 'g-mock-1',
    fromUserPublicId: 'u1-4', // User 4
    toUserPublicId: 'u0-0',
    amount: '90.00',
    currencyCode: 'INR',
    note: 'Groceries',
    status: 'PENDING',
    createdAt: '2026-03-12T10:00:00Z'
  },
  {
    publicId: 'stl-012',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-1', // User 1
    toUserPublicId: 'u0-0',
    amount: '60.00',
    currencyCode: 'INR',
    note: 'Snacks',
    status: 'PENDING',
    createdAt: '2026-03-12T08:00:00Z'
  },
  {
    publicId: 'stl-013',
    groupPublicId: 'g-mock-0',
    fromUserPublicId: 'u0-2', // User 2
    toUserPublicId: 'u0-0',
    amount: '45.00',
    currencyCode: 'INR',
    note: 'Auto rickshaw',
    status: 'PENDING',
    createdAt: '2026-03-11T20:00:00Z'
  },
];
