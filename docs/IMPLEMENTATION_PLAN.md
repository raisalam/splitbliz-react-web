# SplitBliz Web Implementation Plan (Priority Order)

Last updated: 2026-03-27

This plan focuses on removing remaining mocks, wiring incomplete screens to real APIs, and fixing data-shape inconsistencies. Priorities are ordered for maximum production readiness with minimal user-facing risk.

## P0 - Blockers (Ship-Blocking)
Goal: eliminate mock data paths and ensure core flows are real and consistent.

1. Remove mock API usage and mock data dependencies
   - Replace all uses of `src/api/groups.ts` and `src/mock/*` with real services.
   - Replace `MOCK_USER_ID` fallbacks with authenticated user ids (or hard errors).
   - Files:
     - `src/api/groups.ts` (remove/retire)
     - `src/mock/*` (remove/retire)
     - `src/features/groups/GroupDetail.tsx`
     - `src/features/expenses/AddExpense.tsx`
     - `src/features/settlements/SettleUp.tsx`

2. Settlement actions wired to real endpoints
   - Group Detail approvals/rejections must call `settlementsService`.
   - Ensure optimistic UI or proper error feedback.
   - Files:
     - `src/features/groups/GroupDetail.tsx`
     - `src/services/settlementsService.ts`

3. Normalize settlement data shape in group detail
   - Backend and UI must agree on `fromUser`/`toUser` structure.
   - Either normalize in `groupsService.getGroupDetail` or update UI selectors.
   - Files:
     - `src/services/groupsService.ts`
     - `src/features/groups/GroupDetail.tsx`

4. Remove dev-only login
   - Remove the fake login button and dev-token path.
   - File:
     - `src/features/auth/Login.tsx`

Acceptance for P0:
- No imports from `src/mock/*` remain.
- No references to `MOCK_USER_ID` remain.
- Group settlement approve/reject and reminder actions call real endpoints.
- App runs without mock data files.

## P1 - Core UX Gaps (High Impact)
Goal: finish core user workflows that currently use placeholders.

1. Profile onboarding: persist avatar and display name
   - Use `authService.updateProfile` for Profile Setup and custom upload.
   - Custom image upload is not supported by backend (only avatarEmoji); UI should use emoji only.
   - Files:
     - `src/features/auth/ProfileSetup.tsx`
     - `src/features/profile/ProfileSettings.tsx`

2. Profile account actions
   - Implement delete account (call `authService.deleteAccount`).
   - Connected accounts: either implement or hide.
   - File:
     - `src/features/profile/ProfileSettings.tsx`

3. Expense detail actions
   - Add edit mode support (prefill Add Expense).
   - Implement duplicate expense (prefill with existing data).
   - Implement share breakdown or remove CTA if not supported.
   - Files:
     - `src/features/expenses/ExpenseDetail.tsx`
     - `src/features/expenses/AddExpense.tsx`

4. Reminders
   - Backend endpoint for reminders is missing (no `/groups/{groupId}/remind`).
   - Skipping until backend adds the endpoint; keep UI toast only.

Acceptance for P1:
- Profile setup changes persist and survive refresh.
- Account delete calls real endpoint and clears session.
- Expense detail actions work or are removed.
-
Remind action triggers API.

## P2 - Enhancements (Nice-to-Have)
Goal: stabilize advanced features and reduce inconsistencies.

1. AI Chat real responses
   - Replace simulated responses with backend AI chat endpoint (if available).
   - If no backend, clearly mark as beta or disable input.
   - File:
     - `src/features/ai/GroupAI.tsx`

2. Whiteboard metadata persistence
   - Persist category/color/pin or remove these features in UI.
   - File:
     - `src/features/whiteboard/GroupWhiteboard.tsx`

3. Feature flags consistency
   - Align Home and Group Detail feature flags based on backend config.
   - File:
     - `src/services/groupsService.ts`

Acceptance for P2:
-
AI chat no longer uses fake timed replies.
-
Whiteboard metadata survives reloads or UI hides non-persistent features.

## Sequencing Notes
- Complete P0 before any UI polish or enhancement work.
- P1 can proceed once P0 is stable, especially for onboarding + expense detail.
- P2 should be tracked but not block release.

## Open Questions
1. Do you want to fully remove `src/api/groups.ts` or keep it for local demo mode?
2. Is there an API for AI chat responses, or should it be disabled for now?
3. Should whiteboard metadata be added to the backend, or should we simplify the UI?
