// =============================================================================
// SplitBliz — Type Definitions
// Source of truth: API Contract v1.7 + Core Spec v5.3
// CRITICAL: monetary values are always string — never number
// CRITICAL: SplitType uses FIXED not EXACT (API Contract v1.5 correction)
// =============================================================================

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export type GroupType =
  | 'TRIP'
  | 'HOME'
  | 'FOOD'
  | 'OFFICE'
  | 'ENTERTAINMENT'
  | 'SPORTS'
  | 'SHOPPING'
  | 'OTHER';

export type MemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type MemberStatus = 'ACTIVE' | 'REMOVED';

export type GroupStatus = 'ACTIVE' | 'FROZEN' | 'ARCHIVED';

export type PlanTier = 'FREE' | 'PRO';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_DELETE' | 'DELETED';

export type AuthProvider = 'GOOGLE' | 'FACEBOOK' | 'APPLE' | 'EMAIL';

export type SplitType = 'EQUAL' | 'FIXED' | 'PERCENTAGE' | 'SHARES';
// NOTE: EXACT was a typo in early mocks. Backend uses FIXED everywhere.

export type ExpenseCategory =
  | 'FOOD'
  | 'TRANSPORT'
  | 'ACCOMMODATION'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'UTILITIES'
  | 'MEDICAL'
  | 'TRAVEL'
  | 'EDUCATION'
  | 'OTHER';

export type SettlementStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DISPUTED';

export type CurrencyCode = 'INR' | 'USD' | 'AED' | 'SAR' | 'GBP' | 'EUR';

export type NotificationType =
  | 'SETTLEMENT_REQUEST'
  | 'SETTLEMENT_RECEIVED'
  | 'SETTLEMENT_APPROVED'
  | 'SETTLEMENT_REJECTED'
  | 'NEW_EXPENSE'
  | 'EXPENSE_ADDED'
  | 'GROUP_INVITE'
  | 'MEMBER_JOINED'
  | 'REMINDER';

export type ActivityEventType =
  | 'EXPENSE_CREATED'
  | 'EXPENSE_EDITED'
  | 'EXPENSE_DELETED'
  | 'SETTLEMENT_CREATED'
  | 'SETTLEMENT_APPROVED'
  | 'SETTLEMENT_REJECTED'
  | 'SETTLEMENT_CANCELLED'
  | 'MEMBER_JOINED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_WROTE_OFF'
  | 'MEMBER_ROLE_CHANGED'
  | 'GROUP_CREATED'
  | 'GROUP_FROZEN'
  | 'GROUP_UNFROZEN'
  | 'GROUP_ARCHIVED'
  | 'GROUP_SETTINGS_UPDATED'
  | 'PLAN_UPGRADED'
  | 'PLAN_DOWNGRADED';

export type MqttHintType =
  | 'BALANCE_UPDATED'
  | 'EXPENSE_ADDED'
  | 'SETTLEMENT_UPDATED'
  | 'MEMBER_CHANGED';

export type ApiErrorAction =
  | 'SIGN_IN'
  | 'UPGRADE_PLAN'
  | 'SETTLE_DEBTS'
  | 'TRANSFER_OWNERSHIP'
  | 'REFRESH'
  | 'RETRY'
  | 'RETRY_SAME_KEY'
  | 'FIX_REQUEST'
  | 'FIX_MATH'
  | 'FIX_PAYERS'
  | 'FIX_AMOUNT'
  | 'FIX_HEADER'
  | 'ADD_HEADER'
  | 'CONTACT_SUPPORT'
  | 'CANCEL_DELETION'
  | 'USE_CORRECT_PROVIDER'
  | 'USE_NEW_KEY'
  | 'UPGRADE_API_VERSION'
  | 'WAIT'
  | 'RETRY_AFTER'
  | 'REGISTER'
  | 'NONE';

export type ApiErrorCode =
  | 'ERR_VALIDATION'
  | 'ERR_SPLIT_MISMATCH'
  | 'ERR_PAYMENT_SUM_MISMATCH'
  | 'ERR_INVALID_AMOUNT'
  | 'ERR_IDEMPOTENCY_KEY_REQUIRED'
  | 'ERR_IDEMPOTENCY_KEY_INVALID'
  | 'ERR_FILE_TOO_LARGE'
  | 'ERR_FILE_TYPE_INVALID'
  | 'ERR_UNAUTHENTICATED'
  | 'ERR_INSUFFICIENT_PERMS'
  | 'ERR_FEATURE_DISABLED'
  | 'ERR_ACCOUNT_SUSPENDED'
  | 'ERR_ACCOUNT_PENDING_DELETE'
  | 'ERR_PROVIDER_DISABLED'
  | 'ERR_NOT_FOUND'
  | 'ERR_API_VERSION_SUNSET'
  | 'ERR_PENDING_SETTLEMENT'
  | 'ERR_ALREADY_PROCESSING'
  | 'ERR_IDEMPOTENCY_KEY_MISMATCH'
  | 'ERR_PROVIDER_MISMATCH'
  | 'ERR_PAYER_NOT_SPLITTER'
  | 'ERR_SELF_SETTLEMENT'
  | 'ERR_EXPENSE_AMOUNT_LOCKED'
  | 'ERR_EXPENSE_DELETE_LOCKED'
  | 'ERR_MEMBER_HAS_BALANCE'
  | 'ERR_CURRENCY_LOCKED'
  | 'ERR_OWNER_REQUIRED'
  | 'ERR_UNSETTLED_BALANCES'
  | 'ERR_SETTLEMENT_EXCEEDS_DEBT'
  | 'ERR_PARTIAL_EXCEEDS_SPLIT'
  | 'ERR_INVITE_INVALID'
  | 'ERR_INVITE_EXPIRED'
  | 'ERR_INVITE_ALREADY_MEMBER'
  | 'ERR_ACCOUNT_DELETED'
  | 'ERR_RATE_LIMIT_EXCEEDED'
  | 'ERR_ACCOUNT_LOCKED_TEMP'
  | 'ERR_SIMPLIFY_DEBTS_LOCKED'
  | 'ERR_CONFLICT'
  | 'ERR_TRANSACTION_TIMEOUT'
  | 'ERR_INTERNAL';

// -----------------------------------------------------------------------------
// Shared sub-types
// -----------------------------------------------------------------------------

/** Compact user reference — embedded inside expenses, settlements, messages, activity */
export interface UserReference {
  userId: string;
  displayName: string;
  resolvedAvatar: string | null; // URL | emoji | null
}

/** Full pagination response object — present on all list endpoints */
export interface PaginationResponse {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

/** Standard API error shape — every error, every endpoint */
export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    action: ApiErrorAction;
    details: {
      fields?: Array<{ field: string; message: string }>;
      retryAfterSeconds?: number;
    } | null;
  };
}

// -----------------------------------------------------------------------------
// Identity context
// -----------------------------------------------------------------------------

export interface UserSettings {
  preferences: {
    defaultCurrency: CurrencyCode;
    language: string;
    darkMode: boolean;
  };
  notifications: {
    push: boolean;
    email: boolean;
    settlementRequests: boolean;
    newExpenses: boolean;
    emailSummaries: boolean;
    reminders: boolean;
  };
}

/** Full user object — returned by all auth endpoints and GET /users/me */
export interface UserFull {
  id: string;
  displayName: string;
  email: string;
  resolvedAvatar: string | null;
  planTier: PlanTier;
  status: UserStatus;
  provider: AuthProvider;
  createdAt: string; // ISO 8601 UTC
  unreadNotificationCount: number;
  settings: UserSettings;
}

export interface UserContact {
  userId: string;
  displayName: string;
  resolvedAvatar: string | null;
  email: string;
}

export interface ActionItem {
  type: 'SETTLEMENT_APPROVAL' | 'GROUP_INVITE';
  groupId: string;
  groupName: string;
  referenceId: string;
  amount?: string; // decimal string
  currencyCode?: CurrencyCode;
  fromUser?: UserReference;
  inviteCode?: string;
  createdAt: string;
}

export interface ActionItemsPreview {
  totalCount: number;
  items: ActionItem[];
}

// -----------------------------------------------------------------------------
// Group context
// -----------------------------------------------------------------------------

export interface MemberBalance {
  netAmount: string;       // decimal string — negative means owes, positive means owed
  paidAmount: string;      // total paid across all expenses
  lastComputedAt: string;  // ISO 8601 UTC
}

export interface GroupMember {
  userId: string;
  displayName: string;
  resolvedAvatar: string | null;
  role: MemberRole;
  status: MemberStatus;
  balance: MemberBalance;
  joinedAt: string;
}

export interface GroupSettings {
  simplifyDebts: boolean;
  allowMemberExpenses: boolean;
  requireApproval: boolean;
}

export interface GroupFeatures {
  chat: boolean;
  whiteboard: boolean;
  aiInsights: boolean;
}

/** Group object — returned by GET /groups and GET /groups/:id */
export interface Group {
  id: string;
  name: string;
  groupType: GroupType;
  // NOTE: iconEmoji is NEVER sent by backend — derive from groupType using GROUP_TYPE_EMOJI map
  currencyCode: CurrencyCode;
  status: GroupStatus;
  myRole: MemberRole;     // authenticated user's role in this group
  memberCount: number;
  totalExpenses: string;  // decimal string
  balance?: {
    netAmount: string;
    lastComputedAt: string;
  };
  settings: GroupSettings;
  features: GroupFeatures;
  createdAt: string;
  updatedAt: string;
  version: number;        // optimistic concurrency — send back on PATCH
}

export interface GroupInvite {
  inviteCode: string;
  inviteUrl: string;
  expiresAt: string;
}

// -----------------------------------------------------------------------------
// Ledger context
// -----------------------------------------------------------------------------

export interface ExpenseSplit {
  userId: string;
  displayName: string;
  resolvedAvatar: string | null;
  splitType: SplitType;
  splitAmount: string;    // decimal string — the share this user owes
  settledAmount: string;  // decimal string — how much has been settled
  isSettled: boolean;
}

export interface ExpensePayer {
  userId: string;
  displayName: string;
  resolvedAvatar: string | null;
  paidAmount: string;     // decimal string
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: string;         // decimal string — e.g. "18000.00"
  currencyCode: CurrencyCode;
  category: ExpenseCategory;
  expenseDate: string;    // YYYY-MM-DD — no time, no timezone
  splitType: SplitType;
  payers: ExpensePayer[];
  splits: ExpenseSplit[];
  createdBy: UserReference;
  receiptUrl: string | null; // pre-signed URL with 1-hour expiry — never store this
  notes: string | null;
  isEditable: boolean;
  isDeletable: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;        // optimistic concurrency — send back on PATCH
}

export interface PairwiseBalance {
  fromUserId: string;
  fromDisplayName: string;
  fromResolvedAvatar: string | null;
  toUserId: string;
  toDisplayName: string;
  toResolvedAvatar: string | null;
  amount: string;         // decimal string — always positive
  currencyCode: CurrencyCode;
}

// -----------------------------------------------------------------------------
// Treasury context
// -----------------------------------------------------------------------------

export interface Settlement {
  id: string;
  groupId: string;
  fromUser: UserReference;
  toUser: UserReference;
  amount: string;         // decimal string
  currencyCode: CurrencyCode;
  status: SettlementStatus;
  paymentMethod: string | null;
  notes: string | null;
  correlationId: string | null; // matches MQTT hint correlationId
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Activity context
// -----------------------------------------------------------------------------

export interface ActivityEntry {
  id: string;
  groupId: string;
  eventType: ActivityEventType;
  actor: UserReference;
  metadata: Record<string, string>; // keys vary per eventType — see API contract §9
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Notification context
// -----------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  groupId: string | null;
  referenceId: string | null;
  data?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Engagement context — Chat & Whiteboard
// -----------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  clientMessageId: string; // UUID v4 generated client-side — used for deduplication
  groupId: string;
  sender: UserReference;
  content: string;
  createdAt: string;
}

export interface WhiteboardItem {
  id: string;
  groupId: string;
  title: string;
  content: string | null;
  createdBy: UserReference;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// System
// -----------------------------------------------------------------------------

export interface SystemConfig {
  authProviders: {
    google: boolean;
    facebook: boolean;
    apple: boolean;
    emailPassword: boolean;
  };
  maintenance: boolean;
}

// -----------------------------------------------------------------------------
// MQTT
// -----------------------------------------------------------------------------

export interface MqttHint {
  type: MqttHintType;
  groupId: string;
  correlationId: string;
}

export interface MqttChatMessage extends ChatMessage {}

// -----------------------------------------------------------------------------
// BFF response shapes — aggregated screen endpoints
// -----------------------------------------------------------------------------

/** GET /home — single-call BFF for home screen */
export interface HomeScreenData {
  groups: Group[];
  actionItemsPreview: ActionItemsPreview;
  recentActivity: ActivityEntry[];
}

/** GET /groups/:groupId/detail — single-call BFF for group detail screen */
export interface GroupDetailData {
  group: Group;
  members: GroupMember[];
  expenses: Expense[];
  balances: PairwiseBalance[];
  settlements: Settlement[];
  quickInsight?: {
    type: 'YOU_ARE_OWED' | 'YOU_OWE' | 'ALL_SETTLED' | string;
    title: string;
    subtitle?: string;
    cta?: {
      label: string;
      action: string;
      meta?: Record<string, string>;
    };
  };
  pagination: {
    expenses: PaginationResponse;
    settlements: PaginationResponse;
  };
}

// -----------------------------------------------------------------------------
// Request body shapes
// -----------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface FacebookAuthRequest {
  accessToken: string;
}

export interface CreateGroupRequest {
  name: string;
  groupType: GroupType;
  currencyCode: CurrencyCode;
  settings?: Partial<GroupSettings>;
}

export interface UpdateGroupRequest {
  name?: string;
  groupType?: GroupType;
  settings?: Partial<GroupSettings>;
  version: number; // required for optimistic concurrency
}

export interface CreateExpenseRequest {
  title: string;
  amount: string;         // decimal string
  currencyCode: CurrencyCode;
  category: ExpenseCategory;
  expenseDate: string;    // YYYY-MM-DD
  splitType: SplitType;
  payers: Array<{ userId: string; paidAmount: string }>;
  splits: Array<{ userId: string; splitAmount: string }>;
  notes?: string;
  // Idempotency-Key header is required — add as UUID v4 in the service layer
}

export interface CreateSettlementRequest {
  toUserId: string;
  amount: string;         // decimal string
  currencyCode: CurrencyCode;
  paymentMethod?: string;
  notes?: string;
  // Idempotency-Key header is required — add as UUID v4 in the service layer
}

export interface SendMessageRequest {
  content: string;
  clientMessageId: string; // UUID v4 generated client-side before sending
}
