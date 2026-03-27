# Priority 1 — Impact Analysis

> Generated: 2026-03-27

---

## 1. Remove MUI + Emotion

### Usage Found

| Package | Imports in `src/` | Verdict |
|---------|-------------------|---------|
| `@mui/material` | **0** | Phantom dependency |
| `@mui/icons-material` | **0** | Phantom dependency |
| `@emotion/react` | **0** | Phantom dependency |
| `@emotion/styled` | **0** | Phantom dependency |

**All four packages have zero imports anywhere in `src/`.** They exist only in `package.json` and `node_modules`.

### Impact of Removal

| Impact Area | Risk Level | Details |
|-------------|-----------|---------|
| **Source code changes** | 🟢 None | No files import from MUI or Emotion |
| **Bundle size** | 🟢 Positive | Removes ~200KB+ of dead weight from `node_modules` and build tree-shaking budget |
| **Build time** | 🟢 Positive | Fewer packages to resolve during install and build |
| **Runtime behavior** | 🟢 None | No code paths reference these libraries |
| **Breaking risk** | 🟢 Zero | Nothing will break |

### Action Required

```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
```

**That's it.** No source code changes needed.

---

## 2. Remove Duplicate Carousel Library (`react-slick`)

### Usage Found

| Package | Imports in `src/` | Verdict |
|---------|-------------------|---------|
| `react-slick` | **0** | Phantom dependency |
| `embla-carousel-react` | **1** — [carousel.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/components/ui/carousel.tsx) | In active use |

`react-slick` has **zero imports** in the entire source tree. The shadcn/ui `carousel.tsx` component wraps `embla-carousel-react`, which is the only carousel library actually used.

### Impact of Removal

| Impact Area | Risk Level | Details |
|-------------|-----------|---------|
| **Source code changes** | 🟢 None | `react-slick` is never imported |
| **Bundle size** | 🟢 Positive | Removes unused carousel + its CSS |
| **Runtime behavior** | 🟢 None | No code paths reference `react-slick` |
| **Breaking risk** | 🟢 Zero | Nothing will break |

### Action Required

```bash
npm uninstall react-slick
```

**No source code changes needed.**

---

## 3. Additional Phantom Dependencies Found

While investigating, three more unused dependencies were found:

| Package | Imports in `src/` | Verdict |
|---------|-------------------|---------|
| `@popperjs/core` | **0** | Phantom — Radix handles positioning |
| `react-popper` | **0** | Phantom — Radix handles positioning |

### Action Required (optional, same zero-risk)

```bash
npm uninstall @popperjs/core react-popper
```

---

## 4. Migrate Write Operations to `useMutation`

### Current State

Only **1 file** currently uses `useMutation`:

| File | Status |
|------|--------|
| [ExpenseDetail.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/expenses/ExpenseDetail.tsx) | ✅ Uses `useMutation` for `deleteExpense` |

### Direct Service Calls Found (42 calls across 12 files)

Every `await someService.method()` call below bypasses React Query, losing automatic loading states, error boundaries, and cache invalidation.

#### [Home.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/home/Home.tsx) — 6 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 77 | `settlementsService.approveSettlement(groupId, referenceId)` | Approve settlement from action items |
| 80 | `settlementsService.rejectSettlement(groupId, referenceId)` | Reject settlement from action items |
| 97 | `groupsService.acceptInviteById(item.inviteId)` | Accept group invite |
| 105 | `groupsService.rejectInviteById(item.inviteId)` | Reject group invite |
| 119 | `settlementsService.approveSettlement(item.groupId, item.referenceId)` | Bulk approve all settlements |
| 129 | `authService.logout()` | Logout (intentional — no mutation needed) |

#### [GroupDetail.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/groups/GroupDetail.tsx) — 4 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 61 | `settlementsService.approveSettlement(groupId, settlementId)` | Approve settlement |
| 67 | `settlementsService.rejectSettlement(groupId, settlementId)` | Reject settlement |
| 271 | `settlementsService.remindMember(groupId, quickUserId)` | Send reminder from banner |
| 418 | `settlementsService.remindMember(groupId, memberId)` | Send reminder from member list |

#### [GroupSettings.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/groups/GroupSettings.tsx) — 5 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 110 | `groupsService.updateGroup(groupId, {...})` | Update group settings |
| 133 | `groupsService.updateMemberRole(groupId, ...)` | Change member role |
| 145 | `groupsService.removeMember(groupId, ...)` | Remove a member |
| 157 | `groupsService.removeMember(groupId, currentUserId)` | Leave group |
| 167 | `groupsService.deleteGroup(groupId)` | Delete group |

#### [CreateGroup.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/groups/CreateGroup.tsx) — 2 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 65 | `groupsService.createGroup({...})` | Create new group |
| 76 | `groupsService.generateInvite(created.id)` | Generate invite link |

#### [AddExpense.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/expenses/AddExpense.tsx) — 2 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 283 | `expensesService.updateExpense(groupId, ...)` | Update existing expense |
| 296 | `expensesService.createExpense(groupId, ...)` | Create new expense |

#### [SettleUp.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/settlements/SettleUp.tsx) — 1 mutation call

| Line | Call | What It Does |
|------|------|-------------|
| 86 | `settlementsService.createSettlement(groupId, {...})` | Submit settlement |

#### [ProfileSettings.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/profile/ProfileSettings.tsx) — 5 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 76 | `authService.updateProfile({ displayName })` | Update display name |
| 89 | `authService.updateProfile({ resolvedAvatar })` | Update avatar |
| 105 | `authService.updateSettings({...})` | Update notification prefs |
| 117 | `authService.updateSettings({...})` | Update more prefs |
| 156 | `authService.logout()` | Logout (no mutation needed) |

#### [Notifications.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/notifications/Notifications.tsx) — 2 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 53 | `notificationsService.markAllAsRead()` | Mark all read |
| 64 | `notificationsService.markAsRead(n.id)` | Mark single read |

#### [GroupWhiteboard.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/whiteboard/GroupWhiteboard.tsx) — 3 mutation calls

| Line | Call | What It Does |
|------|------|-------------|
| 86 | `engagementService.deleteWhiteboardItem(groupId, id)` | Delete whiteboard item |
| 93 | `engagementService.updateWhiteboardItem(groupId, ...)` | Update whiteboard item |
| 99 | `engagementService.createWhiteboardItem(groupId, ...)` | Create whiteboard item |

#### [GroupChat.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/features/chat/GroupChat.tsx) — 1 mutation call

| Line | Call | What It Does |
|------|------|-------------|
| 119 | `engagementService.sendMessage(groupId, {...})` | Send chat message |

#### [InviteMemberSheet.tsx](file:///c:/Users/rais7/IdeaProjects/splitbliz-react-web/src/components/InviteMemberSheet.tsx) — 1 mutation call

| Line | Call | What It Does |
|------|------|-------------|
| 87 | `groupsService.addMembers(groupId, [userId])` | Add member to group |

#### Auth flows (Login, SignUp, ProfileSetup) — ~5 calls

These are one-time auth flows (login, register, profile setup). Migrating to `useMutation` is optional but beneficial for loading states.

### Impact of `useMutation` Migration

| Impact Area | Risk Level | Details |
|-------------|-----------|---------|
| **Source code changes** | 🟡 Moderate | 12 files need refactoring; ~15 new mutation hooks to create |
| **Runtime behavior** | 🟢 Positive | Automatic `isPending` loading states, `isError` handling, retry logic |
| **Cache consistency** | 🟢 Positive | Centralized `onSuccess` invalidation instead of scattered `queryClient.invalidateQueries()` |
| **Breaking risk** | 🟡 Low-Medium | Behavioral changes if error handling differs from current manual try/catch |
| **UI impact** | 🟢 Positive | Buttons can show loading spinners via `mutation.isPending` instead of custom boolean state |

### Recommended New Hook Files

| Hook File | Mutations | Used By |
|-----------|-----------|---------|
| `hooks/useSettlementMutations.ts` | approve, reject, remind, create | Home, GroupDetail, SettleUp |
| `hooks/useGroupMutations.ts` | create, update, delete, leave, addMembers, generateInvite, acceptInvite, rejectInvite, updateRole, removeMember | Home, GroupSettings, CreateGroup, InviteMemberSheet |
| `hooks/useExpenseMutations.ts` | create, update, delete | AddExpense, ExpenseDetail |
| `hooks/useProfileMutations.ts` | updateProfile, updateSettings | ProfileSettings |
| `hooks/useNotificationMutations.ts` | markAsRead, markAllAsRead | Notifications |
| `hooks/useEngagementMutations.ts` | sendMessage, createWhiteboardItem, updateWhiteboardItem, deleteWhiteboardItem | GroupChat, GroupWhiteboard |

---

## Summary: Effort vs. Impact

| Item | Files Changed | Risk | Effort | Bundle Impact |
|------|--------------|------|--------|--------------|
| Remove MUI + Emotion | **0 files** | 🟢 Zero | 1 min | **-200KB+** |
| Remove `react-slick` | **0 files** | 🟢 Zero | 1 min | **-30KB+** |
| Remove `@popperjs/core` + `react-popper` | **0 files** | 🟢 Zero | 1 min | **-20KB+** |
| Migrate to `useMutation` | **12 files** + 6 new hook files | 🟡 Low-Medium | 2-3 hours | Neutral |

> [!IMPORTANT]
> **Items 1–3 are pure wins with zero risk.** They can be done in a single `npm uninstall` command with no source code changes. The `useMutation` migration is the only item requiring actual code changes.
