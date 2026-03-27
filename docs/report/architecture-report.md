# SplitBliz React Web — Architecture Report

> Generated: 2026-03-27  
> Codebase: `splitbliz-react-web` (React 18 + Vite 6 + TypeScript 6)

---

## 1. Folder & File Structure

### Top-level
```
splitbliz-react-web/
├── public/
├── src/
├── docs/
├── dist/                     # Build output
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.mjs
├── CLAUDE.md                 # AI assistant context
├── appendSheet.cjs           # Utility script (CJS)
├── .env / .env.example / .env.production
└── tsc-errors.txt
```

### `src/` Directory Tree (131 files, 32 directories)
```
src/
├── api/                           # EMPTY — unused placeholder
│
├── app/                           # App shell & routing
│   ├── App.tsx                    # Entry: ThemeProvider + RouterProvider
│   ├── AppGate.tsx                # Pre-auth gate
│   ├── Root.tsx                   # Layout root: MQTT connection, Toaster
│   ├── ProtectedRoute.tsx         # Token-based route guard
│   ├── ThemeToggle.tsx
│   └── routes.tsx                 # Centralized route definitions
│
├── assets/
│   ├── brand/
│   │   └── logo.png
│   └── images/
│
├── components/                    # Shared/reusable components
│   ├── CachedAvatar.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── GroupAvatar.tsx
│   ├── GroupListItem.tsx
│   ├── ImageWithFallback.tsx
│   ├── InviteMemberSheet.tsx
│   ├── PendingApprovalsSheet.tsx
│   └── ui/                       # shadcn/ui primitives (~40 files)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── skeleton.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       ├── tooltip.tsx
│       └── ... (20+ more primitives)
│
├── constants/
│   ├── app.ts                     # GROUP_TYPE_EMOJI, etc.
│   ├── colors.ts
│   ├── emoji.ts                   # EXPENSE_CATEGORY_EMOJI
│   ├── iconography.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── features/                      # Feature modules (by domain)
│   ├── ai/
│   │   ├── GroupAI.tsx
│   │   └── components/
│   │       ├── AIChatPanel.tsx
│   │       ├── AIInsightCards.tsx
│   │       └── SpendingChart.tsx
│   ├── auth/
│   │   ├── FirstGroup.tsx
│   │   ├── GoogleCallback.tsx
│   │   ├── Login.tsx
│   │   ├── NotFound.tsx
│   │   ├── ProfileSetup.tsx
│   │   ├── SignUp.tsx
│   │   └── Splash.tsx
│   ├── chat/
│   │   └── GroupChat.tsx
│   ├── expenses/
│   │   ├── AddExpense.tsx
│   │   ├── ExpenseDetail.tsx
│   │   └── components/
│   │       ├── ExpenseBasicForm.tsx
│   │       ├── ExpenseSplitForm.tsx
│   │       ├── PayerSelector.tsx
│   │       └── SplitTypeToggle.tsx
│   ├── groups/
│   │   ├── CreateGroup.tsx
│   │   ├── GroupActivity.tsx
│   │   ├── GroupDetail.tsx          # 562 lines — largest component
│   │   ├── GroupSettings.tsx
│   │   └── components/             # 12+ child components
│   │       ├── BalanceSummaryCard.tsx
│   │       ├── DangerZoneSection.tsx
│   │       ├── ExpenseList.tsx
│   │       ├── ExpenseRow.tsx
│   │       ├── GroupHeader.tsx
│   │       ├── GroupInfoSection.tsx
│   │       ├── MemberList.tsx
│   │       ├── MemberManagementSheet.tsx
│   │       ├── SettlementRow.tsx
│   │       └── ...
│   ├── home/
│   │   ├── Home.tsx                 # 495 lines — second largest
│   │   └── components/
│   │       ├── HomeHeader.tsx
│   │       ├── InsightBar.tsx
│   │       ├── QuickActions.tsx
│   │       ├── GroupCard.tsx
│   │       ├── RecentActivityList.tsx
│   │       └── HomeFAB.tsx
│   ├── notifications/
│   │   └── Notifications.tsx
│   ├── profile/
│   │   ├── ProfileSettings.tsx
│   │   └── components/
│   │       └── DangerZone.tsx
│   ├── settlements/
│   │   ├── SettleUp.tsx
│   │   └── components/
│   │       └── SettlementConfirmation.tsx
│   └── whiteboard/
│       └── GroupWhiteboard.tsx
│
├── hooks/                          # Custom React hooks
│   ├── index.ts                    # Barrel export
│   ├── use-mobile.ts
│   ├── useActivity.ts
│   ├── useCurrentUser.ts
│   ├── useExpenses.ts
│   ├── useGroupDetail.ts
│   ├── useGroupMqtt.ts
│   ├── useGroups.ts
│   ├── useMqtt.ts
│   ├── useNotifications.ts
│   └── useSettlements.ts
│
├── mock/                           # EMPTY — mock data removed
│
├── providers/
│   ├── ThemeProvider.tsx            # React Context for dark/light mode
│   └── UserContext.tsx              # React Context for auth user state
│
├── services/                       # API service layer
│   ├── index.ts                    # Barrel export for all services
│   ├── apiClient.ts                # Centralized Axios instance
│   ├── authService.ts
│   ├── groupsService.ts            # 370 lines — heaviest service
│   ├── expensesService.ts
│   ├── settlementsService.ts
│   ├── activityService.ts
│   ├── notificationsService.ts
│   ├── engagementService.ts        # Chat + Whiteboard
│   ├── aiInsightsService.ts
│   ├── aiService.ts
│   ├── systemService.ts
│   ├── mqttService.ts              # MQTT over WebSocket
│   ├── firebase.ts                 # Firebase init
│   └── remoteConfig.ts             # Firebase Remote Config
│
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css                   # CSS custom properties
│
├── types/
│   └── index.ts                    # 567 lines — all type definitions
│
└── utils/
    ├── cn.ts                       # clsx + tailwind-merge
    ├── expenseCalculator.ts
    └── formatCurrency.ts
```

---

## 2. State Management

### Libraries & Approach

| Concern | Tool | Location |
|---------|------|----------|
| **Server/async state** | TanStack React Query v5 | `src/hooks/use*.ts` |
| **Auth user state** | React Context | `src/providers/UserContext.tsx` |
| **Theme state** | React Context | `src/providers/ThemeProvider.tsx` |
| **Local UI state** | `useState` | Inline within feature components |
| **Real-time updates** | MQTT (Paho) | `src/hooks/useMqtt.ts`, `src/hooks/useGroupMqtt.ts` |

> **No Redux, Zustand, Jotai, or other external state management libraries are used.** State management is lightweight: React Context + React Query.

### Global State Structure

- **`UserContext`** (`src/providers/UserContext.tsx`):
  - Stores the authenticated `UserFull | null` object
  - Exposes `user`, `setUser`, `loading`, `isAuthenticated`
  - On mount, if a token exists in `sessionStorage`, calls `authService.getMe()` to hydrate user
  - Wraps the router inside `Root.tsx` (implicit via route tree)

- **`ThemeProvider`** (`src/providers/ThemeProvider.tsx`):
  - Stores `'light' | 'dark'` toggle
  - Applies CSS class to `<html>` element
  - No persistence (resets to `'light'` on page reload)

### Server State vs. UI State

**Server state is cleanly separated** from UI state via React Query hooks:
- `useHomeData()` → `queryKey: ['home']`
- `useGroupDetail(groupId)` → `queryKey: ['group', groupId]`
- `useExpenses()`, `useSettlements()`, `useNotifications()`, `useActivity()`
- Mutations use `queryClient.invalidateQueries()` for cache invalidation

**UI-local state** (tabs, modals, search filters) is kept via `useState` inside components — this is appropriate and not mixed with server state.

### Provider Hierarchy

```
ThemeProvider
  └── RouterProvider
        └── Root (useMqttConnection)
              └── ProtectedRoute (token check)
                    └── Feature Pages
```

> [!WARNING]
> `UserProvider` is NOT in `App.tsx`. It is **not visible** in the component tree wrapping the router. The `useUser()` hook is called inside `Home.tsx` and `GroupDetail.tsx`, suggesting `UserProvider` is wrapped somewhere (possibly `Root.tsx` or `AppGate.tsx`) but this is **not explicit in `App.tsx`**, which could cause runtime errors if the provider is missing.

---

## 3. API Communication

### HTTP Client

- **Library**: Axios v1.13.6
- **Centralized client**: `src/services/apiClient.ts`
- **Base URL**: `import.meta.env.VITE_API_BASE_URL` (fallback: `http://localhost:8080/v1`)
- **Timeout**: 15,000ms

### Auth Token Handling

| Aspect | Implementation |
|--------|---------------|
| **Storage** | `sessionStorage` (key: `sb_access_token`) |
| **Injection** | Request interceptor adds `Authorization: Bearer <jwt>` |
| **Request ID** | Every request gets `X-Request-Id: <uuid-v4>` |
| **401 handling** | Response interceptor clears token and redirects to `/login` (skips auth endpoints) |
| **Idempotency** | `generateIdempotencyKey()` exported for POST mutations |

### Service Layer Architecture

All API calls are centralized in `src/services/` — **no API calls are made directly in components**.

```
Component → Hook (React Query) → Service → apiClient (Axios)
```

| Service File | Bounded Context | Line Count |
|-------------|----------------|------------|
| `authService.ts` | Identity (login, register, profile) | 121 |
| `groupsService.ts` | Groups (CRUD, members, invites, BFF) | 370 |
| `expensesService.ts` | Ledger (expenses CRUD) | ~160 |
| `settlementsService.ts` | Treasury (settlements, approvals) | ~130 |
| `activityService.ts` | Activity feed | ~20 |
| `notificationsService.ts` | Notifications | ~30 |
| `engagementService.ts` | Chat + Whiteboard | ~60 |
| `aiInsightsService.ts` | AI analysis dashboard | ~50 |
| `aiService.ts` | AI chat | ~15 |
| `systemService.ts` | System config | ~15 |
| `mqttService.ts` | MQTT WebSocket connection | ~120 |

### BFF Pattern

Two endpoints use a BFF (Backend-For-Frontend) pattern with **heavy response mapping** in the service layer:
- `groupsService.getHomeData()` — maps `/home` response to `HomeScreenData`
- `groupsService.getGroupDetail()` — aggregates 3 parallel API calls (`/detail`, `/balances`, `/settlements`) into `GroupDetailData`

### Real-time Communication
- **MQTT** via `paho-mqtt` library for real-time hints (balance updates, new expenses, settlement changes)
- `useMqtt.ts` manages the WebSocket connection at the root level
- `useGroupMqtt.ts` subscribes to group-specific topics and invalidates React Query caches

---

## 4. Component Patterns

### Organization: **Feature-First (Hybrid)**

Components are primarily organized **by feature/domain**, with shared components at the top level:

```
src/
├── components/          ← Shared reusable components
│   ├── ui/              ← shadcn/ui primitive library (~40 files)
│   └── *.tsx            ← App-level shared components (8 files)
└── features/
    └── <domain>/
        ├── <Page>.tsx           ← Page/screen component
        └── components/          ← Feature-specific child components
```

### Shared/Reusable Components (`src/components/`)

| Component | Purpose |
|-----------|---------|
| `CachedAvatar.tsx` | Avatar with browser caching for deduplicated fetches |
| `EmptyState.tsx` | Consistent empty state placeholder |
| `ErrorBoundary.tsx` | React error boundary wrapper |
| `GroupAvatar.tsx` | Group-type emoji avatar with activity ring |
| `GroupListItem.tsx` | Reusable group list row |
| `ImageWithFallback.tsx` | Image with fallback rendering |
| `InviteMemberSheet.tsx` | Bottom sheet for inviting members |
| `PendingApprovalsSheet.tsx` | Bottom sheet for settlement approvals |

### UI Primitive Library (`src/components/ui/`)

~40 files from **shadcn/ui**, all built on **Radix UI** primitives:
- `button.tsx`, `card.tsx`, `dialog.tsx`, `drawer.tsx`, `sheet.tsx`, `tabs.tsx`, `tooltip.tsx`, `form.tsx`, `select.tsx`, `input.tsx`, `badge.tsx`, `skeleton.tsx`, `scroll-area.tsx`, `progress.tsx`, `switch.tsx`, `toggle.tsx`, `toast.tsx`, etc.

### Hooks

All custom hooks are **extracted into separate files** in `src/hooks/`:

| Hook | Purpose | Pattern |
|------|---------|---------|
| `useHomeData` | Fetches home screen data | React Query `useQuery` |
| `useGroupDetail` | Fetches group detail data | React Query `useQuery` |
| `useExpenses` | Fetches expense list | React Query `useQuery` |
| `useSettlements` | Fetches settlement list | React Query `useQuery` |
| `useNotifications` | Fetches notifications | React Query `useQuery` |
| `useActivity` | Fetches activity feed | React Query `useQuery` |
| `useCurrentUser` | User context shorthand | Context consumer |
| `useMqtt` | MQTT WebSocket connection | Imperative effect |
| `useGroupMqtt` | Group-scoped MQTT subscription | Imperative effect |
| `useIsMobile` | Responsive breakpoint detection | Media query listener |

Hooks are **barrel-exported** from `src/hooks/index.ts`.

---

## 5. Dependencies (Architecture-Relevant)

### Core

| Package | Version | Role |
|---------|---------|------|
| `react` | 18.3.1 | UI library |
| `react-dom` | 18.3.1 | DOM renderer |
| `react-router` | 7.13.0 | Client-side routing |
| `typescript` | 6.0.2 | Type system |
| `vite` | 6.3.5 | Build tool / dev server |

### State & Data Fetching

| Package | Version | Role |
|---------|---------|------|
| `@tanstack/react-query` | ^5.95.2 | Server state management |
| `axios` | ^1.13.6 | HTTP client |
| `paho-mqtt` | ^1.1.0 | MQTT over WebSocket (real-time) |

### UI Framework

| Package | Version | Role |
|---------|---------|------|
| `tailwindcss` | 4.1.12 | Utility-first CSS |
| `@tailwindcss/vite` | 4.1.12 | Vite plugin for Tailwind |
| `tailwind-merge` | 3.2.0 | Tailwind class deduplication |
| `tw-animate-css` | 1.3.8 | TW animation utilities |
| `class-variance-authority` | 0.7.1 | Variant-driven component styling |
| `clsx` | 2.1.1 | Conditional class names |
| `lucide-react` | 0.487.0 | Icon library |
| `motion` (Framer Motion) | 12.23.24 | Animations & transitions |
| `sonner` | 2.0.3 | Toast notifications |

### Radix UI Primitives (shadcn/ui foundation)

| Package | Role |
|---------|------|
| `@radix-ui/react-dialog` | Modal dialogs |
| `@radix-ui/react-dropdown-menu` | Dropdown menus |
| `@radix-ui/react-tabs` | Tab navigation |
| `@radix-ui/react-accordion` | Accordions |
| `@radix-ui/react-avatar` | Avatar components |
| `@radix-ui/react-select` | Custom selects |
| `@radix-ui/react-popover` | Popovers |
| `@radix-ui/react-tooltip` | Tooltips |
| ... and 15+ more | Various UI primitives |

### MUI (Material UI)

| Package | Version | Role |
|---------|---------|------|
| `@mui/material` | 7.3.5 | Component library |
| `@mui/icons-material` | 7.3.5 | Icon set |
| `@emotion/react` | 11.14.0 | CSS-in-JS (MUI dependency) |
| `@emotion/styled` | 11.14.1 | Styled components (MUI dependency) |

> [!WARNING]
> **Two competing UI frameworks** are installed: shadcn/ui (Radix + Tailwind) AND Material UI (MUI + Emotion). MUI brings significant bundle bloat and styling conflicts.

### Forms & Utilities

| Package | Version | Role |
|---------|---------|------|
| `react-hook-form` | 7.55.0 | Form state management |
| `date-fns` | 3.6.0 | Date formatting/manipulation |
| `uuid` | ^13.0.0 | UUID generation |
| `canvas-confetti` | 1.9.4 | Celebration animations |
| `recharts` | 2.15.2 | Charting (AI insights) |
| `firebase` | ^12.11.0 | Firebase SDK (auth, remote config) |
| `react-dnd` / `react-dnd-html5-backend` | 16.0.1 | Drag-and-drop |
| `embla-carousel-react` | 8.6.0 | Carousel |
| `react-slick` | 0.31.0 | Carousel (duplicate) |
| `react-responsive-masonry` | 2.7.1 | Masonry layout |
| `react-resizable-panels` | 2.1.7 | Resizable panels |
| `react-day-picker` | 8.10.1 | Date picker |
| `cmdk` | 1.1.1 | Command palette |
| `vaul` | 1.1.2 | Drawer component |
| `input-otp` | 1.4.2 | OTP input |

---

## 6. Current Pain Points & Anti-Patterns

### 🔴 Critical Issues

#### 6.1 — Large Monolithic Page Components

| File | Lines | Issue |
|------|-------|-------|
| `features/groups/GroupDetail.tsx` | **562** | Contains inline rendering logic, settlement history sheet, all-members sheet, avatar rendering helper, and smart action banner — all in one file |
| `features/home/Home.tsx` | **495** | Contains hero card, stories row, search, tabs, group selection sheet, and pending approvals sheet in one file |

Both files have **inline IIFE rendering blocks** (`{(() => { ... })()}`) that should be extracted into separate components.

#### 6.2 — Excessive `any` Type Usage in Services

`groupsService.ts` uses `any` extensively in BFF response mapping:

```typescript
async getHomeData(): Promise<HomeScreenData> {
  const res = await apiClient.get<any>('/home');    // ← untyped response
  const raw = res.data;
  return {
    groups: (raw.groupsPreview?.items ?? []).map((g: any) => ({  // ← any everywhere
```

This defeats TypeScript's safety guarantees. Raw API response types should be defined separately.

#### 6.3 — Duplicate UI Framework Dependencies

Both **shadcn/ui** (Radix + Tailwind) and **MUI** (`@mui/material` + `@emotion/*`) are installed. This causes:
- Bundle size bloat (~200KB+ extra for MUI)
- Two different styling paradigms (Tailwind utility classes vs. Emotion CSS-in-JS)
- Inconsistent component API patterns

#### 6.4 — Duplicate Carousel Libraries

Both `embla-carousel-react` and `react-slick` are installed for the same purpose.

### 🟡 Moderate Issues

#### 6.5 — Theme Not Persisted

`ThemeProvider` initializes to `'light'` on every page load. There's no `localStorage`/`sessionStorage` persistence, so user preference is lost on refresh.

#### 6.6 — `UserProvider` Placement Unclear

`App.tsx` wraps only `ThemeProvider > RouterProvider`. The `UserProvider` is not visible in the app shell composition, yet `useUser()` is called in multiple feature components. This suggests it's mounted somewhere (possibly `AppGate.tsx` or `Root.tsx`) but the provider hierarchy is not explicit.

#### 6.7 — Empty `api/` and `mock/` Directories

`src/api/` and `src/mock/` are empty directories — vestigial from an earlier architecture. Should be cleaned up.

#### 6.8 — No React Query Provider in App

`App.tsx` does not show a `QueryClientProvider` wrapping. This is likely set up in `Root.tsx` or another file, but it's not visible in the app entry point, making the architecture harder to understand.

#### 6.9 — Direct Service Calls in Components

While hooks are properly used for **read** operations (via React Query), **write operations** (approve settlement, send reminder, reject invite) are called directly in components via service functions:

```typescript
// Home.tsx — direct service calls in event handlers
await settlementsService.approveSettlement(groupId, referenceId);
await groupsService.acceptInviteById(item.inviteId);
```

These mutation calls bypass React Query mutations (`useMutation`), losing automatic error handling, loading states, and optimistic updates.

#### 6.10 — `ProtectedRoute` Only Checks Token Existence

```typescript
export function ProtectedRoute() {
  const token = tokenStore.get();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
```

There's no token validity check (expiry, format). A stale or invalid token will pass the guard, and the 401 interceptor handles it reactively instead of proactively.

### 🟢 Minor Issues

#### 6.11 — No `QueryClient` Configuration Visible

Default React Query `staleTime` and `gcTime` are used (0 and 5 min respectively), which means every navigation triggers a refetch. Should be tuned for the BFF endpoints.

#### 6.12 — `popper` Dependencies Potentially Unused

`@popperjs/core` and `react-popper` are listed as dependencies but may be unused (Radix primitives handle their own positioning).

---

## Summary

| Dimension | Assessment |
|-----------|-----------|
| **Organization** | ✅ Feature-based, well-structured |
| **State Management** | ✅ Clean separation (Context + React Query) |
| **API Layer** | ✅ Centralized with proper auth interceptors |
| **Component Reuse** | ✅ Good shared component library via shadcn/ui |
| **Type Safety** | ⚠️ Comprehensive types defined but `any` overused in services |
| **Bundle Size** | 🔴 Dual UI frameworks (shadcn + MUI) + duplicate carousel libs |
| **Code Maintainability** | ⚠️ Large page components need decomposition |
| **Mutation Handling** | ⚠️ Write operations bypass React Query `useMutation` |
