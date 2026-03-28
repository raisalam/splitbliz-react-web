# SplitBliz — Monorepo Migration & Mobile App Plan

> **Project:** SplitBliz React Web → Monorepo (Web + Mobile)
> **Stack:** React 18 + Vite 6 + TypeScript + Spring Boot backend
> **Goal:** Extract shared logic into `packages/core`, scaffold Expo mobile app that reuses it
> **Agent instructions:** Complete each phase fully before moving to the next. Web app must remain fully functional after every phase.

---

## Context & Architecture Overview

### Current state
- Single repo: `splitbliz-react-web` (Vite + React + TypeScript)
- Key folders to extract: `src/services/`, `src/hooks/`, `src/types/`, `src/utils/`, `src/constants/`
- 4 coupling issues block extraction (detailed in Phase 1)

### Target state
```
splitbliz-monorepo/
├── apps/
│   ├── web/          ← existing Vite app (moved here)
│   └── mobile/       ← new Expo app
└── packages/
    └── core/         ← shared services, hooks, types, utils, constants
```

### What goes into `packages/core`
| Folder | Notes |
|--------|-------|
| `src/services/` | All service files after decoupling |
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

## Phase 1 — Decouple (fix coupling in existing repo)

> **Goal:** Make 4 files platform-agnostic without breaking the web app.
> **Rule:** Do NOT move any files yet. All changes happen inside `splitbliz-react-web/src/`.
> **Validation:** Run `npm run dev` and `npm run build` after each fix — must pass with zero errors.

---

### Fix 1 — `src/services/apiClient.ts`

**Problem 1:** `tokenStore` uses `sessionStorage` directly — unavailable in React Native.
**Problem 2:** `window.location.replace('/login')` — `window` does not exist in React Native.

**Solution:** Make both pluggable with default web implementations.

Replace the entire `tokenStore` block and the `window.location` call with this:

```typescript
// =============================================================================
// Token store — pluggable for web (sessionStorage) and mobile (AsyncStorage)
// =============================================================================
const TOKEN_KEY = 'sb_access_token';

interface TokenStoreImpl {
  get: () => string | null;
  set: (token: string) => void;
  clear: () => void;
}

// Default implementation uses sessionStorage (web)
let _tokenImpl: TokenStoreImpl = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export const tokenStore = {
  configure: (impl: TokenStoreImpl) => { _tokenImpl = impl; },
  get: () => _tokenImpl.get(),
  set: (token: string) => _tokenImpl.set(token),
  clear: () => _tokenImpl.clear(),
};

// =============================================================================
// Navigation handler — pluggable for web (window.location) and mobile (router)
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

**Web app entry point** (`src/app/App.tsx` or `src/app/Root.tsx`): No changes needed — defaults already use `sessionStorage` and `window.location`.

---

### Fix 2 — `src/services/mqttService.ts`

**Problem:** `import.meta.env.VITE_MQTT_URL` is Vite-specific — unavailable in Expo.

**Solution:** Make the MQTT URL injectable before connection.

Add a config block at the top of the file, before the class definition:

```typescript
// =============================================================================
// MQTT config — injectable so web uses import.meta.env, mobile uses process.env
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

In the web app entry point (`src/app/Root.tsx` or wherever MQTT connection is initialized), add:
```typescript
import { mqttConfig } from '../services/mqttService';
mqttConfig.configure(import.meta.env.VITE_MQTT_URL ?? 'ws://localhost:8083/mqtt');
```

---

### Fix 3 — `src/services/firebase.ts`

**Problem:** `import.meta.env.VITE_FIREBASE_*` variables are Vite-specific.

**Solution:** Make Firebase config injectable.

Replace the entire `firebase.ts` with:

```typescript
import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';

// =============================================================================
// Firebase config — injectable so web uses VITE_*, mobile uses EXPO_PUBLIC_*
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

// Lazy initialization — app is created on first use after configure() is called
let _remoteConfig: ReturnType<typeof getRemoteConfig> | null = null;

export function getFirebaseRemoteConfig() {
  if (!_remoteConfig) {
    const app = getApps().length ? getApps()[0] : initializeApp(_firebaseConfig);
    _remoteConfig = getRemoteConfig(app);
  }
  return _remoteConfig;
}

// Keep backward compat export for remoteConfig.ts
export const remoteConfig = new Proxy({} as ReturnType<typeof getRemoteConfig>, {
  get: (_, prop) => (getFirebaseRemoteConfig() as any)[prop],
});
```

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

### Fix 4 — `src/constants/iconography.ts` and `src/constants/icons.ts`

**Problem:** Both import from `lucide-react` which is web-only. React Native uses `lucide-react-native`.

**Solution:** These files stay in the web app. Do NOT move them to `packages/core`. Each platform will have its own version.

**Action required now:** No code changes. Just note that these files will NOT be extracted in Phase 2.

---

### Phase 1 Validation Checklist

Run all of the following before proceeding to Phase 2:

```bash
# In splitbliz-react-web/
npm run dev          # Dev server must start with no errors
npm run build        # Production build must succeed
npm run type-check   # TypeScript must pass (or tsc --noEmit)
```

Manually test in browser:
- [ ] Login flow works (tokenStore.set is called)
- [ ] Protected routes work (tokenStore.get is called)
- [ ] MQTT connects (check browser console for `[MQTT] Connected`)
- [ ] No console errors on home screen

---

## Phase 2 — Create Monorepo + Extract `packages/core`

> **Goal:** Move web app into `apps/web`, extract shared code into `packages/core`.
> **Rule:** Web app must work identically after this phase. Zero behavior changes.

---

### Step 2.1 — Create monorepo root

Create a new directory alongside (NOT inside) your existing web repo:

```bash
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
    "typescript": "^6.0.2"
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

Create `.gitignore` at the root:

```
node_modules/
dist/
.turbo/
```

Install Turborepo:

```bash
npm install
```

---

### Step 2.2 — Move web app into `apps/web`

```bash
# From monorepo root
mkdir -p apps

# Copy (or move) the existing web repo
# On Windows PowerShell:
Copy-Item -Path ..\splitbliz-react-web -Destination apps\web -Recurse

# Or move it
Move-Item -Path ..\splitbliz-react-web -Destination apps\web
```

Update `apps/web/package.json` — change the `name` field:

```json
{
  "name": "@splitbliz/web",
  ...
}
```

---

### Step 2.3 — Create `packages/core`

```bash
mkdir -p packages/core/src
```

Create `packages/core/package.json`:

```json
{
  "name": "@splitbliz/core",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "axios": "^1.13.6",
    "@tanstack/react-query": "^5.95.2",
    "paho-mqtt": "^1.1.0",
    "firebase": "^12.11.0",
    "uuid": "^13.0.0",
    "react": "18.3.1"
  },
  "devDependencies": {
    "typescript": "^6.0.2"
  },
  "peerDependencies": {
    "react": "^18.0.0"
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
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

---

### Step 2.4 — Move shared files into `packages/core/src`

**On Windows PowerShell, run from the monorepo root:**

```powershell
# Copy services (all except firebase.ts and remoteConfig.ts which need careful handling)
Copy-Item -Path apps\web\src\services -Destination packages\core\src\services -Recurse

# Copy hooks
Copy-Item -Path apps\web\src\hooks -Destination packages\core\src\hooks -Recurse

# Copy types
Copy-Item -Path apps\web\src\types -Destination packages\core\src\types -Recurse

# Copy utils
Copy-Item -Path apps\web\src\utils -Destination packages\core\src\utils -Recurse

# Copy safe constants (NOT iconography.ts or icons.ts)
mkdir packages\core\src\constants
Copy-Item apps\web\src\constants\app.ts packages\core\src\constants\
Copy-Item apps\web\src\constants\colors.ts packages\core\src\constants\
Copy-Item apps\web\src\constants\spacing.ts packages\core\src\constants\
Copy-Item apps\web\src\constants\emoji.ts packages\core\src\constants\
Copy-Item apps\web\src\constants\typography.ts packages\core\src\constants\
```

---

### Step 2.5 — Create barrel exports for `packages/core`

Create `packages/core/src/index.ts`:

```typescript
// Services
export * from './services/index';

// Hooks
export * from './hooks/index';

// Types
export * from './types/index';

// Utils
export * from './utils/cn';
export * from './utils/expenseCalculator';
export * from './utils/formatCurrency';

// Constants
export * from './constants/app';
export * from './constants/colors';
export * from './constants/spacing';
export * from './constants/emoji';
export * from './constants/typography';
```

---

### Step 2.6 — Update `apps/web` to import from `@splitbliz/core`

First, add the core dependency to `apps/web/package.json`:

```json
{
  "dependencies": {
    "@splitbliz/core": "*",
    ...
  }
}
```

Then update all import paths throughout `apps/web/src/`. The pattern is:

```typescript
// BEFORE (relative imports)
import { groupsService } from '../../services/groupsService';
import { useGroups } from '../../hooks/useGroups';
import { Group, UserFull } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

// AFTER (package import)
import { groupsService, useGroups, Group, UserFull, formatCurrency } from '@splitbliz/core';
```

**Files to update** (all files that import from services, hooks, types, utils, or shared constants):
- All files under `src/features/`
- All files under `src/app/`
- All files under `src/components/`
- All files under `src/providers/`

> **Tip for agent:** Run a search-replace across `apps/web/src/` for each pattern:
> - `from '../services/` → `from '@splitbliz/core'`
> - `from '../../services/` → `from '@splitbliz/core'`
> - `from '../../../services/` → `from '@splitbliz/core'`
> - Same pattern for `hooks`, `types`, `utils`
> 
> After replacement, remove the now-unused source folders from `apps/web/src/`:
> `services/`, `hooks/`, `types/`, `utils/`, and the 5 constants files that were moved.
> Keep `constants/iconography.ts` and `constants/icons.ts` in web.

---

### Step 2.7 — Configure path alias in `apps/web`

Update `apps/web/vite.config.ts` to add path alias (if not already present):

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

### Step 2.8 — Install all dependencies from monorepo root

```bash
# From monorepo root
npm install
```

---

### Phase 2 Validation Checklist

```bash
# From monorepo root
npm run build        # Both packages/core and apps/web must build
npm run type-check   # Zero TypeScript errors across all packages

# Run web app specifically
cd apps/web && npm run dev
```

Manually verify in browser:
- [ ] Web app loads on `localhost:5173`
- [ ] Login / logout works
- [ ] Home screen loads with groups
- [ ] MQTT real-time updates work
- [ ] No import errors in console

---

## Phase 3 — Scaffold Expo Mobile App

> **Goal:** Create `apps/mobile` with Expo, wire up `@splitbliz/core`, and get a skeleton running on a device/emulator.
> **Rule:** No feature screens yet — just navigation skeleton + core wired up.

---

### Step 3.1 — Create Expo app

```bash
# From monorepo root
cd apps
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
```

Update `apps/mobile/package.json` name:

```json
{
  "name": "@splitbliz/mobile",
  ...
}
```

---

### Step 3.2 — Install mobile dependencies

```bash
cd apps/mobile

# Core dependencies from @splitbliz/core (already in core but need RN-compatible peers)
npm install @tanstack/react-query axios

# Navigation
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Async storage (replaces sessionStorage)
npx expo install @react-native-async-storage/async-storage

# UI
npm install nativewind
npx expo install react-native-reusables

# Gesture handler (required by navigation)
npx expo install react-native-gesture-handler

# Icons (RN version of lucide)
npm install lucide-react-native
npx expo install react-native-svg
```

---

### Step 3.3 — Add `@splitbliz/core` dependency

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

### Step 3.4 — Configure NativeWind

Create `apps/mobile/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
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
  };
};
```

---

### Step 3.5 — Configure environment variables

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
EXPO_PUBLIC_MQTT_URL=ws://localhost:8083/mqtt
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

### Step 3.6 — Bootstrap core integrations

Create `apps/mobile/src/bootstrap.ts` — this file runs once at app startup to inject platform-specific implementations into `@splitbliz/core`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStore, navigationHandler, mqttConfig, firebaseSetup } from '@splitbliz/core';

// Token storage — use AsyncStorage instead of sessionStorage
// Note: AsyncStorage is async but tokenStore.get() is sync.
// We handle this by loading the token into memory on app start (see AppProvider).
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
});

// Load token into memory on startup
export async function loadTokenFromStorage() {
  _memoryToken = await AsyncStorage.getItem('sb_access_token');
}

// Navigation — will be overridden after navigation is ready
navigationHandler.configure({
  onUnauthorized: () => {
    // Set after navigation is initialized in AppProvider
    console.warn('[Auth] Unauthorized — navigation not yet ready');
  },
});

// MQTT URL from Expo env
mqttConfig.configure(
  process.env.EXPO_PUBLIC_MQTT_URL ?? 'ws://localhost:8083/mqtt'
);

// Firebase config from Expo env
firebaseSetup.configure({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
});
```

---

### Step 3.7 — Create app entry point and navigation skeleton

Create `apps/mobile/app/_layout.tsx`:

```tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loadTokenFromStorage } from '../src/bootstrap';

// Run bootstrap synchronously before any imports that use core
import '../src/bootstrap';

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
  useEffect(() => {
    loadTokenFromStorage();
  }, []);

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

Create `apps/mobile/app/(auth)/login.tsx` (placeholder):

```tsx
import { View, Text } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login — coming in Phase 4</Text>
    </View>
  );
}
```

Create `apps/mobile/app/(tabs)/_layout.tsx` (placeholder tab navigation):

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

Create `apps/mobile/app/(tabs)/index.tsx` (placeholder):

```tsx
import { View, Text } from 'react-native';
import { useGroups } from '@splitbliz/core';

export default function HomeScreen() {
  const { data, isLoading } = useGroups();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home — {isLoading ? 'Loading...' : `${data?.length ?? 0} groups`}</Text>
    </View>
  );
}
```

> **Note:** The `useGroups` import on the home screen is a smoke test — it confirms `@splitbliz/core` hooks work in React Native before building real UI.

---

### Step 3.8 — Create mobile iconography

Create `apps/mobile/src/constants/iconography.ts` — mirrors web version but uses `lucide-react-native`:

```typescript
import { Receipt, Check, PenLine, Users, LogOut, CreditCard, Clock, X } from 'lucide-react-native';

// Mirror the same keys as web iconography but with RN-compatible components
export const GROUP_ACTIVITY_ICON_MAP = {
  EXPENSE: { Icon: Receipt, color: '#6c5ce7', bg: '#ede9ff' },
  SETTLE: { Icon: Check, color: '#0f6e56', bg: '#e1f5ee' },
  EDIT: { Icon: PenLine, color: '#e28a11', bg: '#faeeda' },
  JOIN: { Icon: Users, color: '#2c74c9', bg: '#e6f1fb' },
  LEAVE: { Icon: LogOut, color: '#e24b4a', bg: '#fceaea' },
};

// Note: No className strings — use color/size props directly on RN Icon components
// Usage: <Icon.Icon color={Icon.color} size={18} />
```

---

### Phase 3 Validation Checklist

```bash
# From apps/mobile
npx expo start

# Test on device or emulator
# Press 'i' for iOS simulator, 'a' for Android emulator
```

Verify:
- [ ] App launches without crash
- [ ] No import errors from `@splitbliz/core`
- [ ] Home screen shows "Loading..." then group count (or 0 if not logged in)
- [ ] No TypeScript errors: `npx tsc --noEmit`

---

## Phase 4 — Build Mobile Screens

> **Goal:** Build all feature screens using hooks and services from `@splitbliz/core`.
> **Rule:** Build in this order — auth first (nothing else works without it), then home, then features.

---

### Screen build order

| Priority | Screen | Core hook used | Notes |
|----------|--------|----------------|-------|
| 1 | Login / Sign up | `authService`, `tokenStore` | Must complete first |
| 2 | Google OAuth callback | `authService.loginGoogle()` | Use Expo AuthSession |
| 3 | Profile setup | `authService.updateProfile()` | Post-signup step |
| 4 | Home | `useGroups`, `useMqttConnection` | Main screen |
| 5 | Group detail | `useGroupDetail`, `useGroupMqtt` | Core feature |
| 6 | Add expense | `useExpenseMutations` | Core feature |
| 7 | Expense detail | `useExpenses` | Core feature |
| 8 | Settle up | `useSettlementMutations` | Core feature |
| 9 | Group chat | `useGroupMqtt`, `engagementService` | Real-time |
| 10 | Notifications | `useNotifications` | Informational |
| 11 | Profile settings | `useProfileMutations` | Settings |
| 12 | AI insights | `aiInsightsService`, `aiService` | Enhancement |

---

### Phase 4 conventions to follow

**Every screen follows this pattern:**

```tsx
// apps/mobile/app/(tabs)/groups/[groupId].tsx

import { View, FlatList, Text } from 'react-native';
import { useGroupDetail } from '@splitbliz/core';    // ← from core
import { ExpenseRow } from '../../../components/ExpenseRow'; // ← mobile UI component

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data, isLoading } = useGroupDetail(groupId);   // ← same hook as web

  if (isLoading) return <LoadingScreen />;

  return (
    <FlatList
      data={data?.expenses}
      renderItem={({ item }) => <ExpenseRow expense={item} />}
    />
  );
}
```

**Key rule:** Hooks and services come from `@splitbliz/core`. Only the JSX/StyleSheet is mobile-specific.

---

### Auth screen implementation notes

The auth flow requires special handling for the token loading race condition:

```tsx
// apps/mobile/app/(auth)/login.tsx

import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { authService } from '@splitbliz/core';
import { useRouter } from 'expo-router';

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
    } catch (e) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />
      {error && <Text>{error}</Text>}
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} />
    </View>
  );
}
```

---

### MQTT in mobile

`useMqttConnection` and `useGroupMqtt` from `@splitbliz/core` work identically in React Native because Paho uses WebSocket which React Native supports natively. No changes needed — just call the hooks the same way as web.

---

## Appendix — Common issues and fixes

### Issue: `sessionStorage is not defined` at runtime in mobile
**Cause:** `bootstrap.ts` was not imported before core is used.
**Fix:** Ensure `import '../src/bootstrap'` is the first import in `app/_layout.tsx`.

### Issue: `window is not defined` in mobile
**Cause:** A service file still references `window` directly.
**Fix:** Grep for `window.` in `packages/core/src/` and replace with the appropriate abstraction.

### Issue: TypeScript errors after moving files to `packages/core`
**Cause:** Relative imports inside core files still point to `../types` etc.
**Fix:** All imports within `packages/core/src/` should use relative paths (`../types`, `../services/apiClient`). Only `apps/web` and `apps/mobile` use the `@splitbliz/core` package import.

### Issue: `import.meta.env` errors in `packages/core`
**Cause:** A service file still uses `import.meta.env.VITE_*` directly.
**Fix:** All env vars must be injected via the configure pattern (Phase 1 fixes). Grep for `import.meta.env` in `packages/core/src/` — there should be zero occurrences after Phase 1.

### Issue: Monorepo `npm install` fails
**Fix:** Ensure root `package.json` has `"workspaces": ["apps/*", "packages/*"]` and all sub-packages have a valid `name` field in their `package.json`.

### Issue: Hot reload not working in Expo after monorepo setup
**Fix:** Add `watchFolders` to `apps/mobile/app.config.js`:
```javascript
module.exports = {
  expo: {
    // ... other config
  },
  // Metro needs to know about the monorepo packages
};
```
And create `apps/mobile/metro.config.js`:
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const monorepoRoot = path.resolve(__dirname, '../..');

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
```

---

## Summary — estimated timeline

| Phase | Work | Estimated time |
|-------|------|----------------|
| Phase 1 — Decouple | Fix 3 service files | 2–3 hours |
| Phase 2 — Monorepo + core | Scaffold + move files + update imports | 4–6 hours |
| Phase 3 — Expo scaffold | Setup + wire core + navigation skeleton | 3–4 hours |
| Phase 4 — Mobile screens | Build all 12 screens | 3–5 days |

**Total to production-ready mobile app: ~1 week.**
