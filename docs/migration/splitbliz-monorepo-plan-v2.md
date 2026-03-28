# SplitBliz â€” Monorepo Migration & Mobile App Plan (v2)

> **Project:** SplitBliz React Web â†’ Monorepo (Web + Mobile)
> **Stack:** React 18 + Vite 6 + TypeScript + Spring Boot backend
> **Goal:** Extract shared logic into `packages/core`, scaffold Expo mobile app that reuses it
> **Agent instructions:** Complete each phase fully before moving to the next. Web app must remain fully functional after every phase.

---

## Context & Architecture Overview

### Current state
- Single repo: `splitbliz-react-web` (Vite + React + TypeScript)
- Key folders to extract: `src/services/`, `src/hooks/`, `src/types/`, `src/utils/`, `src/constants/`
- 10 issues identified and fixed in this plan (see changelog at bottom)

### Target state
```
splitbliz-monorepo/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/          <- existing Vite app (moved here)
â”‚   â””â”€â”€ mobile/       <- new Expo app (uses expo-router)
â””â”€â”€ packages/
    â””â”€â”€ core/         <- shared services, hooks, types, utils, constants
```

### Navigation decision
**Mobile uses expo-router throughout.** React Navigation is NOT used. All navigation code uses expo-router APIs (`useRouter`, `useLocalSearchParams`, `Stack`, `Tabs`).

### What goes into `packages/core`
| Folder | Notes |
|--------|-------|
| `src/services/` | All service files including firebase.ts + remoteConfig.ts after decoupling |
| `src/hooks/` | All custom hooks |
| `src/types/index.ts` | All TypeScript types |
| `src/utils/` | Pure utility functions |
| `src/constants/app.ts`, `colors.ts`, `spacing.ts`, `emoji.ts`, `typography.ts` | Platform-agnostic constants |

### What stays in each app (NOT shared)
| File | Reason |
|------|--------|
| `src/constants/iconography.ts` | Imports `lucide-react` (web only) |
| `src/constants/icons.ts` | Imports `lucide-react` (web only) |
| All `components/` and `features/` UI | Platform-specific UI |

---

## Phase 1 â€” Decouple (fix coupling in existing repo)

> **Goal:** Make service files platform-agnostic without breaking the web app.
> **Rule:** Do NOT move any files yet. All changes happen inside `splitbliz-react-web/src/`.
> **Validation:** Run `npm run dev` and `npm run build` after each fix â€” must pass with zero errors.

---

### Fix 1 â€” `src/services/apiClient.ts`

**Problem 1:** `tokenStore` uses `sessionStorage` directly â€” unavailable in React Native.
**Problem 2:** `window.location.replace('/login')` â€” `window` does not exist in React Native.
**Problem 3 (agent finding #2):** `set` and `clear` must allow `Promise<void>` because mobile uses async AsyncStorage. Interface must reflect this, and a blocking init step is needed before first API call.

**Solution:** Make both pluggable. Allow async set/clear. Add an `init()` step to gate API calls until storage is ready.

Replace the entire `tokenStore` block and the `window.location` call:

```typescript
// =============================================================================
// Token store â€” pluggable for web (sessionStorage) and mobile (AsyncStorage)
// set/clear are async to support mobile; web implementations resolve immediately
// =============================================================================
const TOKEN_KEY = 'sb_access_token';

interface TokenStoreImpl {
  get: () => string | null;
  set: (token: string) => Promise<void>;
  clear: () => Promise<void>;
  init?: () => Promise<void>; // optional: load token into memory before first use
}

let _tokenImpl: TokenStoreImpl = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: async (token: string) => { sessionStorage.setItem(TOKEN_KEY, token); },
  clear: async () => { sessionStorage.removeItem(TOKEN_KEY); },
};

export const tokenStore = {
  configure: (impl: TokenStoreImpl) => { _tokenImpl = impl; },
  get: () => _tokenImpl.get(),
  set: (token: string): Promise<void> => _tokenImpl.set(token),
  clear: (): Promise<void> => _tokenImpl.clear(),
  init: (): Promise<void> => _tokenImpl.init?.() ?? Promise.resolve(),
};

// =============================================================================
// Navigation handler â€” pluggable for web (window.location) and mobile (router)
// =============================================================================
interface NavigationHandlerImpl {
  onUnauthorized: () => void;
}

let _navImpl: NavigationHandlerImpl = {
  onUnauthorized: () => { window.location.replace('/login'); },
};

export const navigationHandler = {
  configure: (impl: NavigationHandlerImpl) => { _navImpl = impl; },
  onUnauthorized: () => _navImpl.onUnauthorized(),
};
```

In the response interceptor, replace `window.location.replace('/login')` with:
```typescript
navigationHandler.onUnauthorized();
```

Update all callers of `tokenStore.set()` and `tokenStore.clear()` to await them:
```typescript
// authService.ts â€” update every place that calls tokenStore.set or tokenStore.clear
await tokenStore.set(res.data.accessToken);
await tokenStore.clear();
```

**Web app entry point** (`src/app/Root.tsx`): Call `tokenStore.init()` before rendering. Since web implementation is sync it resolves immediately:
```typescript
// src/app/Root.tsx â€” add at the top of the component or before rendering
useEffect(() => {
  tokenStore.init(); // no-op on web, loads AsyncStorage on mobile
}, []);
```

---

### Fix 2 â€” `src/services/mqttService.ts`

**Problem:** `import.meta.env.VITE_MQTT_URL` is Vite-specific â€” unavailable in Expo.

**Solution:** Make the MQTT URL injectable before connection.

Add this config block at the top of the file, before the class definition:

```typescript
// =============================================================================
// MQTT config â€” injectable so web uses import.meta.env, mobile uses process.env
// =============================================================================
let _mqttUrl = 'ws://localhost:8083/mqtt';

export const mqttConfig = {
  configure: (url: string) => { _mqttUrl = url; },
};
```

Inside the `connect(userId: string)` method, replace:
```typescript
// BEFORE
const url = import.meta.env.VITE_MQTT_URL ?? 'ws://localhost:8083/mqtt';

// AFTER
const url = _mqttUrl;
```

In the web app entry point, add:
```typescript
import { mqttConfig } from '../services/mqttService';
mqttConfig.configure(import.meta.env.VITE_MQTT_URL ?? 'ws://localhost:8083/mqtt');
```

---

### Fix 3 â€” `src/services/firebase.ts` and `src/services/remoteConfig.ts`

**Problem:** `import.meta.env.VITE_FIREBASE_*` variables are Vite-specific.
**Agent finding #6:** Both `firebase.ts` and `remoteConfig.ts` belong in `packages/core` after this fix â€” they are used by web and will be used by mobile. This plan moves them to core in Phase 2.

**Solution:** Make Firebase config injectable with lazy initialization.

Replace the entire `firebase.ts` with:

```typescript
import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';

// =============================================================================
// Firebase config â€” injectable so web uses VITE_*, mobile uses EXPO_PUBLIC_*
// Lazy initialization: app is created on first use after configure() is called
// =============================================================================
let _firebaseConfig: FirebaseOptions = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
};

export const firebaseSetup = {
  configure: (config: FirebaseOptions) => { _firebaseConfig = config; },
};

let _remoteConfigInstance: ReturnType<typeof getRemoteConfig> | null = null;

export function getFirebaseRemoteConfig() {
  if (!_remoteConfigInstance) {
    const app = getApps().length ? getApps()[0] : initializeApp(_firebaseConfig);
    _remoteConfigInstance = getRemoteConfig(app);
  }
  return _remoteConfigInstance;
}

// Backward-compatible export so remoteConfig.ts continues to work unchanged
export const remoteConfig = new Proxy({} as ReturnType<typeof getRemoteConfig>, {
  get: (_target, prop) => (getFirebaseRemoteConfig() as any)[prop],
});
```

`remoteConfig.ts` requires no changes â€” it already imports from `./firebase`.

In the web app entry point, add:
```typescript
import { firebaseSetup } from '../services/firebase';
firebaseSetup.configure({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});
```

---

### Fix 4 â€” `src/constants/iconography.ts` and `src/constants/icons.ts`

**Problem:** Both import from `lucide-react` which is web-only.

**Solution:** These files stay in the web app and are NOT moved to `packages/core`. Each platform will have its own version. No code changes needed now.

---

### Phase 1 Validation Checklist

```bash
# In splitbliz-react-web/
npm run dev          # Dev server must start with no errors
npm run build        # Production build must succeed
npx tsc --noEmit     # TypeScript must pass
```

Manually test in browser:
- [ ] Login flow works (tokenStore.set is called and awaited)
- [ ] Protected routes work (tokenStore.get is called)
- [ ] MQTT connects (browser console shows `[MQTT] Connected`)
- [ ] No console errors on home screen

---

## Phase 2 â€” Create Monorepo + Extract `packages/core`

> **Goal:** Move web app into `apps/web`, extract shared code into `packages/core`.
> **Rule:** Web app must work identically after this phase. Zero behavior changes.

---

### Step 2.1 â€” Create monorepo root

Create a new directory alongside (NOT inside) your existing web repo:

```powershell
mkdir splitbliz-monorepo
cd splitbliz-monorepo
```

Create `package.json` at the root:

```json
{
  "name": "splitbliz",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.5"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  }
}
```

Create `turbo.json` at the root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

**Note:** `packages/core` must emit build output to `dist/` to match this `outputs` setting.

Create `.gitignore` at the root:

```
node_modules/
dist/
.turbo/
```

Install Turborepo:

```powershell
npm install
```

---

### Step 2.2 â€” Move web app into `apps/web`

**Agent finding #7:** Copying with `-Recurse` drags in `node_modules`, `dist`, and `.git`. Exclude them explicitly.

```powershell
mkdir apps

# Copy web repo, excluding node_modules, dist, and .git
robocopy ..\splitbliz-react-web apps\web /E /XD node_modules dist .git /XF .env.production

# Verify node_modules was NOT copied
Test-Path apps\web\node_modules   # should return False
```

Update `apps/web/package.json` â€” change the `name` field only:

```json
{
  "name": "@splitbliz/web",
  ...
}
```

Add `type-check` script to `apps/web/package.json` (agent finding #4):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  }
}
```

---

### Step 2.3 â€” Create `packages/core`

```powershell
mkdir packages\core\src
```

Create `packages/core/package.json`:

> **Agent finding #5:** React `18.3.1` does not exist. Use `18.2.0`. React must be a `peerDependency` only â€” not a direct dependency â€” to avoid duplicate React instances.

```json
{
  "name": "@splitbliz/core",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "dependencies": {
    "axios": "^1.13.6",
    "@tanstack/react-query": "^5.95.2",
    "paho-mqtt": "^1.1.0",
    "firebase": "^12.11.0",
    "uuid": "^13.0.0"
  },
  "peerDependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/react": "^18.2.0"
  },
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc -p tsconfig.json"
  }
}
```

Create `packages/core/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

---

### Step 2.4 â€” Move shared files into `packages/core/src`

**Agent finding #7 applies here too:** Use `robocopy` to avoid dragging unwanted files.

```powershell
# Services â€” including firebase.ts and remoteConfig.ts (both are now platform-agnostic)
robocopy apps\web\src\services packages\core\src\services /E /XF .gitkeep

# Hooks
robocopy apps\web\src\hooks packages\core\src\hooks /E /XF .gitkeep

# Types
robocopy apps\web\src\types packages\core\src\types /E /XF .gitkeep

# Utils
robocopy apps\web\src\utils packages\core\src\utils /E

# Constants â€” safe files only (NOT iconography.ts or icons.ts)
mkdir packages\core\src\constants
Copy-Item apps\web\src\constants\app.ts         packages\core\src\constants\
Copy-Item apps\web\src\constants\colors.ts      packages\core\src\constants\
Copy-Item apps\web\src\constants\spacing.ts     packages\core\src\constants\
Copy-Item apps\web\src\constants\emoji.ts       packages\core\src\constants\
Copy-Item apps\web\src\constants\typography.ts  packages\core\src\constants\
```

---

### Step 2.5 â€” Create index barrel files

**Agent finding #9:** The core barrel assumes `./services/index` and `./hooks/index` exist. Create them explicitly.

Create `packages/core/src/services/index.ts`:

```typescript
export * from './apiClient';
export * from './authService';
export * from './groupsService';
export * from './expensesService';
export * from './settlementsService';
export * from './activityService';
export * from './notificationsService';
export * from './engagementService';
export * from './aiInsightsService';
export * from './aiService';
export * from './systemService';
export * from './mqttService';
export * from './firebase';
export * from './remoteConfig';
```

Create `packages/core/src/hooks/index.ts`:

```typescript
export * from './useActivity';
export * from './useAuthMutations';
export * from './useCurrentUser';
export * from './useEngagementMutations';
export * from './useExpenseMutations';
export * from './useExpenses';
export * from './useGroupDetail';
export * from './useGroupMqtt';
export * from './useGroupMutations';
export * from './useGroups';
export * from './useMqtt';
export * from './useNotificationMutations';
export * from './useNotifications';
export * from './useProfileMutations';
export * from './useSettlementMutations';
export * from './useSettlements';
// NOTE: use-mobile.ts is NOT exported â€” it uses window.matchMedia (web only)
// Each app implements its own responsive hook
```

Create `packages/core/src/constants/index.ts`:

```typescript
export * from './app';
export * from './colors';
export * from './spacing';
export * from './emoji';
export * from './typography';
```

Create `packages/core/src/index.ts`:

```typescript
export * from './services/index';
export * from './hooks/index';
export * from './types/index';
export * from './utils/cn';
export * from './utils/expenseCalculator';
export * from './utils/formatCurrency';
export * from './constants/index';
```

---

### Step 2.6 â€” Update `apps/web` to import from `@splitbliz/core`

Add the core dependency to `apps/web/package.json`:

```json
{
  "dependencies": {
    "@splitbliz/core": "*",
    ...
  }
}
```

**Agent finding #8:** The mass search-replace must exclude `iconography.ts` and `icons.ts`. Do NOT replace imports of those files â€” they stay as local imports.

Update all import paths in `apps/web/src/`. The pattern:

```typescript
// BEFORE
import { groupsService } from '../../services/groupsService';
import { useGroups } from '../../hooks/useGroups';
import { Group, UserFull } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

// AFTER
import { groupsService, useGroups, Group, UserFull, formatCurrency } from '@splitbliz/core';
```

**Safe search-replace targets** (run across all files in `apps/web/src/features/`, `apps/web/src/app/`, `apps/web/src/components/`, `apps/web/src/providers/`):

| Find pattern | Replace with |
|---|---|
| `from '../services/` | `from '@splitbliz/core'` â€” then remove the specific named import path |
| `from '../../services/` | `from '@splitbliz/core'` |
| `from '../../../services/` | `from '@splitbliz/core'` |
| `from '../hooks/` | `from '@splitbliz/core'` |
| `from '../../hooks/` | `from '@splitbliz/core'` |
| `from '../types'` | `from '@splitbliz/core'` |
| `from '../../types'` | `from '@splitbliz/core'` |
| `from '../utils/` | `from '@splitbliz/core'` |
| `from '../../utils/` | `from '@splitbliz/core'` |
| `from '../constants/app'` | `from '@splitbliz/core'` |
| `from '../../constants/app'` | `from '@splitbliz/core'` |

**Do NOT replace these â€” leave as local relative imports:**
- Any import containing `iconography`
- Any import containing `icons`
- Any import containing `use-mobile`

After replacing, remove the now-empty source folders from `apps/web/src/`:
- `services/`
- `hooks/`
- `types/`
- `utils/`
- The 5 constants files that were moved (`app.ts`, `colors.ts`, `spacing.ts`, `emoji.ts`, `typography.ts`)

Keep in `apps/web/src/constants/`:
- `iconography.ts`
- `icons.ts`

---

### Step 2.7 â€” Configure path alias in `apps/web`

Update `apps/web/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

### Step 2.8 â€” Install all dependencies from monorepo root

```powershell
# From monorepo root
npm install
```

---

### Phase 2 Validation Checklist

```powershell
# From monorepo root
npm run build
npm run type-check   # must pass for all packages including packages/core

# Run web app
cd apps/web
npm run dev
```

Manually verify in browser:
- [ ] Web app loads on `localhost:5173`
- [ ] Login / logout works
- [ ] Home screen loads with groups
- [ ] MQTT real-time updates work
- [ ] No import errors in browser console
- [ ] `grep -r "import.meta.env" packages/core/src` returns zero results

---

## Phase 3 â€” Scaffold Expo Mobile App

> **Goal:** Create `apps/mobile` with Expo + expo-router, wire up `@splitbliz/core`, get skeleton running.
> **Navigation decision:** expo-router is used throughout. React Navigation is NOT installed.

---

### Step 3.1 â€” Create Expo app with expo-router template

```powershell
cd apps

# Use the expo-router template (not blank) â€” this pre-configures expo-router
npx create-expo-app@latest mobile --template expo-router

cd mobile
```

Update `apps/mobile/package.json` name:

```json
{
  "name": "@splitbliz/mobile",
  ...
}
```

Add `type-check` script (agent finding #4):

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "type-check": "tsc --noEmit"
  }
}
```

---

### Step 3.2 â€” Install mobile dependencies

```powershell
cd apps/mobile

# Async storage (replaces sessionStorage)
npx expo install @react-native-async-storage/async-storage

# TanStack Query (same version as core)
npm install @tanstack/react-query

# Axios (already in core but needs to be resolvable in RN)
npm install axios

# NativeWind + tailwindcss (agent finding #10: tailwindcss is required separately)
npm install nativewind
npm install --save-dev tailwindcss

# Icons â€” RN version (different package from lucide-react)
npm install lucide-react-native
npx expo install react-native-svg

# Gesture handler and safe area (required by expo-router)
npx expo install react-native-gesture-handler react-native-safe-area-context

# Reanimated (required by many RN animation libs)
npx expo install react-native-reanimated

# UUID support in React Native (required if core uses uuid.v4)
npx expo install react-native-get-random-values
```

Do NOT install:
- `@react-navigation/native` â€” we are using expo-router
- `react-navigation` â€” we are using expo-router
- `lucide-react` â€” web only, use `lucide-react-native` instead

---

### Step 3.3 â€” Add `@splitbliz/core` dependency

Update `apps/mobile/package.json`:

```json
{
  "dependencies": {
    "@splitbliz/core": "*",
    ...
  }
}
```

---

### Step 3.4 â€” Configure Metro for monorepo

**Agent finding (implicit):** Metro bundler needs to know about the monorepo workspace to resolve `@splitbliz/core`.

Create `apps/mobile/metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch monorepo packages folder for changes
config.watchFolders = [monorepoRoot];

// Resolve modules from both app and monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

---

### Step 3.5 â€” Configure NativeWind

Create `apps/mobile/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Update `apps/mobile/babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Keep this last
      'react-native-reanimated/plugin',
    ],
  };
};
```

If you are not using Reanimated, remove `react-native-reanimated` and the plugin above.

---

### Step 3.6 â€” Configure environment variables

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
EXPO_PUBLIC_MQTT_URL=ws://localhost:8083/mqtt
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Device note:** `localhost` works only on the iOS simulator. For Android emulator use `10.0.2.2`, and for real devices use your machine's LAN IP.

---

### Step 3.7 â€” Create bootstrap file

**Agent finding #3:** Bootstrap MUST run before any other module that touches `@splitbliz/core`. It must be the very first side-effect import in the app entry point.

Create `apps/mobile/src/bootstrap.ts`:

```typescript
// =============================================================================
// bootstrap.ts â€” configure @splitbliz/core platform implementations
// IMPORTANT: This file must be imported FIRST in app/_layout.tsx before
// any other import that uses @splitbliz/core. Use a side-effect import:
//   import './src/bootstrap';
// =============================================================================

import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore, navigationHandler, mqttConfig, firebaseSetup } from '@splitbliz/core';

// -----------------------------------------------------------------------------
// Token store â€” AsyncStorage backed, with in-memory cache for sync .get()
// -----------------------------------------------------------------------------
let _memoryToken: string | null = null;

tokenStore.configure({
  get: () => _memoryToken,

  set: async (token: string) => {
    _memoryToken = token;
    await AsyncStorage.setItem('sb_access_token', token);
  },

  clear: async () => {
    _memoryToken = null;
    await AsyncStorage.removeItem('sb_access_token');
  },

  // init() loads the token from AsyncStorage into memory.
  // Must be awaited before the first API call is made.
  init: async () => {
    _memoryToken = await AsyncStorage.getItem('sb_access_token');
  },
});

// -----------------------------------------------------------------------------
// Navigation handler â€” will be overridden once router is ready (see _layout.tsx)
// -----------------------------------------------------------------------------
navigationHandler.configure({
  onUnauthorized: () => {
    // Overridden in _layout.tsx once expo-router is initialized
    console.warn('[Auth] onUnauthorized called before navigation was ready');
  },
});

// -----------------------------------------------------------------------------
// MQTT URL from Expo env
// -----------------------------------------------------------------------------
mqttConfig.configure(
  process.env.EXPO_PUBLIC_MQTT_URL ?? 'ws://localhost:8083/mqtt'
);

// -----------------------------------------------------------------------------
// Firebase config from Expo env
// -----------------------------------------------------------------------------
firebaseSetup.configure({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
});
```

---

### Step 3.8 â€” Create app entry point

**Agent finding #3:** Bootstrap import must be the absolute first line â€” before React, before expo-router, before anything else.

Create `apps/mobile/app/_layout.tsx`:

```tsx
// CRITICAL: bootstrap must be the very first import â€” no exceptions
import '../src/bootstrap';

import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tokenStore, navigationHandler } from '@splitbliz/core';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wire up navigation handler now that expo-router is available
    navigationHandler.configure({
      onUnauthorized: () => router.replace('/(auth)/login'),
    });

    // Load token from AsyncStorage into memory before any API calls
    tokenStore.init().then(() => {
      setReady(true);
    });
  }, []);

  // Block rendering until token is loaded to avoid race conditions
  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
```

---

### Step 3.9 â€” Create navigation skeleton

Create `apps/mobile/app/(auth)/login.tsx`:

```tsx
import { View, Text } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login â€” coming in Phase 4</Text>
    </View>
  );
}
```

Create `apps/mobile/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

Create `apps/mobile/app/(tabs)/index.tsx` â€” smoke test that `@splitbliz/core` hooks work:

```tsx
import { View, Text } from 'react-native';
import { useGroups } from '@splitbliz/core';

export default function HomeScreen() {
  const { data, isLoading } = useGroups();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        {isLoading ? 'Loading...' : `${data?.length ?? 0} groups`}
      </Text>
    </View>
  );
}
```

---

### Step 3.10 â€” Create mobile iconography

Create `apps/mobile/src/constants/iconography.ts` â€” mirrors web keys, uses `lucide-react-native`:

```typescript
import { Receipt, Check, PenLine, Users, LogOut, CreditCard, Clock, X } from 'lucide-react-native';

// Same keys as web iconography.ts but RN-compatible
// Usage: <Icon.Icon color={Icon.color} size={18} />
export const GROUP_ACTIVITY_ICON_MAP = {
  EXPENSE:  { Icon: Receipt,  color: '#6c5ce7', bg: '#ede9ff' },
  SETTLE:   { Icon: Check,    color: '#0f6e56', bg: '#e1f5ee' },
  EDIT:     { Icon: PenLine,  color: '#e28a11', bg: '#faeeda' },
  JOIN:     { Icon: Users,    color: '#2c74c9', bg: '#e6f1fb' },
  LEAVE:    { Icon: LogOut,   color: '#e24b4a', bg: '#fceaea' },
};

export const NOTIFICATION_STYLE_MAP = {
  NEW_EXPENSE:           { Icon: CreditCard, color: '#6c5ce7', bg: '#ede9ff' },
  EXPENSE_ADDED:         { Icon: CreditCard, color: '#6c5ce7', bg: '#ede9ff' },
  REMINDER:              { Icon: Clock,      color: '#e24b4a', bg: '#fceaea' },
  SETTLEMENT_APPROVED:   { Icon: Check,      color: '#0f6e56', bg: '#e1f5ee' },
  SETTLEMENT_REJECTED:   { Icon: X,          color: '#e24b4a', bg: '#fceaea' },
  SETTLEMENT_REQUEST:    { Icon: Clock,      color: '#e28a11', bg: '#faeeda' },
  DEFAULT:               { Icon: Clock,      color: '#e28a11', bg: '#faeeda' },
};
```

---

### Phase 3 Validation Checklist

```powershell
# From apps/mobile
npx expo start

# Press 'i' for iOS simulator, 'a' for Android emulator
```

Verify:
- [ ] App launches without crash
- [ ] No `sessionStorage is not defined` errors
- [ ] No `window is not defined` errors
- [ ] Home screen shows "Loading..." then a group count
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `grep -r "import.meta.env" apps/mobile/src` returns zero results

---

## Phase 4 â€” Build Mobile Screens

> **Goal:** Build all feature screens using hooks and services from `@splitbliz/core`.
> **Rule:** Build in priority order â€” auth first, then home, then features.

---

### Screen build order

| Priority | Screen | Core hook/service | Notes |
|----------|--------|-------------------|-------|
| 1 | Login | `authService.loginEmail()` | Must complete first |
| 2 | Sign up | `authService.register()` | |
| 3 | Google OAuth | `authService.loginGoogle()` | Use expo-auth-session |
| 4 | Profile setup | `authService.updateProfile()` | Post-signup step |
| 5 | Home | `useGroups`, `useMqttConnection` | Main screen |
| 6 | Group detail | `useGroupDetail`, `useGroupMqtt` | Core feature |
| 7 | Add expense | `useExpenseMutations` | Core feature |
| 8 | Expense detail | `useExpenses` | Core feature |
| 9 | Settle up | `useSettlementMutations` | Core feature |
| 10 | Group chat | `useGroupMqtt`, `engagementService` | Real-time |
| 11 | Notifications | `useNotifications` | Informational |
| 12 | Profile settings | `useProfileMutations` | Settings |
| 13 | AI insights | `aiInsightsService`, `aiService` | Enhancement |

---

### Phase 4 screen pattern

Every screen follows this exact structure:

```tsx
// apps/mobile/app/(tabs)/groups/[groupId].tsx

import { View, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useGroupDetail } from '@splitbliz/core';             // <- from core
import { ExpenseRow } from '../../../src/components/ExpenseRow'; // <- mobile UI

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data, isLoading } = useGroupDetail(groupId);

  if (isLoading) return <LoadingScreen />;

  return (
    <FlatList
      data={data?.expenses}
      renderItem={({ item }) => <ExpenseRow expense={item} />}
    />
  );
}
```

**Key rule:** Hooks and services always come from `@splitbliz/core`. Only the JSX and StyleSheet are mobile-specific.

---

### Auth screen implementation

```tsx
// apps/mobile/app/(auth)/login.tsx

import '../../../src/bootstrap'; // safety: ensure bootstrap is loaded
import { useState } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@splitbliz/core';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.loginEmail({ email, password });
      router.replace('/(tabs)');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  error: { color: 'red', marginBottom: 12 },
  button: { backgroundColor: '#6c5ce7', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
```

---

### MQTT in mobile

`useMqttConnection` and `useGroupMqtt` from `@splitbliz/core` work identically in React Native â€” Paho uses WebSocket which React Native supports natively. No changes needed. Call them exactly as in web.

---

## Appendix â€” Common issues and fixes

### Issue: `sessionStorage is not defined`
**Cause:** `bootstrap.ts` was not the first import in `_layout.tsx`.
**Fix:** `import '../src/bootstrap'` must be literally the first line of `app/_layout.tsx`.

### Issue: `window is not defined`
**Cause:** A file in `packages/core/src/` still references `window` directly.
**Fix:** Run `grep -r "window\." packages/core/src/` â€” there should be zero results. The only reference to `window` should be in `apps/web` (the `navigationHandler` default).

### Issue: TypeScript errors in `packages/core` after moving files
**Cause:** Internal relative imports inside core files need to stay relative.
**Fix:** Imports within `packages/core/src/` use relative paths (`../types`, `../services/apiClient`). Only `apps/web` and `apps/mobile` use the `@splitbliz/core` package name.

### Issue: `import.meta.env` errors in `packages/core`
**Cause:** A service still references `import.meta.env.VITE_*` directly.
**Fix:** Run `grep -r "import.meta.env" packages/core/src/` â€” must return zero results after Phase 1.

### Issue: `turbo type-check` fails
**Cause:** `type-check` script is missing from a package.
**Fix:** All three packages need `"type-check": "tsc --noEmit"` in their `scripts`. Check `apps/web/package.json`, `apps/mobile/package.json`, and `packages/core/package.json`.

### Issue: Monorepo `npm install` fails
**Fix:** Ensure root `package.json` has `"workspaces": ["apps/*", "packages/*"]` and all sub-packages have a valid `name` field starting with `@splitbliz/`.

### Issue: Metro cannot resolve `@splitbliz/core`
**Fix:** Ensure `apps/mobile/metro.config.js` exists with `watchFolders` and `nodeModulesPaths` pointing to the monorepo root. Then run `npx expo start --clear` to clear Metro cache.

### Issue: Hot reload not picking up changes in `packages/core`
**Fix:** Metro's `watchFolders` in `metro.config.js` must include the monorepo root. Changes to `packages/core/src/` will then trigger a reload in the mobile app.

### Issue: Duplicate React instance (`Cannot read properties of null, reading 'useState'`)
**Cause:** React appears twice in the dependency tree â€” once in `packages/core` and once in `apps/mobile`.
**Fix:** React must be in `peerDependencies` in `packages/core/package.json`, NOT in `dependencies`. The app (`apps/mobile`) owns the single React instance.

### Issue: Mojibake characters (`â€”`, `â†’`, `â”`)
**Cause:** The file was saved with the wrong encoding at some point.
**Fix:** Re-save the file as UTF-8 and replace any remaining mojibake sequences with ASCII equivalents (e.g., `--`, `->`, and `+--`).

---

## Summary â€” estimated timeline

| Phase | Work | Estimated time |
|-------|------|----------------|
| Phase 1 â€” Decouple | Fix 3 service files | 2â€“3 hours |
| Phase 2 â€” Monorepo + core | Scaffold + move files + update imports | 4â€“6 hours |
| Phase 3 â€” Expo scaffold | Setup + wire core + navigation skeleton | 3â€“4 hours |
| Phase 4 â€” Mobile screens | Build all 13 screens | 3â€“5 days |

**Total to production-ready mobile app: ~1 week.**

---

## Changelog from v1

| # | Agent finding | Fix applied |
|---|---|---|
| 1 | expo-router vs React Navigation mismatch | Standardized on expo-router throughout. Step 3.1 uses expo-router template. Step 3.2 installs expo-router dependencies only. |
| 2 | tokenStore interface sync/async mismatch | `set` and `clear` now typed as `Promise<void>`. Added optional `init()` method. `_layout.tsx` awaits `tokenStore.init()` before rendering. |
| 3 | Bootstrap not imported first | `import '../src/bootstrap'` is now the literal first line of `_layout.tsx` with explicit comment warning. |
| 4 | `type-check` script missing from packages | Added `"type-check": "tsc --noEmit"` to `apps/web`, `apps/mobile`, and `packages/core` package.json files. |
| 5 | React `18.3.1` does not exist | Changed to `18.2.0`. Moved React to `peerDependencies` only in `packages/core`. |
| 6 | firebase.ts / remoteConfig.ts excluded inconsistently | Both now explicitly included in `packages/core` extraction. Step 2.4 updated. |
| 7 | Copy-Item drags in node_modules and .git | Replaced with `robocopy` with `/XD node_modules dist .git` exclusions. |
| 8 | Mass import replace would overwrite iconography/icons | Explicit warning added. `iconography`, `icons`, and `use-mobile` excluded from replacement list. |
| 9 | Barrel exports assume index.ts files exist | Added explicit creation of `services/index.ts`, `hooks/index.ts`, and `constants/index.ts` in Step 2.5. |
| 10 | NativeWind missing tailwindcss | Added `npm install --save-dev tailwindcss` to Step 3.2. |

