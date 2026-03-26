import { MOCK_USER_ID } from './groups';

export const MOCK_EXPENSES: Record<string, any[]> = {
  'g-mock-0': [
    {
      publicId: 'exp-1',
      groupPublicId: 'g-mock-0',
      paidByUserPublicId: 'u0-1', // User 1 paid
      title: 'Flight Tickets',
      totalAmount: '12000.00',
      currencyCode: 'INR',
      splitType: 'EQUAL',
      expenseDate: '2026-03-01T10:00:00Z',
      status: 'ACTIVE',
      category: 'TRAVEL',
      categoryEmoji: '✈️',
      categoryColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      yourShare: '4000.00',
      note: 'Booked via MakeMyTrip, non-refundable.',
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
      participants: [
        { userPublicId: 'u0-1', shareAmount: '4000.00' },
        { userPublicId: 'u0-2', shareAmount: '4000.00' },
        { userPublicId: 'u0-0', shareAmount: '4000.00' }
      ]
    },
    {
      publicId: 'exp-2',
      groupPublicId: 'g-mock-0',
      paidByUserPublicId: 'u0-0', // Rais paid
      title: 'Dinner at Shack',
      totalAmount: '3000.00',
      currencyCode: 'INR',
      splitType: 'EQUAL',
      expenseDate: '2026-03-02T20:00:00Z',
      status: 'ACTIVE',
      category: 'FOOD',
      categoryEmoji: '🍽️',
      categoryColor: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
      yourShare: '1000.00',
      note: 'Dinner at Jimbaran Beach shack. Includes some extra drinks.',
      participants: [
        { userPublicId: 'u0-1', shareAmount: '1000.00' },
        { userPublicId: 'u0-2', shareAmount: '1000.00' },
        { userPublicId: 'u0-0', shareAmount: '1000.00' }
      ]
    }
  ],
  'g-mock-1': [
    {
      publicId: 'exp-3',
      groupPublicId: 'g-mock-1',
      paidByUserPublicId: 'u0-0', // Rais paid
      title: 'March Rent',
      totalAmount: '45000.00',
      currencyCode: 'INR',
      splitType: 'EQUAL',
      expenseDate: '2026-03-01T09:00:00Z',
      status: 'ACTIVE',
      category: 'RENT',
      categoryEmoji: '🏠',
      categoryColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      yourShare: '22500.00',
      participants: [
        { userPublicId: 'u0-0', shareAmount: '22500.00' },
        { userPublicId: 'u1-4', shareAmount: '22500.00' }
      ]
    }
  ]
};
