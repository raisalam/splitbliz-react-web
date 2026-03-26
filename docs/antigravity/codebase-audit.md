# SplitBliz React Web — Full Codebase Audit Report

**Date:** 2026-03-26  
**Auditor:** Senior Frontend Architect (Antigravity)  
**Stack:** React 18 + Vite + TailwindCSS 4 + React Router 7 + Radix UI + Framer Motion

---

## 1. Folder Structure 🟡 Needs Work

### Current Tree (`src/`, max 3 levels)

```
src/
├── main.tsx
├── api/
│   └── groups.ts
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── components/
│       ├── Home.tsx (786 lines)
│       ├── GroupDetail.tsx (852 lines)
│       ├── AddExpense.tsx (696 lines)
│       ├── GroupAI.tsx (33 KB)
│       ├── GroupSettings.tsx (25 KB)
│       ├── SettleUp.tsx (26 KB)
│       ├── ProfileSettings.tsx (25 KB)
│       ├── ExpenseDetail.tsx (22 KB)
│       ├── CreateGroup.tsx (18 KB)
│       ├── Login.tsx (16 KB)
│       ├── GroupWhiteboard.tsx (14 KB)
│       ├── GroupChat.tsx (11 KB)
│       ├── Notifications.tsx (10 KB)
│       ├── ProfileSetup.tsx (9 KB)
│       ├── SignUp.tsx (7 KB)
│       ├── GroupActivity.tsx (5 KB)
│       ├── FirstGroup.tsx (5 KB)
│       ├── Splash.tsx (3 KB)
│       ├── Root.tsx
│       ├── ThemeProvider.tsx
│       ├── ThemeToggle.tsx
│       ├── figma/
│       │   └── ImageWithFallback.tsx
│       └── ui/ (52 files — Radix/shadcn primitives + custom)
│           ├── GroupAvatar.tsx
│           ├── GroupListItem.tsx
│           ├── InviteMemberSheet.tsx (14 KB)
│           ├── PendingApprovalsSheet.tsx (10 KB)
│           ├── use-mobile.ts
│           ├── utils.ts
│           └── ... (46 more shadcn primitives)
├── imports/ (EMPTY)
├── mock/
│   ├── balances.ts
│   ├── expenses.ts
│   ├── groups.ts
│   ├── members.ts
│   └── settlements.ts
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
└── utils/
    └── expenseCalculator.ts
```

### Flags

| Issue | Severity |
|---|---|
| **FLAT** — All 21 page-level components dumped in one folder (`components/`) with no grouping by feature/domain | 🔴 Critical |
| **MISPLACED** — `ThemeProvider.tsx`, `ThemeToggle.tsx` sit alongside page components, should be in `providers/` or `context/` | 🟡 |
| **MISPLACED** — `use-mobile.ts` and `utils.ts` are inside `ui/`, should be in `hooks/` and `utils/` respectively | 🟡 |
| **MISSING** — No `hooks/` folder (zero custom React hooks extracted) | 🔴 Critical |
| **MISSING** — No `constants/` folder (colors, spacing, typography all hardcoded) | 🔴 Critical |
| **MISSING** — No `types/` or `models/` folder; all types are inline (`any` used extensively) | 🟡 |
| **MISSING** — No `services/` folder for API abstraction layer | 🔴 Critical |
| **EMPTY** — `imports/` folder exists but is empty (dead folder) | 🟡 |
| **OVERSIZED** — 7 components exceed 500 lines (largest: `GroupDetail.tsx` at 852 lines) | 🔴 Critical |

---

## 2. Component Inventory 🔴 Critical

### Page-Level Components (21)

| Component | Lines | Tag | Notes |
|---|---|---|---|
| `Home.tsx` | 786 | [PAGE-LEVEL] [NEEDS SPLIT] | Contains `InsightBar`, FAB, action sheet, search, tabs — should be 5+ components |
| `GroupDetail.tsx` | 852 | [PAGE-LEVEL] [NEEDS SPLIT] | Contains `ExpenseRow`, smart banners, settlement sheets, member list — should be 6+ components |
| `AddExpense.tsx` | 696 | [PAGE-LEVEL] [NEEDS SPLIT] | 2-step flow + 5 bottom sheets all inline |
| `GroupAI.tsx` | ~600 | [PAGE-LEVEL] [NEEDS SPLIT] | Full AI dashboard with charts, all inline |
| `GroupSettings.tsx` | ~500 | [PAGE-LEVEL] [NEEDS SPLIT] | Settings sections + sheets together |
| `SettleUp.tsx` | ~500 | [PAGE-LEVEL] [NEEDS SPLIT] | Settlement flow + member selector inline |
| `ProfileSettings.tsx` | ~500 | [PAGE-LEVEL] [NEEDS SPLIT] | Profile editing + notification toggles + sheets all inline |
| `ExpenseDetail.tsx` | ~400 | [PAGE-LEVEL] | Borderline, could use extraction |
| `CreateGroup.tsx` | ~350 | [PAGE-LEVEL] | Moderate |
| `Login.tsx` | ~350 | [PAGE-LEVEL] | Multi-step auth flow, moderate |
| `GroupWhiteboard.tsx` | ~300 | [PAGE-LEVEL] | OK |
| `GroupChat.tsx` | ~250 | [PAGE-LEVEL] | OK, mock chat |
| `Notifications.tsx` | ~200 | [PAGE-LEVEL] | Contains inline mock data |
| `ProfileSetup.tsx` | ~200 | [PAGE-LEVEL] | OK |
| `SignUp.tsx` | ~150 | [PAGE-LEVEL] | OK |
| `GroupActivity.tsx` | ~120 | [PAGE-LEVEL] | OK |
| `FirstGroup.tsx` | ~120 | [PAGE-LEVEL] | OK |
| `Splash.tsx` | ~100 | [PAGE-LEVEL] | OK |
| `Root.tsx` | 13 | [PAGE-LEVEL] | Layout wrapper, OK |
| `ThemeProvider.tsx` | 39 | [REUSABLE] | Context provider |
| `ThemeToggle.tsx` | ~20 | [REUSABLE] | |

### Custom UI Components (6)

| Component | Tag | Notes |
|---|---|---|
| `GroupAvatar.tsx` | [REUSABLE] | ✅ Good extraction |
| `GroupListItem.tsx` | [REUSABLE] | ✅ Good extraction |
| `InviteMemberSheet.tsx` | [REUSABLE] [NEEDS SPLIT] | 14 KB, contains hardcoded colors, mock data inline |
| `PendingApprovalsSheet.tsx` | [REUSABLE] [NEEDS SPLIT] | 10 KB, heavy inline styles |
| `ImageWithFallback.tsx` | [REUSABLE] | In `figma/` — misplaced, should be in `ui/` |
| `use-mobile.ts` | [REUSABLE] | Hook, misplaced inside `ui/` |

### shadcn/Radix Primitives (46 files)

Standard shadcn UI library — all correct and fine as-is.

### Embedded Sub-Components (Not Extracted)

| Inline Component | Inside File | Should Be Extracted |
|---|---|---|
| `InsightBar` | `Home.tsx` | Yes → `components/home/InsightBar.tsx` |
| `ExpenseRow` | `GroupDetail.tsx` | Yes → `components/group/ExpenseRow.tsx` |
| `MOCK_STATIC_ACTIONS` | `Home.tsx` | Yes → `mock/actions.ts` |
| `MOCK_RECENT_ACTIVITY` | `Home.tsx` | Yes → `mock/activity.ts` |
| `MOCK_NOTIFICATIONS` | `Notifications.tsx` | Yes → `mock/notifications.ts` |

---

## 3. Hardcoded Values 🔴 Critical

> **Note:** There are hundreds of hardcoded values throughout. Below is a representative sample. Full counts: **350+ hardcoded hex colors**, **40+ rgba values**, **440+ inline `style={{}}` blocks**.

### Hardcoded Colors (hex) — Sample

| File | Line | Value |
|---|---|---|
| `InviteMemberSheet.tsx` | 8 | `#6c5ce7` (purple — used as primary) |
| `InviteMemberSheet.tsx` | 9 | `#f4f2fb` (pageBg) |
| `InviteMemberSheet.tsx` | 10 | `#f0eeff` (sectionDivider) |
| `InviteMemberSheet.tsx` | 11 | `#9490b8` (mutedLabel) |
| `InviteMemberSheet.tsx` | 15-17 | 15 hardcoded avatar colors array |
| `PendingApprovalsSheet.tsx` | 74 | `#e0ddf5` |
| `PendingApprovalsSheet.tsx` | 78 | `#1a1625` |
| `PendingApprovalsSheet.tsx` | 85 | `#e1f5ee`, `#0f6e56` |
| `PendingApprovalsSheet.tsx` | 94 | `#f4f2fb`, `#f0eeff` |
| `PendingApprovalsSheet.tsx` | 122 | `#6c5ce7` |
| `Splash.tsx` | 11 | `#4a3bb5`, `#6c5ce7`, `#a29bfe` |
| `SignUp.tsx` | 20 | `#f4f2fb` |
| `SignUp.tsx` | 25 | `#6c5ce7`, `#a29bfe` |
| `GroupAI.tsx` | 432 | `#0f172a`, `#ffffff`, `#f8fafc` |

### Hardcoded rgba Values — Sample

| File | Line | Value |
|---|---|---|
| `Splash.tsx` | 26 | `rgba(255,255,255,0.18)` |
| `ProfileSettings.tsx` | 131 | `rgba(255,255,255,0.5)` |
| `GroupSettings.tsx` | 129 | `rgba(255,255,255,0.2)` |
| `ExpenseDetail.tsx` | 110 | `rgba(255,255,255,0.2)` |
| `CreateGroup.tsx` | 109 | `rgba(255,255,255,0.6)` |
| `Login.tsx` | 292 | `rgba(108,92,231,0.25)` |
| `FirstGroup.tsx` | 91 | `rgba(108,92,231,0.1)` |

### Hardcoded Font Sizes (inline `style={}`) — Sample

| File | Line | Value |
|---|---|---|
| `PendingApprovalsSheet.tsx` | 78 | `fontSize: '13px'` |
| `PendingApprovalsSheet.tsx` | 79 | `fontSize: '10px'` |
| `PendingApprovalsSheet.tsx` | 85 | `fontSize: '10px'` |
| `InviteMemberSheet.tsx` | 129 | `fontSize: '15px'` |
| `PendingApprovalsSheet.tsx` | 192 | `fontSize: '14px'` |

### Hardcoded Strings — Sample

| File | Line | Value | Should Be |
|---|---|---|---|
| `Home.tsx` | 358 | `"Good morning, Rais"` | Dynamic greeting with user name |
| `Root.tsx` | 7 | `"min-h-screen bg-slate-50..."` | Theme-aware base from CSS vars |
| `Home.tsx` | 289 | `"SplitBliz"` | `APP_NAME` constant |
| `ProfileSetup.tsx` | 20 | `'Aman Sharma'` | Should come from user context |
| `ProfileSettings.tsx` | 29 | `'Rais'` | Should come from user context |
| `ProfileSettings.tsx` | 30 | `'rais@example.com'` | Should come from user context |
| `Notifications.tsx` | 57,77 | `'rgba(0,0,0,0)'` | Transparent constant |
| `Home.tsx` | 398 | `"₹450.00"` | Should be computed from data |
| `Home.tsx` | 406 | `"₹120.00"` | Should be computed from data |

---

## 4. Data & State 🟡 Needs Work

### Hardcoded Mock Data Arrays/Objects

| File | Variable | Lines |
|---|---|---|
| `mock/groups.ts` | `MOCK_GROUPS` (10 groups × 10 members) | 1-52 |
| `mock/expenses.ts` | `MOCK_EXPENSES` | 1-71 |
| `mock/settlements.ts` | `MOCK_SETTLEMENTS` | 1-167 |
| `mock/balances.ts` | `MOCK_PAIR_BALANCES` | 1-36 |
| `mock/members.ts` | `MOCK_GROUP_MEMBERS` (derived) | 1-41 |
| `Home.tsx` | `MOCK_STATIC_ACTIONS` | 39-47 |
| `Home.tsx` | `MOCK_RECENT_ACTIVITY` | 49-80 |
| `Notifications.tsx` | `MOCK_NOTIFICATIONS` | Inline (large array ~80 lines) |

### useState Audit — Flagged for Global State

| File | State Variable | Why Flag |
|---|---|---|
| `ThemeProvider.tsx` | `theme` | ✅ Already global via context |
| `Home.tsx` | `MOCK_GROUPS` (not state, but direct import) | 🔴 Should be global state / API cache |
| `GroupDetail.tsx` | `group`, `members`, `balances`, `expenses`, `settlements` | 🔴 Server state — should use React Query / SWR |
| `AddExpense.tsx` | `group`, `members` | 🔴 Duplicate fetch — should use cached data |
| `SettleUp.tsx` | `group`, `members` | 🔴 Duplicate fetch — same data re-fetched |
| `ProfileSettings.tsx` | `displayName`, `email`, `avatar` | 🔴 User data — should be in global user context |
| Multiple files | `activeSheet` pattern | ✅ OK locally, but modals could use a global manager |

**Total `useState` calls found:** 100+ across all components.

### Prop Drilling

| Pattern | Depth | Files |
|---|---|---|
| `currencySymbol` | 2-3 levels deep | `GroupDetail` → `ExpenseRow`, balance cards |
| `theme` | Not drilled (uses `useTheme`) | ✅ |
| `members` array | 2+ levels | `GroupDetail` → `ExpenseRow`, member sheets |
| `MOCK_USER_ID` | Import in every file, not contextual | 🟡 Should be user context |

---

## 5. Routing 🟡 Needs Work

### All Defined Routes (17)

| Path | Component | Status |
|---|---|---|
| `/` (index) | `Home` | ✅ |
| `/welcome` | `Splash` | ✅ |
| `/login` | `Login` | ✅ |
| `/onboarding/profile` | `ProfileSetup` | ✅ |
| `/onboarding/group` | `FirstGroup` | ✅ |
| `/profile` | `ProfileSettings` | ✅ |
| `/group/new` | `CreateGroup` | ✅ |
| `/group/:groupId` | `GroupDetail` | ✅ |
| `/group/:groupId/settings` | `GroupSettings` | ✅ |
| `/group/:groupId/add-expense` | `AddExpense` | ✅ |
| `/group/:groupId/settle` | `SettleUp` | ✅ |
| `/group/:groupId/whiteboard` | `GroupWhiteboard` | ✅ |
| `/group/:groupId/chat` | `GroupChat` | ✅ |
| `/group/:groupId/ai` | `GroupAI` | ✅ |
| `/group/:groupId/activity` | `GroupActivity` | ✅ |
| `/group/:groupId/expense/:expenseId` | `ExpenseDetail` | ✅ |
| `/notifications` | `Notifications` | ✅ |

### Missing

| Missing Item | Severity |
|---|---|
| **404 / Not Found page** — no catch-all `*` route | 🔴 Critical |
| **Protected routes / Auth guard** — all routes publicly accessible | 🔴 Critical |
| **Layout wrappers** — no per-section layouts (auth layout vs app layout) | 🟡 |
| **SignUp route** — `SignUp.tsx` exists but has no route entry in `routes.tsx` | 🟡 |
| **Lazy loading** — no `React.lazy()` or code splitting | 🟡 |

---

## 6. API Readiness 🔴 Critical

### Existing API Code

| File | Description |
|---|---|
| `api/groups.ts` | **Mock API layer** — 10 async functions wrapping `MOCK_*` arrays with simulated `delay()`. No HTTP calls. |

### Base Client / Interceptor

| Check | Result |
|---|---|
| Axios / Fetch wrapper? | ❌ **No** |
| Base URL config? | ❌ **No** |
| Auth token interceptor? | ❌ **No** |
| Error handling middleware? | ❌ **No** |
| Request/response types? | ❌ **No** — everything is `any` |

### Places Where Real API Calls Must Replace Mock Data

| File | Function / Usage | What It Needs |
|---|---|---|
| `api/groups.ts` | `getGroupById()` | Real `GET /groups/:id` |
| `api/groups.ts` | `getGroupMembers()` | Real `GET /groups/:id/members` |
| `api/groups.ts` | `getGroupPairwiseBalances()` | Real `GET /groups/:id/balances` |
| `api/groups.ts` | `getGroupExpenses()` | Real `GET /groups/:id/expenses` |
| `api/groups.ts` | `createExpense()` | Real `POST /groups/:id/expenses` |
| `api/groups.ts` | `requestSettlement()` | Real `POST /groups/:id/settlements` |
| `api/groups.ts` | `getGroupSettlements()` | Real `GET /groups/:id/settlements` |
| `api/groups.ts` | `approveSettlement()` | Real `PUT /settlements/:id/approve` |
| `api/groups.ts` | `rejectSettlement()` | Real `PUT /settlements/:id/reject` |
| `api/groups.ts` | `remindMember()` | Real `POST /groups/:id/remind` |
| `Home.tsx` | Direct `MOCK_GROUPS` import | Needs `useGroups()` hook |
| `Home.tsx` | Direct `MOCK_SETTLEMENTS` import | Needs `useSettlements()` hook |
| `Notifications.tsx` | Inline `MOCK_NOTIFICATIONS` | Needs `GET /notifications` API |
| `Home.tsx` | `MOCK_RECENT_ACTIVITY` | Needs `GET /activity` API |
| `Login.tsx` | No actual auth | Needs `POST /auth/login` |
| `SignUp.tsx` | No actual auth | Needs `POST /auth/signup` |
| `ProfileSettings.tsx` | Hardcoded user data | Needs `GET /me`, `PUT /me` |
| `GroupChat.tsx` | Static mock messages | Needs WebSocket / `GET /groups/:id/messages` |

---

## 7. Missing Critical Files 🔴 Critical

| File / Folder | Exists? |
|---|---|
| `constants/colors.js` (or theme file) | ❌ **NO** — `theme.css` exists with CSS vars but they are **not used** in component code. Components use hardcoded hex values instead. |
| `constants/typography.js` | ❌ **NO** |
| `constants/spacing.js` | ❌ **NO** |
| `services/api.js` (base client) | ❌ **NO** — Only `api/groups.ts` exists with mock functions |
| `hooks/` folder with custom hooks | ❌ **NO** — `use-mobile.ts` exists but is misplaced inside `ui/` |
| `.env` file with API base URL | ❌ **NO** |
| Error boundary component | ❌ **NO** |
| 404 / Not Found page | ❌ **NO** |
| Loading / Skeleton component | ⚠️ **PARTIAL** — `skeleton.tsx` exists in `ui/` (shadcn) but is **not used** anywhere |
| Empty state component | ❌ **NO** — Empty states are inlined in each page separately |

---

## 8. Code Quality Flags 🟡 Needs Work

### console.log / console.error

| File | Line | Code |
|---|---|---|
| `GroupDetail.tsx` | 130 | `console.error("Error fetching group data", err)` |
| `ExpenseDetail.tsx` | 35 | `console.error("Error fetching expense data", err)` |

> No `console.log` found. Two `console.error` calls — should use error reporting service.

### TODO / FIXME Comments

✅ **None found** — clean.

### Unused Imports / Components

| Issue | Details |
|---|---|
| **`imports/` folder is completely empty** — dead directory | 🟡 |
| **`ThemeToggle.tsx`** — 611 bytes, not imported in any route or component | 🟡 |
| **`SignUp.tsx`** — component exists but has **no route** in `routes.tsx` | 🔴 |
| **46 shadcn primitives** — Not all are used. Examples likely unused: `breadcrumb`, `menubar`, `navigation-menu`, `resizable`, `sidebar`, `context-menu`, `hover-card` | 🟡 |
| **`figma/ImageWithFallback.tsx`** — misplaced, unclear usage | 🟡 |

### Inline Styles That Should Be CSS / Tailwind

**440+ inline `style={{}}` blocks** found across components. This is the **#1 technical debt item**.

Worst offenders:

| File | Inline Style Count |
|---|---|
| `InviteMemberSheet.tsx` | ~40+ |
| `PendingApprovalsSheet.tsx` | ~25+ |
| `Home.tsx` | ~15+ |
| `GroupDetail.tsx` | ~15+ |
| `GroupSettings.tsx` | ~20+ |
| `ProfileSettings.tsx` | ~20+ |
| `Splash.tsx` | ~10+ |
| `ExpenseDetail.tsx` | ~10+ |
| `CreateGroup.tsx` | ~10+ |

### Type Safety

- Extensive use of `any` type: `useState<any>(null)`, `useState<any[]>([])` — found in **GroupDetail, AddExpense, SettleUp, ExpenseDetail**
- No TypeScript interfaces for API responses
- No shared type definitions file

### Package Anomalies

| Issue | Details |
|---|---|
| Package name is `@figma/my-make-file` | 🟡 Leftover from Figma Dev Mode scaffold — rename to `splitbliz-web` |
| `react` / `react-dom` in `peerDependencies` | 🟡 Unusual for an app (not a library) |
| Both `@emotion` and Tailwind installed | 🟡 Pick one styling approach |
| `next-themes` installed but custom `ThemeProvider` used | 🟡 Redundant dependency |

---

## Prioritized Action List — Top 10

| # | Action | Severity | Impact |
|---|---|---|---|
| **1** | **Extract design tokens** — Create `constants/colors.ts`, `constants/typography.ts`, `constants/spacing.ts`. Move all 350+ hardcoded hex/rgba values to centralized tokens. Wire to CSS custom properties in `theme.css`. | 🔴 | Consistency, dark mode, maintainability |
| **2** | **Split mega-components** — Break `Home`, `GroupDetail`, `AddExpense`, `GroupAI`, `SettleUp`, `ProfileSettings`, `GroupSettings` into sub-components. Target: no file over 300 lines. | 🔴 | Readability, testability, reusability |
| **3** | **Create API base client** — Set up `services/api.ts` with Axios/fetch wrapper, base URL from `.env`, auth interceptor, error handling. Replace all 10 mock functions with real HTTP calls. | 🔴 | API readiness |
| **4** | **Add auth guard + 404 route** — Create `ProtectedRoute` wrapper component, add `*` catch-all route for 404 page. | 🔴 | Security, UX |
| **5** | **Introduce global state** — Add React Query / SWR for server state caching. Create `UserContext` for current user data. Eliminate duplicate fetches in `GroupDetail`, `AddExpense`, `SettleUp`. | 🔴 | Performance, DRY |
| **6** | **Create `hooks/` folder** — Extract custom hooks: `useGroup(id)`, `useMembers(id)`, `useBalances(id)`, `useExpenses(id)`, `useSettlements(id)`, `useCurrentUser()`. | 🔴 | Separation of concerns |
| **7** | **Add Error Boundary** — Create `ErrorBoundary.tsx` wrapping `<Root>` to catch render errors gracefully. Replace `console.error` with error reporting. | 🟡 | Resilience |
| **8** | **Eliminate inline styles** — Convert 440+ `style={{}}` blocks to Tailwind classes or CSS custom properties. | 🟡 | Consistency, performance |
| **9** | **Add `.env` file** — Create `.env` with `VITE_API_BASE_URL`, `VITE_APP_NAME`. Reference throughout the app. | 🟡 | Configuration |
| **10** | **Clean up dead code** — Remove empty `imports/` folder, unused shadcn primitives, add `SignUp` to routes, rename package from `@figma/my-make-file`. | 🟡 | Hygiene |

---

## Summary Severity Matrix

| Section | Rating |
|---|---|
| 1. Folder Structure | 🟡 Needs Work |
| 2. Component Inventory | 🔴 Critical |
| 3. Hardcoded Values | 🔴 Critical |
| 4. Data & State | 🟡 Needs Work |
| 5. Routing | 🟡 Needs Work |
| 6. API Readiness | 🔴 Critical |
| 7. Missing Critical Files | 🔴 Critical |
| 8. Code Quality Flags | 🟡 Needs Work |

**Overall Health: 🔴 Needs Significant Refactoring Before Production**

The app has excellent visual polish and a comprehensive feature set, but the architecture is heavily prototype-grade. The top priorities are: centralizing design tokens, splitting mega-components, creating a proper API layer, and introducing global state management.
