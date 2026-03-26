// =============================================================================
// SplitBliz — App-level constants
// Source: Core Spec v5.3 + API Contract v1.7
// =============================================================================

/** Derive group display emoji from groupType. Backend never sends iconEmoji. */
export const GROUP_TYPE_EMOJI: Record<string, string> = {
  TRIP: '✈️',
  HOME: '🏠',
  FOOD: '🍔',
  OFFICE: '💼',
  ENTERTAINMENT: '🎬',
  SPORTS: '⚽',
  SHOPPING: '🛍️',
  OTHER: '👥', // fallback for unknown types
};

/** Plan limits — check client-side before showing create/add UI */
export const PLAN_LIMITS = {
  FREE: {
    maxGroups: 5,
    maxMembersPerGroup: 10,
    maxExpensesPerMonth: 50,
    receiptUploads: false,
    aiInsights: false,
  },
  PRO: {
    maxGroups: Infinity,
    maxMembersPerGroup: 50,
    maxExpensesPerMonth: Infinity,
    receiptUploads: true,
    aiInsights: true,
  },
} as const;

/** Currency display config */
export const CURRENCY_CONFIG: Record<string, { symbol: string; name: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' },
};

/** Expense categories — from Core Spec §9.1 */
export const EXPENSE_CATEGORIES = [
  { key: 'FOOD', label: 'Food & Drinks' },
  { key: 'TRANSPORT', label: 'Transport' },
  { key: 'ACCOMMODATION', label: 'Accommodation' },
  { key: 'ENTERTAINMENT', label: 'Entertainment' },
  { key: 'SHOPPING', label: 'Shopping' },
  { key: 'UTILITIES', label: 'Utilities' },
  { key: 'MEDICAL', label: 'Medical' },
  { key: 'TRAVEL', label: 'Travel' },
  { key: 'EDUCATION', label: 'Education' },
  { key: 'OTHER', label: 'Other' },
] as const;

/** Pagination default limit */
export const DEFAULT_PAGE_LIMIT = 20;

/** Receipt upload constraints — from Backend Architecture */
export const RECEIPT_CONSTRAINTS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

/** MQTT topics — Backend Architecture §12 */
export const MQTT_TOPICS = {
  userHints: (userId: string) => `splitbliz/users/${userId}/hints`,
  groupHints: (groupId: string) => `splitbliz/groups/${groupId}/hints`,
  groupMessages: (groupId: string) => `splitbliz/groups/${groupId}/messages`,
};

/** All API error codes mapped to their human actions */
export const ERROR_ACTIONS = {
  ERR_UNAUTHENTICATED: 'SIGN_IN',
  ERR_ACCOUNT_SUSPENDED: 'CONTACT_SUPPORT',
  ERR_LIMIT_GROUPS: 'UPGRADE_PLAN',
  ERR_UNSETTLED_BALANCES: 'SETTLE_DEBTS',
  ERR_OWNER_REQUIRED: 'TRANSFER_OWNERSHIP',
  ERR_CONFLICT: 'REFRESH',
  ERR_TRANSACTION_TIMEOUT: 'RETRY_SAME_KEY',
} as const;
