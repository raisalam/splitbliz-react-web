# SplitBliz Web — Track B: UI Polish
**Version 1.0 — Follows Phase 1 (Architecture) completion**
**Status: Hand this file to your agent. Execute steps in order. Commit after each step.**

---

## The One Rule

> Track B is pure UI work. Zero data layer changes.
> Do not remove any mock import. Do not change any hook. Do not touch any service file.
> Every screen must show the same data after each step as it did before.
> The only things that change are: component structure, style values, and visual polish.
> Run the app and visually verify after every step.

---

## Overview — 6 Steps

| Step | What | Time | Risk |
|---|---|---|---|
| 1 | Split 7 mega-components into sub-components | 2 days | Medium — import paths change |
| 2 | Replace hardcoded hex colors with `colors.*` | 1 day | Low — find and replace |
| 3 | Convert inline styles to Tailwind classes | 2 days | Medium — visual regression risk |
| 4 | Wire skeleton loading states | half day | Low |
| 5 | Wire empty states | half day | Low |
| 6 | Global state — UserContext + React Query | 1 day | Medium |

**Total: ~7 days. App looks better every day.**

---

## Step 1 — Split Mega-Components

**Time: 2 days. One commit per component.**

### The rule for splitting

Extract a sub-component when it:
- Has its own visual boundary (a card, a sheet, a row, a section)
- Could theoretically be used in more than one place
- Makes the parent file shorter and more readable

Do NOT extract just to reduce line count. Every extraction must make sense semantically.

**Never change JSX structure or styles during extraction — copy the JSX exactly as-is into the new file.**

---

### 1A — Home.tsx (786 lines → target ~200 lines)

**Commit: `refactor: split Home.tsx into sub-components`**

#### Agent prompt

```
Split src/features/home/Home.tsx into the following sub-components.
Create a new folder: src/features/home/components/

Rules:
- Copy JSX exactly — do not change any style, className, or prop
- Do not change any mock data imports — leave them where they are
- Do not change any useState — leave all state in Home.tsx and pass as props
- After splitting, Home.tsx should only orchestrate — it imports and composes sub-components
- Run the app and confirm / looks identical before committing

Sub-components to extract:

1. src/features/home/components/HomeHeader.tsx
   Extract: the top app bar area — app name, notification bell, avatar, theme toggle
   Props it needs: user data, unread count, onNotificationsClick, onAvatarClick

2. src/features/home/components/InsightBar.tsx
   Extract: the insight/summary bar showing total balance or net position
   Props it needs: groups data or balance summary

3. src/features/home/components/QuickActions.tsx
   Extract: the quick action buttons row (Add expense, Settle up, etc.)
   Props it needs: MOCK_STATIC_ACTIONS array, onActionClick

4. src/features/home/components/GroupCard.tsx
   Extract: a single group card in the groups list
   Props it needs: group object, onClick

5. src/features/home/components/RecentActivityList.tsx
   Extract: the recent activity section with its list items
   Props it needs: MOCK_RECENT_ACTIVITY array

6. src/features/home/components/HomeFAB.tsx
   Extract: the floating action button
   Props it needs: onClick

After extraction, Home.tsx imports and composes all 6 sub-components.
Home.tsx target: under 200 lines.
```

---

### 1B — GroupDetail.tsx (852 lines → target ~250 lines)

**Commit: `refactor: split GroupDetail.tsx into sub-components`**

#### Agent prompt

```
Split src/features/groups/GroupDetail.tsx into sub-components.
Create folder: src/features/groups/components/

Rules: same as 1A — copy JSX exactly, no style changes, no data changes.

Sub-components to extract:

1. src/features/groups/components/GroupHeader.tsx
   Extract: group name, type emoji, status badge, member count, settings icon
   Props: group object, onSettingsClick

2. src/features/groups/components/BalanceSummaryCard.tsx
   Extract: the balance overview card showing what you owe or are owed
   Props: balances data, currentUserId

3. src/features/groups/components/ExpenseRow.tsx
   Extract: a single expense list item row
   Props: expense object, currencyCode, onClick

4. src/features/groups/components/ExpenseList.tsx
   Extract: the full expenses tab — search bar + list of ExpenseRow
   Props: expenses array, currencyCode, onExpenseClick, onAddExpense

5. src/features/groups/components/MemberBalanceRow.tsx
   Extract: a single member row in the members/balances tab
   Props: member object, currencyCode

6. src/features/groups/components/MemberList.tsx
   Extract: the members tab — list of MemberBalanceRow
   Props: members array, currencyCode

7. src/features/groups/components/SettlementRow.tsx
   Extract: a single settlement item
   Props: settlement object, currencyCode, currentUserId

GroupDetail.tsx after: imports sub-components, owns state, owns tab switching.
Target: under 250 lines.
```

---

### 1C — AddExpense.tsx (696 lines → target ~200 lines)

**Commit: `refactor: split AddExpense.tsx into sub-components`**

#### Agent prompt

```
Split src/features/expenses/AddExpense.tsx into sub-components.
Create folder: src/features/expenses/components/

Sub-components to extract:

1. src/features/expenses/components/ExpenseBasicForm.tsx
   Extract: step 1 form — title, amount, category, date, currency, notes
   Props: formState, onChange handlers

2. src/features/expenses/components/ExpenseSplitForm.tsx
   Extract: step 2 split configuration — split type selector + per-member amounts
   Props: members, splitType, splits, onChange handlers

3. src/features/expenses/components/PayerSelector.tsx
   Extract: the payer selection sheet/section
   Props: members, payers, onChange

4. src/features/expenses/components/SplitTypeToggle.tsx
   Extract: the EQUAL / FIXED / PERCENTAGE / SHARES toggle
   Props: value, onChange

AddExpense.tsx after: step wizard logic, form state, sheet state, submission.
Target: under 200 lines.
```

---

### 1D — GroupSettings.tsx (~500 lines → target ~180 lines)

**Commit: `refactor: split GroupSettings.tsx into sub-components`**

#### Agent prompt

```
Split src/features/groups/GroupSettings.tsx into sub-components.
Reuse folder: src/features/groups/components/

Sub-components to extract:

1. src/features/groups/components/GroupInfoSection.tsx
   Extract: group name, type, currency display + edit controls
   Props: group object, isEditing, onChange

2. src/features/groups/components/GroupFeaturesSection.tsx
   Extract: feature toggles — simplify debts, allow member expenses, require approval
   Props: settings object, onToggle, myRole

3. src/features/groups/components/DangerZoneSection.tsx
   Extract: freeze group, archive group, delete group actions
   Props: group object, onFreeze, onArchive, onDelete, myRole

4. src/features/groups/components/MemberManagementSection.tsx
   Extract: member list with role badges and remove/role-change actions
   Props: members array, myRole, onRoleChange, onRemove

GroupSettings.tsx after: owns state, sheet state, composes sections.
Target: under 180 lines.
```

---

### 1E — SettleUp.tsx (~500 lines → target ~180 lines)

**Commit: `refactor: split SettleUp.tsx into sub-components`**

#### Agent prompt

```
Split src/features/settlements/SettleUp.tsx into sub-components.
Create folder: src/features/settlements/components/

Sub-components to extract:

1. src/features/settlements/components/SettlementMemberPicker.tsx
   Extract: the member selection step — who are you settling with
   Props: members, balances, selectedUserId, onSelect

2. src/features/settlements/components/SettlementAmountForm.tsx
   Extract: amount input + payment method selector
   Props: maxAmount, currencyCode, amount, paymentMethod, onChange

3. src/features/settlements/components/SettlementConfirmSheet.tsx
   Extract: confirmation bottom sheet — summary of the settlement
   Props: settlement details, onConfirm, onCancel

SettleUp.tsx after: step state, submission logic, composes sub-components.
Target: under 180 lines.
```

---

### 1F — ProfileSettings.tsx (~500 lines → target ~180 lines)

**Commit: `refactor: split ProfileSettings.tsx into sub-components`**

#### Agent prompt

```
Split src/features/profile/ProfileSettings.tsx into sub-components.
Create folder: src/features/profile/components/

Sub-components to extract:

1. src/features/profile/components/ProfileAvatarSection.tsx
   Extract: avatar display + upload/emoji picker trigger
   Props: resolvedAvatar, displayName, onAvatarChange

2. src/features/profile/components/ProfileInfoSection.tsx
   Extract: display name + email display fields
   Props: displayName, email, onEdit

3. src/features/profile/components/NotificationToggles.tsx
   Extract: all notification preference toggles
   Props: notificationSettings, onToggle

4. src/features/profile/components/PreferencesSection.tsx
   Extract: currency, language, dark mode preferences
   Props: preferences, onChange

5. src/features/profile/components/AccountActionsSection.tsx
   Extract: logout, delete account, plan upgrade actions
   Props: planTier, onLogout, onDeleteAccount

ProfileSettings.tsx after: owns state, composes sections.
Target: under 180 lines.
```

---

### 1G — GroupAI.tsx (~600 lines → target ~200 lines)

**Commit: `refactor: split GroupAI.tsx into sub-components`**

#### Agent prompt

```
Split src/features/ai/GroupAI.tsx into sub-components.
Create folder: src/features/ai/components/

Sub-components to extract:

1. src/features/ai/components/AIInsightCards.tsx
   Extract: the summary insight cards at the top (top spender, category breakdown, etc.)
   Props: insights data (mock for now)

2. src/features/ai/components/SpendingChart.tsx
   Extract: the chart component (recharts or chart.tsx wrapper)
   Props: chartData, currencyCode

3. src/features/ai/components/AIChatPanel.tsx
   Extract: the AI chat input + response display area
   Props: messages, onSend, loading

GroupAI.tsx after: owns state, composes panels.
Target: under 200 lines.
```

---

### Step 1 verification checklist

```
□ Home.tsx is under 200 lines
□ GroupDetail.tsx is under 250 lines
□ AddExpense.tsx is under 200 lines
□ GroupSettings.tsx is under 180 lines
□ SettleUp.tsx is under 180 lines
□ ProfileSettings.tsx is under 180 lines
□ GroupAI.tsx is under 200 lines
□ All routes still load
□ No visual change on any screen
□ No mock data was touched
□ No hook was modified
```

---

## Step 2 — Replace Hardcoded Colors

**Time: 1 day. One commit per file group.**

### The rule

Import from `src/constants/colors.ts` and replace hex/rgba values.
Do not change any Tailwind className — only replace values inside `style={{}}` blocks and
top-of-file color constant objects.

**Do NOT touch any color inside shadcn `ui/` files — those are library files.**

---

### Agent prompt — shared component sheets first

**Commit: `refactor: replace hardcoded colors in shared components`**

```
In each of the following files, add this import at the top:
import { colors } from '../constants/colors';
(adjust path depth as needed)

Then replace every hardcoded hex/rgba value with the matching colors.* token.

Replacement map — use exactly these:
  '#6c5ce7'                    → colors.primary
  '#a29bfe'                    → colors.primaryLight
  '#f0eeff'                    → colors.primaryFaint
  '#f4f2fb'                    → colors.pageBg
  '#9490b8'                    → colors.textMuted
  '#1a1625'                    → colors.textPrimary
  '#e0ddf5'                    → colors.border
  '#e1f5ee'                    → colors.successLight
  '#0f6e56'                    → colors.success
  '#4a3bb5'                    → colors.primary  (darker shade, use primary)
  '#0f172a'                    → colors.textPrimary
  '#ffffff'                    → '#ffffff'  (leave white as-is — it is semantic)
  'rgba(108,92,231,0.10)'      → colors.overlay10
  'rgba(108,92,231,0.25)'      → colors.overlay25
  'rgba(255,255,255,0.50)'     → colors.white50
  'rgba(255,255,255,0.20)'     → colors.white20
  'rgba(255,255,255,0.18)'     → colors.white18
  'rgba(255,255,255,0.60)'     → 'rgba(255,255,255,0.60)'  (no exact match, leave)
  The 15-item avatar color array → colors.avatarPalette

Files to process in this commit:
  src/components/InviteMemberSheet.tsx
  src/components/PendingApprovalsSheet.tsx
  src/components/GroupAvatar.tsx
  src/components/GroupListItem.tsx

Run the app. Confirm sheets and avatars look identical.
```

---

### Agent prompt — feature screens

**Commit: `refactor: replace hardcoded colors in feature screens`**

```
Same replacement map as above.
Apply to these files:

  src/features/auth/Splash.tsx
  src/features/auth/Login.tsx
  src/features/auth/SignUp.tsx
  src/features/auth/FirstGroup.tsx
  src/features/auth/ProfileSetup.tsx
  src/features/home/Home.tsx  (and all its sub-components from Step 1)
  src/features/groups/GroupDetail.tsx  (and all its sub-components)
  src/features/groups/GroupSettings.tsx  (and all its sub-components)
  src/features/expenses/AddExpense.tsx  (and all its sub-components)
  src/features/expenses/ExpenseDetail.tsx
  src/features/settlements/SettleUp.tsx  (and all its sub-components)
  src/features/profile/ProfileSettings.tsx  (and all its sub-components)
  src/features/notifications/Notifications.tsx
  src/features/ai/GroupAI.tsx  (and all its sub-components)
  src/features/groups/GroupActivity.tsx
  src/features/chat/GroupChat.tsx
  src/features/whiteboard/GroupWhiteboard.tsx

After each file, check it visually in the browser before moving to the next.
Do not batch multiple files without checking.
```

### Step 2 verification checklist

```
□ No raw hex values remain in feature files (grep -r '#[0-9a-fA-F]{6}' src/features)
□ No raw rgba values remain in feature files
□ colors.ts is the single source of truth for all color values
□ shadcn ui/ files are untouched
□ Every screen looks visually identical
```

---

## Step 3 — Convert Inline Styles to Tailwind

**Time: 2 days. One commit per feature folder.**

### The rule

Convert `style={{}}` blocks to Tailwind utility classes where a direct equivalent exists.
If no Tailwind equivalent exists (e.g. a very specific px value or custom color), leave
the `style={{}}` in place — do not invent Tailwind utilities that don't exist.

This step has the highest visual regression risk. Go file by file, check in browser after each.

### Tailwind equivalents reference

```
style={{ display: 'flex' }}                    → className="flex"
style={{ flexDirection: 'column' }}            → className="flex-col"
style={{ alignItems: 'center' }}               → className="items-center"
style={{ justifyContent: 'center' }}           → className="justify-center"
style={{ justifyContent: 'space-between' }}    → className="justify-between"
style={{ gap: '8px' }}                         → className="gap-2"
style={{ gap: '12px' }}                        → className="gap-3"
style={{ gap: '16px' }}                        → className="gap-4"
style={{ gap: '24px' }}                        → className="gap-6"
style={{ padding: '16px' }}                    → className="p-4"
style={{ padding: '24px' }}                    → className="p-6"
style={{ paddingTop: '16px' }}                 → className="pt-4"
style={{ paddingBottom: '16px' }}              → className="pb-4"
style={{ paddingLeft: '16px' }}                → className="pl-4"
style={{ paddingRight: '16px' }}               → className="pr-4"
style={{ margin: '0 auto' }}                   → className="mx-auto"
style={{ marginBottom: '8px' }}                → className="mb-2"
style={{ marginTop: '16px' }}                  → className="mt-4"
style={{ width: '100%' }}                      → className="w-full"
style={{ maxWidth: '480px' }}                  → className="max-w-[480px]"
style={{ borderRadius: '8px' }}                → className="rounded-lg"
style={{ borderRadius: '12px' }}               → className="rounded-xl"
style={{ borderRadius: '9999px' }}             → className="rounded-full"
style={{ fontSize: '12px' }}                   → className="text-xs"
style={{ fontSize: '14px' }}                   → className="text-sm"
style={{ fontSize: '16px' }}                   → className="text-base"
style={{ fontSize: '18px' }}                   → className="text-lg"
style={{ fontSize: '24px' }}                   → className="text-2xl"
style={{ fontWeight: '600' }}                  → className="font-semibold"
style={{ fontWeight: '700' }}                  → className="font-bold"
style={{ fontWeight: 500 }}                    → className="font-medium"
style={{ textAlign: 'center' }}                → className="text-center"
style={{ overflow: 'hidden' }}                 → className="overflow-hidden"
style={{ position: 'relative' }}              → className="relative"
style={{ position: 'absolute' }}              → className="absolute"
style={{ cursor: 'pointer' }}                  → className="cursor-pointer"
style={{ opacity: 0.5 }}                       → className="opacity-50"
style={{ minHeight: '100vh' }}                 → className="min-h-screen"
style={{ background: 'none' }}                 → className="bg-transparent"
style={{ border: 'none' }}                     → className="border-0"
```

**Leave as style={{}} — no clean Tailwind equivalent:**
```
style={{ background: `linear-gradient(...)` }}  ← keep
style={{ color: colors.primary }}               ← keep (dynamic color token)
style={{ boxShadow: '...' }}                    ← keep unless standard shadow
style={{ fontSize: '13px' }}                    ← keep (non-standard size)
style={{ fontSize: '15px' }}                    ← keep (non-standard size)
Any value from a variable or prop              ← always keep as style={{}}
```

---

### Agent prompt — auth screens

**Commit: `refactor: inline styles → Tailwind in auth screens`**

```
Convert inline styles to Tailwind in these files using the reference table above.
Check browser after each file. Do not batch.

  src/features/auth/Splash.tsx
  src/features/auth/Login.tsx
  src/features/auth/SignUp.tsx
  src/features/auth/ProfileSetup.tsx
  src/features/auth/FirstGroup.tsx
```

---

### Agent prompt — home + notifications

**Commit: `refactor: inline styles → Tailwind in home and notifications`**

```
Convert inline styles to Tailwind in:
  src/features/home/Home.tsx
  src/features/home/components/ (all files from Step 1)
  src/features/notifications/Notifications.tsx
```

---

### Agent prompt — groups

**Commit: `refactor: inline styles → Tailwind in groups feature`**

```
Convert inline styles to Tailwind in:
  src/features/groups/GroupDetail.tsx
  src/features/groups/components/ (all files from Step 1)
  src/features/groups/GroupSettings.tsx
  src/features/groups/GroupActivity.tsx
  src/features/groups/CreateGroup.tsx
```

---

### Agent prompt — expenses + settlements + profile

**Commit: `refactor: inline styles → Tailwind in expenses, settlements, profile`**

```
Convert inline styles to Tailwind in:
  src/features/expenses/AddExpense.tsx
  src/features/expenses/components/
  src/features/expenses/ExpenseDetail.tsx
  src/features/settlements/SettleUp.tsx
  src/features/settlements/components/
  src/features/profile/ProfileSettings.tsx
  src/features/profile/components/
```

---

### Agent prompt — shared components

**Commit: `refactor: inline styles → Tailwind in shared components`**

```
Convert inline styles to Tailwind in:
  src/components/InviteMemberSheet.tsx
  src/components/PendingApprovalsSheet.tsx
  src/components/GroupAvatar.tsx
  src/components/GroupListItem.tsx
  src/components/ErrorBoundary.tsx
  src/components/EmptyState.tsx
```

### Step 3 verification checklist

```
□ grep -r "style={{" src/features | wc -l  is significantly reduced (not zero — dynamic styles stay)
□ Every screen looks pixel-identical to before
□ No Tailwind class was invented that doesn't exist in the preset
□ Dynamic color values still use style={{ color: colors.* }}
□ Linear gradients still use style={{ background: 'linear-gradient(...)' }}
```

---

## Step 4 — Wire Skeleton Loading States

**Time: half a day. One commit.**

### The rule

`src/components/ui/skeleton.tsx` already exists (shadcn). It is currently imported nowhere.
Wire it into every screen that fetches data — show skeleton while `loading === true`,
show content when `loading === false`.

Do not change what data is shown. Only add the loading state UI.

---

### Agent prompt

**Commit: `feat: wire skeleton loading states across all data screens`**

```
The shadcn Skeleton component is at src/components/ui/skeleton.tsx.
Import and use it in every screen that has a loading state.

For each screen below, find the existing loading condition (loading === true)
and replace any spinner or blank render with a skeleton layout that
approximates the shape of the real content.

Screens to update:

1. src/features/home/Home.tsx
   Skeleton: 3 group card placeholders (rectangle ~80px tall, full width, rounded)

2. src/features/groups/GroupDetail.tsx
   Skeleton: header placeholder + 4 expense row placeholders

3. src/features/expenses/ExpenseDetail.tsx
   Skeleton: title placeholder + amount placeholder + 3 split row placeholders

4. src/features/settlements/SettleUp.tsx
   Skeleton: 3 member row placeholders

5. src/features/notifications/Notifications.tsx
   Skeleton: 4 notification row placeholders (icon circle + two text lines each)

6. src/features/groups/GroupActivity.tsx
   Skeleton: 4 activity row placeholders

Skeleton row pattern (use this shape consistently):
<div className="flex items-center gap-3 p-4">
  <Skeleton className="h-10 w-10 rounded-full" />
  <div className="flex-1 space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
  </div>
</div>

Do not remove any existing loading logic. Only add skeleton UI where
currently there is a blank/spinner render.
```

### Step 4 verification checklist

```
□ Every data screen shows a skeleton while mock data "loads" (simulate with setTimeout if needed)
□ Skeleton shape approximates the real content shape
□ No screen shows a blank white flash
□ Skeleton component import path is correct
```

---

## Step 5 — Wire Empty States

**Time: half a day. One commit.**

### The rule

`src/components/EmptyState.tsx` was created in Phase 1 Step 8.
Wire it into every screen that can have an empty list.
Do not change what data is shown when data exists.

---

### Agent prompt

**Commit: `feat: wire empty states across all list screens`**

```
Import EmptyState from src/components/EmptyState.tsx in each screen below.
Show it when the data array is empty and loading is false.

1. src/features/home/Home.tsx — no groups yet
   <EmptyState
     title="No groups yet"
     description="Create your first group to start splitting expenses."
     action={{ label: 'Create group', onClick: () => navigate('/group/new') }}
   />

2. src/features/groups/GroupDetail.tsx — no expenses
   <EmptyState
     title="No expenses yet"
     description="Add the first expense for this group."
     action={{ label: 'Add expense', onClick: () => navigate(`/group/${groupId}/add-expense`) }}
   />

3. src/features/groups/GroupDetail.tsx — no settlements tab
   <EmptyState
     title="All settled up"
     description="No pending settlements in this group."
   />

4. src/features/notifications/Notifications.tsx — no notifications
   <EmptyState
     title="You're all caught up"
     description="No new notifications."
   />

5. src/features/groups/GroupActivity.tsx — no activity
   <EmptyState
     title="No activity yet"
     description="Activity will appear here as your group adds expenses and settlements."
   />

6. src/features/chat/GroupChat.tsx — no messages
   <EmptyState
     title="No messages yet"
     description="Be the first to say something."
   />

7. src/features/whiteboard/GroupWhiteboard.tsx — no items
   <EmptyState
     title="Whiteboard is empty"
     description="Add your first note or task."
     action={{ label: 'Add item', onClick: onAddItem }}
   />

Show EmptyState only when: data array exists AND array.length === 0 AND loading === false.
Never show EmptyState while loading.
```

### Step 5 verification checklist

```
□ Temporarily set mock array to [] and confirm empty state appears on each screen
□ EmptyState never appears while skeleton is showing
□ EmptyState never appears when data exists
□ Restore mock arrays after testing
```

---

## Step 6 — Global State: UserContext + React Query

**Time: 1 day. One commit.**

### The rule

This is the final Track B step. It wires global user state and replaces raw
`useState` + `useEffect` data fetching with React Query — but still using the
mock-backed services. The screens get cleaner data flow. No API calls yet.

---

### 6A — Install React Query

#### Agent prompt

```
Install TanStack React Query:
npm install @tanstack/react-query

In src/main.tsx, wrap the app with QueryClientProvider:

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 1,
    },
  },
});

Wrap: <QueryClientProvider client={queryClient}><ErrorBoundary>...</ErrorBoundary></QueryClientProvider>

Do not change anything else.
Commit: "chore: install and configure React Query"
```

---

### 6B — UserContext

**Commit: `feat: add UserContext for global current user state`**

#### Create `src/providers/UserContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserFull } from '../types';
import { authService } from '../services';
import { tokenStore } from '../services/apiClient';

interface UserContextValue {
  user: UserFull | null;
  setUser: (user: UserFull | null) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
```

#### Agent prompt

```
1. Create src/providers/UserContext.tsx with the content above.

2. Add <UserProvider> to src/main.tsx wrapping the app inside QueryClientProvider:
   <QueryClientProvider ...>
     <UserProvider>
       <ErrorBoundary>
         <App />
       </ErrorBoundary>
     </UserProvider>
   </QueryClientProvider>

3. In ProfileSettings.tsx — replace the hardcoded:
     const [displayName, setDisplayName] = useState('Rais');
     const [email, setEmail] = useState('rais@example.com');
   With:
     const { user } = useUser();
     const displayName = user?.displayName ?? '';
     const email = user?.email ?? '';

4. In Home.tsx — replace hardcoded greeting string "Good morning, Rais"
   With: `Good morning, ${user?.displayName?.split(' ')[0] ?? ''}`

5. In HomeHeader.tsx (from Step 1) — replace hardcoded avatar/name
   With: user data from useUser()

Do not change any other component. Do not remove any mock data.
Commit: "feat: add UserContext, wire user data into ProfileSettings and HomeHeader"
```

---

### 6C — Convert hooks to React Query

**Commit: `refactor: convert data hooks to React Query`**

#### Agent prompt

```
Update the following hooks in src/hooks/ to use React Query's useQuery.
The services still call mock data — this just replaces the manual useState/useEffect pattern.
Do not change any service file. Do not remove mock fallbacks from services.

Update src/hooks/useGroups.ts:

import { useQuery } from '@tanstack/react-query';
import { groupsService } from '../services';

export function useHomeData() {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => groupsService.getHomeData(),
  });
}

Update src/hooks/useGroupDetail.ts:

import { useQuery } from '@tanstack/react-query';
import { groupsService } from '../services';

export function useGroupDetail(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsService.getGroupDetail(groupId),
    enabled: !!groupId,
  });
}

Update src/hooks/useExpenses.ts:

import { useQuery } from '@tanstack/react-query';
import { expensesService } from '../services';

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => expensesService.getExpenses(groupId),
    enabled: !!groupId,
  });
}

Update src/hooks/useSettlements.ts:

import { useQuery } from '@tanstack/react-query';
import { settlementsService } from '../services';

export function useSettlements(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId],
    queryFn: () => settlementsService.getSettlements(groupId),
    enabled: !!groupId,
  });
}

Update src/hooks/useNotifications.ts:

import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../services';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
  });
}

Update src/hooks/useActivity.ts:

import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services';

export function useActivity(groupId: string) {
  return useQuery({
    queryKey: ['activity', groupId],
    queryFn: () => activityService.getActivity(groupId),
    enabled: !!groupId,
  });
}

After updating hooks — update the screens that call them.
React Query returns { data, isLoading, error } instead of { data, loading, error }.
Find and replace: loading → isLoading in every screen that uses these hooks.
```

### Step 6 verification checklist

```
□ npm run dev starts without errors
□ QueryClientProvider wraps the app in main.tsx
□ UserProvider wraps the app inside QueryClientProvider
□ ProfileSettings shows real user name from context (not hardcoded 'Rais')
□ Home greeting shows real user first name from context
□ All data screens still show mock data correctly
□ isLoading is used instead of loading in all screens
□ No screen has a blank white state — skeleton shows during load
□ React Query DevTools can be added temporarily to verify query keys
```

---

## Final Track B Verification Checklist

Run through this before declaring Track B complete:

```
□ All 7 mega-components are under their target line counts
□ Sub-component folders exist for: home, groups, expenses, settlements, profile, ai
□ No hardcoded hex color remains in src/features/ or src/components/
   (run: grep -rn '#[0-9a-fA-F]{6}' src/features src/components --include="*.tsx")
□ grep result above shows 0 matches (or only intentional exceptions)
□ inline style={{ }} count is significantly reduced
   (run: grep -rn 'style={{' src/features src/components --include="*.tsx" | wc -l)
□ Skeleton shows on every data screen during load
□ EmptyState shows on every list screen when data is empty
□ UserContext is wired — no screen shows hardcoded user name/email
□ React Query is configured and all hooks use useQuery
□ All 17 routes still load
□ Zero visual regression — every screen looks identical to before Track B started
□ shadcn ui/ files are completely untouched
□ mock/ folder is completely untouched
□ No service file was modified
□ No type file was modified
```

---

## What Comes Next — Track A (API Wiring)

Once Track B is fully verified, Track A becomes very clean:

1. **Auth** — `Login.tsx` calls `authService.loginEmail()`, stores JWT, redirects
2. **Home** — `useHomeData()` mock fallback removed → hits `GET /home`
3. **GroupDetail** — `useGroupDetail()` mock fallback removed → hits `GET /groups/:id/detail`
4. **Write operations** — AddExpense, SettleUp call real services with Idempotency-Key
5. **MQTT** — Eclipse Paho client, subscribe to hint topics, call `queryClient.invalidateQueries()`
6. **React Native token sync** — share `src/constants/` directly with the mobile project

Because React Query is already in place from Step 6, invalidating a query after
a mutation is one line:
```typescript
queryClient.invalidateQueries({ queryKey: ['group', groupId] });
```

That's the entire real-time update pattern when an MQTT hint arrives.

---

*SplitBliz Frontend — Track B: UI Polish v1.0*
*Follows Phase 1 (Architecture) completion.*
*Prerequisite for Track A (API wiring) — cleaner components make wiring safer.*
