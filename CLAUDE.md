# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install       # Install dependencies
pnpm dev           # Start Vite dev server
pnpm build         # Production build (output: dist/)
```

No test runner or lint script is configured in package.json.

## Environment Setup

Copy `.env.example` to `.env` and fill in values:

```bash
VITE_API_BASE_URL=http://localhost:8080/v1   # Backend API
VITE_MQTT_URL=wss://...                      # WebSocket MQTT
VITE_FIREBASE_API_KEY=...                    # Firebase (remote config, auth gate)
# ...other Firebase vars
```

## Architecture

**SplitBliz** is a mobile-first group expense splitting app (React 18 + TypeScript + Vite).

### Feature Module Structure

Code is organized under `src/features/` by domain:

- `auth/` — Splash, Login, SignUp, ProfileSetup, FirstGroup (onboarding flow)
- `groups/` — Group detail, settings, activity; uses `components/` sub-components
- `expenses/` — Add/view expenses with split logic
- `settlements/` — Settle-up payment flows
- `home/` — Dashboard
- `profile/` — User profile settings
- `chat/`, `whiteboard/`, `ai/`, `notifications/` — Secondary features

### Routing

React Router 7 (`createBrowserRouter`) defined in `src/app/routes.tsx`. All protected routes go through `ProtectedRoute.tsx`. Nested routes follow the pattern `/group/:groupId/*`.

### API & Auth

- Axios client in `src/services/apiClient.ts` with request/response interceptors
- JWT stored in `sessionStorage` under key `sb_access_token`
- 401 responses clear the token and redirect to `/login`
- All service modules export typed functions; never call axios directly from components
- **Monetary values are always `string` type**, never `number` (floating-point precision)

### App Gate

`src/app/AppGate.tsx` fetches Firebase Remote Config before rendering the app. Supports kill switch (`app_kill_switch`), maintenance mode, and forced update checks.

### State Management

No Redux or Zustand. State lives in custom hooks (`src/hooks/`) that call service functions in `useEffect`. Key hooks: `useCurrentUser`, `useGroups`, `useGroupDetail`, `useExpenses`, `useSettlements`, `useNotifications`, `useActivity`.

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` (no postcss config needed)
- **Radix UI** primitives wrapped as shadcn/ui components in `src/components/ui/`
- Dark/light theme via `src/providers/ThemeProvider.tsx` (CSS class on document root)
- Colors centralized in `src/constants/colors.ts` — do not hardcode colors in components
- Path alias: `@/` maps to `src/`

### Types

All domain types and enums are in `src/types/index.ts`. Key enums: `SplitType` (EQUAL, FIXED, PERCENTAGE, SHARES), `MemberRole`, `MemberStatus`, `GroupType`, `SettlementStatus`.

## MCP Servers Available

- **filesystem** — read and write files in both frontend and backend projects
- **github** — manage issues, branches, and PRs
- **mysql** — inspect schema and run read-only queries against the `splitbliz` database
- **fetch** — call Spring Boot API endpoints to test behaviour
- **memory** — persist decisions and preferences across sessions
- **sequential-thinking** — plan complex multi-step tasks before writing code
- **puppeteer** — automate and test the frontend in a real browser

See `.claude/ARCHITECTURE.md`, `.claude/CONVENTIONS.md`, and `.claude/COMMANDS.md` for detailed reference docs.

## Memory Instructions

- At session start, read from the memory MCP to restore project context
- Save architectural decisions to memory as they are made
- Save rejected approaches and the reasons they were rejected
- Save preferences as you learn them
