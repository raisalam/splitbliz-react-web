# SplitBliz Web — Frontend Architecture
**Version 1.0 — Generated from Backend Architecture v1.0 + Core Spec v5.3 + API Contract v1.7**
**Status: Hand this entire file to your agent. Execute steps in order. Commit after each step.**

---

## The One Rule

> Every step in this document moves or creates files only.
> No JSX changes. No style changes. No hardcoded value replacements.
> The app must look and behave identically after every step.
> Run the app after each step. If it breaks, fix before moving on.

---

## Step 1 — Package Rename + Dead File Cleanup

**Time: 15 minutes. One commit.**

### Agent prompt

```
In package.json:
- Change "name" from "@figma/my-make-file" to "splitbliz-web"
- Move "react" and "react-dom" from peerDependencies into dependencies
- Remove the "next-themes" package — the app uses a custom ThemeProvider

Then delete these:
- src/imports/   (empty folder, never used)

Do not touch any other file. Run the app and confirm it starts.
Commit: "chore: rename package, remove dead files"
```

---

## Step 2 — Folder Structure Migration

**Time: half a day. One commit.**

### Target structure

```
src/
  features/
    auth/
      Login.tsx
      SignUp.tsx
      Splash.tsx
      ProfileSetup.tsx
      FirstGroup.tsx
    groups/
      GroupDetail.tsx
      GroupSettings.tsx
      CreateGroup.tsx
      GroupActivity.tsx
    expenses/
      AddExpense.tsx
      ExpenseDetail.tsx
    settlements/
      SettleUp.tsx
    notifications/
      Notifications.tsx
    profile/
      ProfileSettings.tsx
    ai/
      GroupAI.tsx
    chat/
      GroupChat.tsx
    whiteboard/
      GroupWhiteboard.tsx
  components/
    GroupAvatar.tsx          ← moved from ui/
    GroupListItem.tsx        ← moved from ui/
    ImageWithFallback.tsx    ← moved from figma/
    ui/                      ← all 46 shadcn primitives stay here untouched
  providers/
    ThemeProvider.tsx        ← moved from components/
  hooks/
    use-mobile.ts            ← moved from ui/
  services/                  ← empty for now, created in Step 5
  constants/                 ← empty for now, created in Step 4
  types/                     ← empty for now, created in Step 3
  mock/                      ← untouched
  styles/                    ← untouched
  utils/
    expenseCalculator.ts     ← stays here
  api/
    groups.ts                ← stays here for now
  app/
    App.tsx
    routes.tsx
    Root.tsx
    ThemeToggle.tsx
  main.tsx
```

### Agent prompt

```
Restructure src/ exactly as follows. Move files only — do not edit any file content.
After moving every file, find and fix all broken import paths across the entire codebase.
Use your IDE's find-and-replace or refactor tool to update imports automatically.

Moves to perform:
1. src/app/components/Login.tsx          → src/features/auth/Login.tsx
2. src/app/components/SignUp.tsx         → src/features/auth/SignUp.tsx
3. src/app/components/Splash.tsx         → src/features/auth/Splash.tsx
4. src/app/components/ProfileSetup.tsx   → src/features/auth/ProfileSetup.tsx
5. src/app/components/FirstGroup.tsx     → src/features/auth/FirstGroup.tsx
6. src/app/components/GroupDetail.tsx    → src/features/groups/GroupDetail.tsx
7. src/app/components/GroupSettings.tsx  → src/features/groups/GroupSettings.tsx
8. src/app/components/CreateGroup.tsx    → src/features/groups/CreateGroup.tsx
9. src/app/components/GroupActivity.tsx  → src/features/groups/GroupActivity.tsx
10. src/app/components/AddExpense.tsx    → src/features/expenses/AddExpense.tsx
11. src/app/components/ExpenseDetail.tsx → src/features/expenses/ExpenseDetail.tsx
12. src/app/components/SettleUp.tsx      → src/features/settlements/SettleUp.tsx
13. src/app/components/Notifications.tsx → src/features/notifications/Notifications.tsx
14. src/app/components/ProfileSettings.tsx → src/features/profile/ProfileSettings.tsx
15. src/app/components/GroupAI.tsx       → src/features/ai/GroupAI.tsx
16. src/app/components/GroupChat.tsx     → src/features/chat/GroupChat.tsx
17. src/app/components/GroupWhiteboard.tsx → src/features/whiteboard/GroupWhiteboard.tsx
18. src/app/components/ui/GroupAvatar.tsx   → src/components/GroupAvatar.tsx
19. src/app/components/ui/GroupListItem.tsx → src/components/GroupListItem.tsx
20. src/app/components/ui/InviteMemberSheet.tsx → src/components/InviteMemberSheet.tsx
21. src/app/components/ui/PendingApprovalsSheet.tsx → src/components/PendingApprovalsSheet.tsx
22. src/app/components/figma/ImageWithFallback.tsx → src/components/ImageWithFallback.tsx
23. src/app/components/ThemeProvider.tsx → src/providers/ThemeProvider.tsx
24. src/app/components/ui/use-mobile.ts  → src/hooks/use-mobile.ts
25. src/app/components/ui/utils.ts       → src/utils/cn.ts
26. All remaining shadcn files in src/app/components/ui/ → src/components/ui/ (keep all 46 files)
27. src/app/components/Home.tsx          → src/features/home/Home.tsx
28. src/app/components/Root.tsx          → src/app/Root.tsx
29. src/app/components/ThemeToggle.tsx   → src/app/ThemeToggle.tsx

After all moves, update src/app/routes.tsx to import from the new paths.
Update src/app/App.tsx and src/main.tsx for new provider/root paths.

Create these empty folders with a .gitkeep file each:
- src/services/
- src/constants/
- src/types/

Run the app. Confirm all routes still load.
Commit: "refactor: restructure folders by feature and layer"
```

---

## Step 3 — Types Layer

**Time: half a day. One commit.**

**Critical rules from API Contract v1.7:**
- All monetary values are `string` — never `number`. Example: `"18000.00"`
- All timestamps are ISO 8601 UTC strings ending in `Z`
- All UUIDs are lowercase hyphenated v4 strings
- Nullable fields are always explicitly `null` — never omitted
- `SplitType` is `FIXED` — NOT `EXACT` (corrected in v1.5)
- Backend never sends `iconEmoji` — emoji is derived client-side from `groupType`

### Agent prompt

```
Create the file src/types/index.ts with exactly the following content.
Do not modify any existing file. Just create this one file.
```

### `src/types/index.ts`

```typescript
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
  | 'SETTLEMENT_APPROVED'
  | 'SETTLEMENT_REJECTED'
  | 'NEW_EXPENSE'
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
```

### Agent commit message
```
chore: add types layer derived from API Contract v1.7
```

---

## Step 4 — Constants Layer

**Time: half a day. One commit.**

### Agent prompt

```
Create the following three files exactly as specified.
Do not modify any existing file.
```

### `src/constants/colors.ts`

```typescript
// =============================================================================
// SplitBliz — Color constants
// Source: audit of all hardcoded hex values across the codebase
// These are definitions only. Do NOT replace usages yet — that is a later phase.
// =============================================================================

export const colors = {
  // Primary brand purple
  primary: '#6c5ce7',
  primaryLight: '#a29bfe',
  primaryFaint: '#f0eeff',

  // Backgrounds
  pageBg: '#f4f2fb',
  surfaceBg: '#ffffff',
  darkBg: '#1a1625',
  darkSurface: '#2d2640',

  // Text
  textPrimary: '#1a1625',
  textMuted: '#9490b8',
  textOnPrimary: '#ffffff',

  // Semantic
  success: '#0f6e56',
  successLight: '#e1f5ee',
  danger: '#e74c3c',
  dangerLight: '#fdecea',
  warning: '#f39c12',
  warningLight: '#fef9e7',
  info: '#3498db',
  infoLight: '#ebf5fb',

  // Borders & dividers
  border: '#e0ddf5',
  divider: '#f0eeff',

  // Avatar palette — used for generated member avatars
  avatarPalette: [
    '#6c5ce7', '#00b894', '#fd79a8', '#fdcb6e',
    '#e17055', '#74b9ff', '#a29bfe', '#55efc4',
  ],

  // Overlays
  overlay10: 'rgba(108, 92, 231, 0.10)',
  overlay25: 'rgba(108, 92, 231, 0.25)',
  white50: 'rgba(255, 255, 255, 0.50)',
  white20: 'rgba(255, 255, 255, 0.20)',
  white18: 'rgba(255, 255, 255, 0.18)',
} as const;

export type ColorKey = keyof typeof colors;
```

### `src/constants/typography.ts`

```typescript
// =============================================================================
// SplitBliz — Typography constants
// Source: audit of all hardcoded font sizes across the codebase
// =============================================================================

export const fontSize = {
  xs: '11px',
  sm: '12px',
  base: '13px',
  md: '14px',
  lg: '15px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '20px',
  '4xl': '24px',
  '5xl': '28px',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: '1.2',
  normal: '1.5',
  relaxed: '1.7',
} as const;

export type FontSizeKey = keyof typeof fontSize;
```

### `src/constants/spacing.ts`

```typescript
// =============================================================================
// SplitBliz — Spacing constants
// =============================================================================

export const spacing = {
  '0': '0px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
} as const;

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export type SpacingKey = keyof typeof spacing;
```

### `src/constants/app.ts`

```typescript
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
```

### Agent commit message
```
chore: add constants layer — colors, typography, spacing, app config
```

---

## Step 5 — Services Layer (API Base Client)

**Time: half a day. One commit.**

**Critical rules from API Contract v1.7:**
- Auth: `Authorization: Bearer <jwt>` on every authenticated request
- Every request sends `X-Request-Id: <uuid-v4>` header
- `Idempotency-Key: <uuid-v4>` required on POST /expenses and POST /settlements
- Base URL comes from `VITE_API_BASE_URL` env variable
- Error shape is always `{ error: { code, message, action, details } }`

### Agent prompt

```
Create the following files exactly as specified.
Install axios if not already installed: npm install axios
Install uuid: npm install uuid && npm install -D @types/uuid
Do not modify any existing file.
```

### `.env`

```
VITE_API_BASE_URL=http://localhost:8080/v1
VITE_APP_NAME=SplitBliz
VITE_MQTT_URL=wss://mqtt.splitbliz.com/mqtt
```

### `.env.example`

```
VITE_API_BASE_URL=http://localhost:8080/v1
VITE_APP_NAME=SplitBliz
VITE_MQTT_URL=wss://mqtt.splitbliz.com/mqtt
```

### `.env.production`

```
VITE_API_BASE_URL=https://api.splitbliz.com/v1
VITE_APP_NAME=SplitBliz
VITE_MQTT_URL=wss://mqtt.splitbliz.com/mqtt
```

### `src/services/apiClient.ts`

```typescript
// =============================================================================
// SplitBliz — Axios base client
// Source: API Contract v1.7
// - Auth: Authorization: Bearer <jwt> header
// - Every request gets X-Request-Id header
// - Error shape: { error: { code, message, action, details } }
// =============================================================================

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/v1';

// Token storage key — stored in memory for the session.
// On app start, restore from sessionStorage (NOT localStorage per Core Spec §2.4).
const TOKEN_KEY = 'sb_access_token';

export const tokenStore = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),
  clear: (): void => sessionStorage.removeItem(TOKEN_KEY),
};

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach Bearer token and X-Request-Id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['X-Request-Id'] = uuidv4();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors, handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Session expired — clear token and redirect to login
      tokenStore.clear();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

/**
 * Extract the typed ApiError from an axios error.
 * Use this in catch blocks inside service files.
 */
export function extractApiError(error: unknown): ApiError['error'] | null {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }
  return null;
}

/**
 * Generate a UUID v4 for use as Idempotency-Key.
 * Required on: POST /expenses, POST /settlements
 */
export function generateIdempotencyKey(): string {
  return uuidv4();
}

export default apiClient;
```

### `src/services/authService.ts`

```typescript
// =============================================================================
// SplitBliz — Auth service
// Bounded context: Identity
// Endpoints: POST /auth/*, GET /auth/me, GET /users/me, PATCH /users/me
// =============================================================================

import apiClient, { tokenStore } from './apiClient';
import {
  UserFull,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  FacebookAuthRequest,
  UserSettings,
  UserContact,
  ActionItemsPreview,
} from '../types';

export const authService = {

  async loginEmail(data: LoginRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/login', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async register(data: RegisterRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/register', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async loginGoogle(data: GoogleAuthRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/google', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async loginFacebook(data: FacebookAuthRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/facebook', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => {});
    tokenStore.clear();
  },

  async getMe(): Promise<UserFull> {
    const res = await apiClient.get<{ user: UserFull }>('/auth/me');
    return res.data.user;
  },

  async getProfile(): Promise<UserFull> {
    const res = await apiClient.get<UserFull>('/users/me');
    return res.data;
  },

  async updateProfile(data: Partial<Pick<UserFull, 'displayName' | 'resolvedAvatar'>>): Promise<UserFull> {
    const res = await apiClient.patch<UserFull>('/users/me', data);
    return res.data;
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserFull> {
    const res = await apiClient.patch<UserFull>('/users/me/settings', settings);
    return res.data;
  },

  async getContacts(): Promise<UserContact[]> {
    const res = await apiClient.get<{ contacts: UserContact[] }>('/users/me/contacts');
    return res.data.contacts;
  },

  async getActionItems(): Promise<ActionItemsPreview> {
    const res = await apiClient.get<ActionItemsPreview>('/users/me/action-items');
    return res.data;
  },

  async searchUsers(query: string): Promise<UserContact[]> {
    const res = await apiClient.get<{ users: UserContact[] }>('/users/search', {
      params: { q: query },
    });
    return res.data.users;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/me');
    tokenStore.clear();
  },
};
```

### `src/services/groupsService.ts`

```typescript
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
```

### `src/services/expensesService.ts`

```typescript
// =============================================================================
// SplitBliz — Expenses service
// Bounded context: Ledger
// Endpoints: /groups/:id/expenses, /groups/:id/balances, receipts
// =============================================================================

import apiClient, { generateIdempotencyKey } from './apiClient';
import {
  Expense,
  PairwiseBalance,
  PaginationResponse,
  CreateExpenseRequest,
} from '../types';

export const expensesService = {

  async getExpenses(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ expenses: Expense[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/expenses`, { params });
    return res.data;
  },

  async getExpense(groupId: string, expenseId: string): Promise<Expense> {
    const res = await apiClient.get<{ expense: Expense }>(
      `/groups/${groupId}/expenses/${expenseId}`
    );
    return res.data.expense;
  },

  async createExpense(groupId: string, data: CreateExpenseRequest): Promise<Expense> {
    const res = await apiClient.post<{ expense: Expense }>(
      `/groups/${groupId}/expenses`,
      data,
      { headers: { 'Idempotency-Key': generateIdempotencyKey() } }
    );
    return res.data.expense;
  },

  async updateExpense(
    groupId: string,
    expenseId: string,
    data: Partial<CreateExpenseRequest> & { version: number }
  ): Promise<Expense> {
    const res = await apiClient.patch<{ expense: Expense }>(
      `/groups/${groupId}/expenses/${expenseId}`,
      data
    );
    return res.data.expense;
  },

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/expenses/${expenseId}`);
  },

  async getBalances(groupId: string): Promise<PairwiseBalance[]> {
    const res = await apiClient.get<{ balances: PairwiseBalance[] }>(
      `/groups/${groupId}/balances`
    );
    return res.data.balances;
  },

  async uploadReceipt(groupId: string, expenseId: string, file: File): Promise<{ receiptUrl: string }> {
    const formData = new FormData();
    formData.append('receipt', file);
    const res = await apiClient.post(
      `/groups/${groupId}/expenses/${expenseId}/receipt`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  async deleteReceipt(groupId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/expenses/${expenseId}/receipt`);
  },
};
```

### `src/services/settlementsService.ts`

```typescript
// =============================================================================
// SplitBliz — Settlements service
// Bounded context: Treasury
// Endpoints: /groups/:id/settlements, /settlements/:id/*
// =============================================================================

import apiClient, { generateIdempotencyKey } from './apiClient';
import { Settlement, CreateSettlementRequest, PaginationResponse } from '../types';

export const settlementsService = {

  async getSettlements(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ settlements: Settlement[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/settlements`, { params });
    return res.data;
  },

  async createSettlement(groupId: string, data: CreateSettlementRequest): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/groups/${groupId}/settlements`,
      data,
      { headers: { 'Idempotency-Key': generateIdempotencyKey() } }
    );
    return res.data.settlement;
  },

  async approveSettlement(settlementId: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement; correlationId: string }>(
      `/settlements/${settlementId}/approve`
    );
    return res.data.settlement;
  },

  async rejectSettlement(settlementId: string, reason?: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/settlements/${settlementId}/reject`,
      { reason }
    );
    return res.data.settlement;
  },

  async cancelSettlement(settlementId: string): Promise<Settlement> {
    const res = await apiClient.post<{ settlement: Settlement }>(
      `/settlements/${settlementId}/cancel`
    );
    return res.data.settlement;
  },

  async remindMember(groupId: string, toUserId: string): Promise<void> {
    await apiClient.post(`/groups/${groupId}/remind`, { toUserId });
  },
};
```

### `src/services/activityService.ts`

```typescript
// =============================================================================
// SplitBliz — Activity service
// Bounded context: Activity
// Endpoints: /groups/:id/activity
// =============================================================================

import apiClient from './apiClient';
import { ActivityEntry, PaginationResponse } from '../types';

export const activityService = {

  async getActivity(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ entries: ActivityEntry[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/activity`, { params });
    return res.data;
  },
};
```

### `src/services/notificationsService.ts`

```typescript
// =============================================================================
// SplitBliz — Notifications service
// Bounded context: Notification
// Endpoints: /notifications
// =============================================================================

import apiClient from './apiClient';
import { Notification, PaginationResponse } from '../types';

export const notificationsService = {

  async getNotifications(
    params?: { cursor?: string; limit?: number }
  ): Promise<{ notifications: Notification[]; pagination: PaginationResponse }> {
    const res = await apiClient.get('/notifications', { params });
    return res.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  async registerFcmToken(token: string): Promise<void> {
    await apiClient.post('/notifications/fcm-token', { token });
  },
};
```

### `src/services/engagementService.ts`

```typescript
// =============================================================================
// SplitBliz — Engagement service
// Bounded context: Engagement (Chat + Whiteboard)
// Endpoints: /groups/:id/messages, /groups/:id/whiteboard
// =============================================================================

import apiClient from './apiClient';
import {
  ChatMessage,
  WhiteboardItem,
  SendMessageRequest,
  PaginationResponse,
} from '../types';

export const engagementService = {

  // Chat
  async getMessages(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ messages: ChatMessage[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/messages`, { params });
    return res.data;
  },

  async sendMessage(groupId: string, data: SendMessageRequest): Promise<ChatMessage> {
    const res = await apiClient.post<{ message: ChatMessage }>(
      `/groups/${groupId}/messages`,
      data
    );
    return res.data.message;
  },

  // Whiteboard
  async getWhiteboardItems(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ items: WhiteboardItem[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/whiteboard`, { params });
    return res.data;
  },

  async createWhiteboardItem(
    groupId: string,
    data: { title: string; content?: string }
  ): Promise<WhiteboardItem> {
    const res = await apiClient.post<{ item: WhiteboardItem }>(
      `/groups/${groupId}/whiteboard`,
      data
    );
    return res.data.item;
  },

  async updateWhiteboardItem(
    groupId: string,
    itemId: string,
    data: { title?: string; content?: string }
  ): Promise<WhiteboardItem> {
    const res = await apiClient.patch<{ item: WhiteboardItem }>(
      `/groups/${groupId}/whiteboard/${itemId}`,
      data
    );
    return res.data.item;
  },

  async deleteWhiteboardItem(groupId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/whiteboard/${itemId}`);
  },
};
```

### `src/services/systemService.ts`

```typescript
// =============================================================================
// SplitBliz — System service
// Endpoints: GET /system/config — called on app start, no auth required
// =============================================================================

import apiClient from './apiClient';
import { SystemConfig } from '../types';

export const systemService = {

  async getConfig(): Promise<SystemConfig> {
    const res = await apiClient.get<SystemConfig>('/system/config');
    return res.data;
  },
};
```

### `src/services/index.ts`

```typescript
// Barrel export for all services
export { authService } from './authService';
export { groupsService } from './groupsService';
export { expensesService } from './expensesService';
export { settlementsService } from './settlementsService';
export { activityService } from './activityService';
export { notificationsService } from './notificationsService';
export { engagementService } from './engagementService';
export { systemService } from './systemService';
export { default as apiClient, tokenStore, extractApiError, generateIdempotencyKey } from './apiClient';
```

### Agent commit message
```
feat: add services layer — axios base client + 7 domain service files
```

---

## Step 6 — Hooks Layer

**Time: 1 day. One commit.**

**Rule:** Each hook calls the service layer. Each hook still returns mock data for now — the service calls are wired but the mock fallback stays until Phase 2 (API integration). This means screens don't break.

### Agent prompt

```
Create the following files in src/hooks/.
These hooks wrap the service layer. For now they still fall back to mock data
so screens continue to work. Do not modify any screen component.
```

### `src/hooks/useCurrentUser.ts`

```typescript
import { useState, useEffect } from 'react';
import { UserFull } from '../types';
import { authService } from '../services';
import { tokenStore } from '../services/apiClient';

export function useCurrentUser() {
  const [user, setUser] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(setUser)
      .catch(() => setError('Session expired'))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error, setUser };
}
```

### `src/hooks/useGroups.ts`

```typescript
import { useState, useEffect } from 'react';
import { HomeScreenData } from '../types';
import { groupsService } from '../services';
import { MOCK_GROUPS } from '../mock/groups';
import { MOCK_SETTLEMENTS } from '../mock/settlements';

export function useHomeData() {
  const [data, setData] = useState<HomeScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO Phase 2: remove mock fallback once backend is wired
    const useMock = !import.meta.env.VITE_API_BASE_URL || import.meta.env.DEV;
    if (useMock) {
      setData({
        groups: MOCK_GROUPS as any,
        actionItemsPreview: { totalCount: 0, items: [] },
        recentActivity: [],
      });
      setLoading(false);
      return;
    }
    groupsService.getHomeData()
      .then(setData)
      .catch(() => setError('Failed to load home data'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

### `src/hooks/useGroupDetail.ts`

```typescript
import { useState, useEffect } from 'react';
import { GroupDetailData } from '../types';
import { groupsService } from '../services';

export function useGroupDetail(groupId: string) {
  const [data, setData] = useState<GroupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    groupsService.getGroupDetail(groupId)
      .then(setData)
      .catch(() => setError('Failed to load group'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { data, loading, error, refetch: () => groupsService.getGroupDetail(groupId).then(setData) };
}
```

### `src/hooks/useExpenses.ts`

```typescript
import { useState, useEffect } from 'react';
import { Expense, PaginationResponse } from '../types';
import { expensesService } from '../services';

export function useExpenses(groupId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    expensesService.getExpenses(groupId)
      .then(({ expenses, pagination }) => {
        setExpenses(expenses);
        setPagination(pagination);
      })
      .catch(() => setError('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { expenses, pagination, loading, error };
}
```

### `src/hooks/useSettlements.ts`

```typescript
import { useState, useEffect } from 'react';
import { Settlement } from '../types';
import { settlementsService } from '../services';

export function useSettlements(groupId: string) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    settlementsService.getSettlements(groupId)
      .then(({ settlements }) => setSettlements(settlements))
      .catch(() => setError('Failed to load settlements'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { settlements, loading, error };
}
```

### `src/hooks/useNotifications.ts`

```typescript
import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { notificationsService } from '../services';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationsService.getNotifications()
      .then(({ notifications }) => setNotifications(notifications))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  return { notifications, loading, error };
}
```

### `src/hooks/useActivity.ts`

```typescript
import { useState, useEffect } from 'react';
import { ActivityEntry } from '../types';
import { activityService } from '../services';

export function useActivity(groupId: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    activityService.getActivity(groupId)
      .then(({ entries }) => setEntries(entries))
      .catch(() => setError('Failed to load activity'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { entries, loading, error };
}
```

### `src/hooks/index.ts`

```typescript
export { useCurrentUser } from './useCurrentUser';
export { useHomeData } from './useGroups';
export { useGroupDetail } from './useGroupDetail';
export { useExpenses } from './useExpenses';
export { useSettlements } from './useSettlements';
export { useNotifications } from './useNotifications';
export { useActivity } from './useActivity';
export { useIsMobile } from './use-mobile';
```

### Agent commit message
```
feat: add hooks layer — one hook per domain, mock fallback preserved
```

---

## Step 7 — Routing Fixes

**Time: half a day. One commit.**

### Agent prompt

```
Make exactly these three changes to src/app/routes.tsx.
Do not modify any other file.
```

### Changes to `src/app/routes.tsx`

```typescript
// 1. Import SignUp (it exists but has no route)
import SignUp from '../features/auth/SignUp';

// 2. Add ProtectedRoute wrapper — create this file first at src/app/ProtectedRoute.tsx
// 3. Add the missing routes

// ---- Create src/app/ProtectedRoute.tsx ----
import { Navigate, Outlet } from 'react-router-dom';
import { tokenStore } from '../services/apiClient';

export function ProtectedRoute() {
  const token = tokenStore.get();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// ---- Create src/features/auth/NotFound.tsx ----
export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '48px', margin: 0 }}>404</h1>
      <p style={{ color: '#9490b8' }}>This page does not exist.</p>
      <a href="/" style={{ color: '#6c5ce7' }}>Go home</a>
    </div>
  );
}

// ---- In routes.tsx, add these routes ----
// Add /signup route:
{ path: '/signup', element: <SignUp /> }

// Add * catch-all at the very end:
{ path: '*', element: <NotFound /> }

// Wrap all authenticated routes with ProtectedRoute:
// These routes should be children of <ProtectedRoute />:
// /, /profile, /group/new, /group/:groupId and all sub-routes,
// /notifications, /onboarding/*
// Public routes (no ProtectedRoute): /welcome, /login, /signup
```

### Agent commit message
```
feat: add ProtectedRoute, 404 page, SignUp route
```

---

## Step 8 — Resilience Layer

**Time: half a day. One commit.**

### Agent prompt

```
Create the following three files. Do not modify any existing component.
Then wrap <Root /> with <ErrorBoundary> in src/main.tsx.
```

### `src/components/ErrorBoundary.tsx`

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO Phase 3: send to error reporting service (Sentry etc.)
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#9490b8' }}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ color: '#6c5ce7', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### `src/components/EmptyState.tsx`

```typescript
// Shared empty state component — ready to use, not wired anywhere yet
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <p style={{ fontWeight: 600, fontSize: '16px', margin: '0 0 8px' }}>{title}</p>
      {description && (
        <p style={{ color: '#9490b8', fontSize: '14px', margin: '0 0 20px' }}>{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: '#6c5ce7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### `src/utils/formatCurrency.ts`

```typescript
// =============================================================================
// SplitBliz — Currency formatter
// CRITICAL: amount is always a decimal string from the API — never a number.
// Never use parseFloat for financial display. Use this utility everywhere.
// =============================================================================

import { CURRENCY_CONFIG } from '../constants/app';

/**
 * Format a monetary decimal string for display.
 * Input: "18000.00", currency: "INR"
 * Output: "₹18,000.00"
 */
export function formatCurrency(amount: string, currencyCode: string): string {
  const config = CURRENCY_CONFIG[currencyCode];
  const symbol = config?.symbol ?? currencyCode;

  // Use Intl for locale-aware formatting
  const num = Number(amount); // safe — display only, never arithmetic
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${symbol}${formatted}`;
}

/**
 * Format a net balance string with sign and color indicator.
 * Positive = you are owed (green). Negative = you owe (red).
 */
export function formatBalance(netAmount: string, currencyCode: string): {
  display: string;
  isPositive: boolean;
  isZero: boolean;
} {
  const num = Number(netAmount);
  const abs = Math.abs(num);
  const display = formatCurrency(abs.toFixed(2), currencyCode);
  return {
    display: num > 0 ? `+${display}` : num < 0 ? `-${display}` : display,
    isPositive: num > 0,
    isZero: num === 0,
  };
}
```

### Update `src/main.tsx`

```typescript
// Wrap the app with ErrorBoundary — add this import and wrapper:
import { ErrorBoundary } from './components/ErrorBoundary';

// Change:
//   <App />
// To:
//   <ErrorBoundary><App /></ErrorBoundary>
```

### Agent commit message
```
feat: add ErrorBoundary, EmptyState, formatCurrency utility
```

---

## Final Verification Checklist

After all 8 steps, run through this before calling the architecture phase done:

```
☑ npm run dev starts without errors
☑ All 17 routes still load
☑ No screen has changed visually
☑ src/ folder matches the target structure from Step 2
☑ src/types/index.ts exists and has no TypeScript errors
☑ src/constants/ has colors.ts, typography.ts, spacing.ts, app.ts
☑ src/services/ has apiClient.ts + 7 service files + index.ts
☑ src/hooks/ has 7 hook files + index.ts
☑ src/app/ProtectedRoute.tsx exists
☑ 404 page is reachable at any unknown route
☑ /signup route is reachable
☑ ErrorBoundary wraps the app in main.tsx
☑ .env file exists (not committed to git — add to .gitignore)
☑ .env.example is committed to git
☑ package.json name is "splitbliz-web"
☑ No inline JSX was modified in any screen component
```

---

## What Comes Next (Phase 2)

Once this architecture is in place and verified, the next phase begins:

1. **Component splitting** — break the 7 mega-components into sub-components
2. **API wiring** — remove mock fallbacks from hooks, connect to real backend
3. **MQTT client** — set up MQTT over WSS using Eclipse Paho for real-time hints
4. **Token replacement** — swap hardcoded hex values for `colors.*` constants
5. **React Query** — replace raw `useState` fetching in hooks with TanStack Query for caching

None of Phase 2 begins until Phase 1 (this document) is fully verified.

---

*SplitBliz Frontend Architecture v1.0*
*Derived from: Backend Architecture v1.0 + Core Spec v5.3 + API Contract v1.7*
*Zero UI changes. Architecture only.*
