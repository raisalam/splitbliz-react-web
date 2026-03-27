# Track A Audit Report

Date: 2026-03-27
Scope: UI screens and data sources in `src/features/**`

## Summary
Most core screens are wired to real backend data. The remaining demo/mock usage is concentrated in:
- Group AI feature
- Group Settings screen
- Create Group flow
- A few mock fallbacks and placeholder UX in profile actions

## Screens Still Using Demo/Mock Data

### Group AI (`src/features/ai/GroupAI.tsx`)
- Uses `MOCK_GROUPS`, `MOCK_EXPENSES`, `MOCK_PAIR_BALANCES`, `MOCK_USER_ID`.
- All AI insights, charts, and chat are still mock-based.
- Needs real endpoints for AI insights and historical trends (no service wiring yet).

### Group Settings (`src/features/groups/GroupSettings.tsx`)
- Entire screen uses `MOCK_GROUP` and `MOCK_USER_ID`.
- Members list, settings, and actions are not connected to real group data.
- Invite sheet uses `groupId || MOCK_GROUP.publicId` fallback.
- No API calls for group settings update or member management.

### Create Group (`src/features/groups/CreateGroup.tsx`)
- Members list starts with `MOCK_USER_ID` and local state only.
- `handleCreate()` just navigates to `/` without POST.
- Group type, emoji, currency, and settings are not persisted to backend.
- Needs `POST /groups` and optional member invite flow.

## Partially Wired / Gaps

### Group Detail (`src/features/groups/GroupDetail.tsx`)
- Still imports mock `approveSettlement`/`rejectSettlement` from `../../api/groups`.
- These handlers are not used for approvals anymore (approval handled elsewhere), but the mock import remains.
- Recommend removing mock approve/reject or wiring to `settlementsService` if you plan to approve from this screen.

### Profile (`src/features/profile/ProfileSettings.tsx`)
- Avatar upload button is placeholder (no backend upload flow yet).
- Connected accounts (Google/Phone) UI is static.
- These are UI-only and not backed by real endpoints yet.

### Notifications (`src/features/notifications/Notifications.tsx`)
- Fully wired to backend, but only navigates by `groupId` (no deep-link to expense/settlement).
- Could parse `notification.data` for deep links (expenseId, settlementId).

### Add Expense / Settle Up
- Both are wired, but still use `MOCK_USER_ID` as a fallback if `user` is missing.
- Not blocking, but safe to remove if `user` is always present post-login.

## Screens Fully Wired (Real Data)
- Auth (register/login/logout/checkEmail)
- Home (GET /home)
- Group Detail (GET /groups/:id/detail)
- Expenses list and detail
- Settlements create + approve/reject
- Group Activity
- Chat (history + MQTT)
- Whiteboard (CRUD)
- Notifications
- Profile updates + settings

## Recommended Next Work
1. Wire Create Group: `POST /groups` + optional invite flow.
2. Wire Group Settings: `GET /groups/:id`, `PATCH /groups/:id`, member management endpoints.
3. Wire Group AI: define real AI endpoints and replace mock data.
4. Remove remaining mock imports and fallback IDs.
5. Implement avatar upload (pre-signed URL or backend direct upload).

## Quick Reference: Remaining Mock Imports
- `src/features/ai/GroupAI.tsx`
- `src/features/groups/GroupSettings.tsx`
- `src/features/groups/CreateGroup.tsx`
- `src/features/groups/GroupDetail.tsx` (mock settlement helpers)
- `src/features/settlements/SettleUp.tsx` (fallback `MOCK_USER_ID`)
- `src/features/expenses/AddExpense.tsx` (fallback `MOCK_USER_ID`)
