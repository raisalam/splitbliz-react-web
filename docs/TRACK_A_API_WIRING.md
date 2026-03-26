# SplitBliz Web — Track A: API Wiring
**Version 1.0 — Follows Track B (UI Polish) completion**
**Status: Hand this file to your agent. Execute steps in order. Commit after each step.**

---

## The One Rule

> Track A replaces mock data with real API calls — one screen at a time.
> Never remove a mock fallback until the real call is confirmed working.
> The app must be fully functional after every single commit.
> If a real API call fails, the screen must show an error state — never a blank.

---

## Prerequisites — confirm before starting

```
□ Backend is running at http://localhost:8080
□ GET http://localhost:8080/v1/system/config returns 200
□ src/.env has VITE_API_BASE_URL=http://localhost:8080/v1
□ Track B is fully committed and app is visually clean
```

If `GET /v1/system/config` does not return 200 — stop. Backend is not ready.
Do not proceed with any step until that endpoint responds.

---

## Overview — 8 Steps

| Step | What | Time | Commits |
|---|---|---|---|
| 1 | System config check on app start | 1 hour | 1 |
| 2 | Auth — register + login + logout | half day | 2 |
| 3 | Home screen — GET /home BFF | half day | 1 |
| 4 | Group detail — GET /groups/:id/detail BFF | half day | 1 |
| 5 | Write operations — expenses + settlements | 1 day | 2 |
| 6 | Remaining read screens | half day | 1 |
| 7 | Profile + notifications | half day | 1 |
| 8 | MQTT real-time hints | 1 day | 2 |

**Total: ~5 days. 11 commits.**

---

## Step 1 — System Config on App Start

**Time: 1 hour. One commit.**

This is the smallest possible real API call. It proves your axios client,
your `.env`, and your CORS config are all working before touching auth.

### Agent prompt

**Commit: `feat: wire GET /system/config on app start`**

```
In src/app/App.tsx (or src/main.tsx — wherever the app initialises):

1. Import systemService from src/services/systemService.ts
2. On app mount, call systemService.getConfig()
3. Store the result in local state
4. If maintenance: true — show a full-screen maintenance banner instead of the app
5. Log the authProviders result to console for now (we use it in Step 2)
6. If the call fails (network error, backend down) — show a full-screen
   "Cannot connect to server. Please try again." message with a retry button

The app should still work with mock data if this call fails —
do not block the app on this call succeeding.

Example:
  useEffect(() => {
    systemService.getConfig()
      .then(config => {
        if (config.maintenance) setMaintenance(true);
        console.log('[system/config]', config.authProviders);
      })
      .catch(() => console.warn('[system/config] unreachable'));
  }, []);

Run the app. Open browser devtools Network tab.
Confirm GET http://localhost:8080/v1/system/config appears in the network log.
Confirm it returns 200 with authProviders.emailPassword: true.
```

### Step 1 verification checklist

```
□ Network tab shows GET /v1/system/config on app load
□ Response is 200 with correct shape
□ Console logs the authProviders object
□ App still loads normally if the call is commented out
```

---

## Step 2 — Auth: Register + Login + Logout

**Time: half day. Two commits.**

This is the most critical step. Every other API call depends on having
a real JWT in tokenStore. Do not skip ahead until login works end-to-end.

### Step 2A — Register

**Commit: `feat: wire POST /auth/register`**

#### Agent prompt

```
In src/features/auth/SignUp.tsx:

1. Import authService from src/services
2. Find the form submit handler (currently does nothing or uses mock)
3. Replace it with:

   const handleSubmit = async () => {
     setLoading(true);
     setError(null);
     try {
       const user = await authService.register({
         email,
         password,
         displayName,
       });
       // authService.register() already stores the JWT in tokenStore
       setUser(user);  // update UserContext
       navigate('/onboarding/profile');
     } catch (err) {
       const apiErr = extractApiError(err);
       if (apiErr?.code === 'ERR_PROVIDER_MISMATCH') {
         setError('An account with this email already exists. Try logging in.');
       } else if (apiErr?.code === 'ERR_VALIDATION') {
         setError(apiErr.details?.fields?.[0]?.message ?? 'Please check your details.');
       } else {
         setError('Registration failed. Please try again.');
       }
     } finally {
       setLoading(false);
     }
   };

4. Import extractApiError from src/services/apiClient
5. Import useUser from src/providers/UserContext
6. Import useNavigate from react-router-dom

Show error message below the form when error is not null.
Disable the submit button while loading is true.

Test: fill in the form and submit. Check Network tab for POST /v1/auth/register.
Confirm 201 response. Confirm JWT is stored: tokenStore.get() in console should return a string.
```

---

### Step 2B — Login + Logout

**Commit: `feat: wire POST /auth/login and POST /auth/logout`**

#### Agent prompt

```
In src/features/auth/Login.tsx:

1. Import authService, extractApiError from services
2. Import useUser from UserContext
3. Import useNavigate from react-router-dom
4. Replace the submit handler with:

   const handleLogin = async () => {
     setLoading(true);
     setError(null);
     try {
       const user = await authService.loginEmail({ email, password });
       setUser(user);
       navigate('/');
     } catch (err) {
       const apiErr = extractApiError(err);
       if (apiErr?.code === 'ERR_UNAUTHENTICATED') {
         setError('Incorrect email or password.');
       } else if (apiErr?.code === 'ERR_ACCOUNT_LOCKED_TEMP') {
         const seconds = apiErr.details?.retryAfterSeconds ?? 900;
         const minutes = Math.ceil(seconds / 60);
         setError(`Too many attempts. Try again in ${minutes} minutes.`);
       } else if (apiErr?.code === 'ERR_ACCOUNT_SUSPENDED') {
         setError('Your account has been suspended. Contact support.');
       } else {
         setError('Login failed. Please try again.');
       }
     } finally {
       setLoading(false);
     }
   };

Show error below the form. Disable button while loading.

In src/features/profile/ProfileSettings.tsx (or its AccountActionsSection sub-component):

Replace the logout button handler with:
   const handleLogout = async () => {
     await authService.logout();
     // authService.logout() clears tokenStore automatically
     setUser(null);
     navigate('/login');
   };

Also update src/app/ProtectedRoute.tsx — after logout, the redirect to /login
should work automatically because tokenStore.get() will return null.

Test login:
  - Enter wrong password → confirm error message shows
  - Enter correct credentials → confirm redirect to /
  - Open DevTools → Application → sessionStorage → confirm sb_access_token exists
  - Confirm Network tab shows Authorization: Bearer <token> on the next API call

Test logout:
  - Click logout → confirm redirect to /login
  - Confirm sessionStorage sb_access_token is cleared
  - Confirm hitting / redirects back to /login (ProtectedRoute working)
```

### Step 2 verification checklist

```
□ POST /v1/auth/register returns 201 with user object
□ POST /v1/auth/login returns 200 with user object
□ JWT appears in sessionStorage as sb_access_token after login
□ Every subsequent request has Authorization: Bearer <token> header in Network tab
□ Wrong password shows correct error message
□ Account locked error shows minutes remaining
□ POST /v1/auth/logout is called on logout
□ sessionStorage is cleared after logout
□ ProtectedRoute redirects to /login after logout
□ ProtectedRoute allows through after login
□ UserContext has the real user object after login
□ Profile screen shows real displayName — not hardcoded 'Rais'
```

---

## Step 3 — Home Screen

**Time: half day. One commit.**

### Agent prompt

**Commit: `feat: wire GET /home BFF — replace mock data on home screen`**

```
In src/hooks/useGroups.ts:

Remove the mock fallback entirely. Replace with clean React Query:

  import { useQuery } from '@tanstack/react-query';
  import { groupsService } from '../services';

  export function useHomeData() {
    return useQuery({
      queryKey: ['home'],
      queryFn: () => groupsService.getHomeData(),
    });
  }

In src/features/home/Home.tsx:

1. The hook already returns { data, isLoading, error } from React Query
2. Confirm isLoading shows the skeleton (wired in Track B Step 4)
3. Confirm error state shows something useful — add if missing:
   if (error) return (
     <div className="p-6 text-center">
       <p style={{ color: colors.textMuted }}>Failed to load. Pull to refresh.</p>
     </div>
   );
4. Confirm data?.groups renders the real GroupCard list
5. Confirm data?.actionItemsPreview.totalCount drives the notification badge count

IMPORTANT — groupType to emoji:
The real API sends groupType: "TRIP" not iconEmoji.
Find any place in GroupCard.tsx or GroupListItem.tsx that reads group.iconEmoji
and replace with:
  import { GROUP_TYPE_EMOJI } from '../../../constants/app';
  const emoji = GROUP_TYPE_EMOJI[group.groupType] ?? GROUP_TYPE_EMOJI['OTHER'];

Test:
  - Confirm Network tab shows GET /v1/home
  - Confirm real groups from your backend appear in the list
  - Confirm skeleton shows briefly before data loads
  - Confirm empty state shows if you have no groups yet
  - Confirm group emoji derives from groupType correctly
```

### Step 3 verification checklist

```
□ GET /v1/home appears in Network tab
□ Real groups from backend render on home screen
□ Group emoji comes from GROUP_TYPE_EMOJI map — not from API response
□ Skeleton shows during load
□ Empty state shows if no groups exist
□ Error message shows if backend is stopped
□ actionItemsPreview.totalCount shows on notification bell badge
□ No MOCK_ import remains in Home.tsx or its sub-components
```

---

## Step 4 — Group Detail Screen

**Time: half day. One commit.**

### Agent prompt

**Commit: `feat: wire GET /groups/:id/detail BFF — replace mock data on group detail`**

```
In src/hooks/useGroupDetail.ts:

Remove mock fallback. Already clean from Track B Step 6C — confirm it looks like:
  export function useGroupDetail(groupId: string) {
    return useQuery({
      queryKey: ['group', groupId],
      queryFn: () => groupsService.getGroupDetail(groupId),
      enabled: !!groupId,
    });
  }

In src/features/groups/GroupDetail.tsx:

1. The hook returns data as GroupDetailData — destructure:
   const { data, isLoading, error } = useGroupDetail(groupId);
   const { group, members, expenses, balances, settlements } = data ?? {};

2. Confirm groupId comes from useParams():
   const { groupId } = useParams<{ groupId: string }>();

3. Wire isLoading → skeleton (already done in Track B)
4. Wire error → error message
5. Fix the groupType → emoji mapping in GroupHeader if not already done in Step 3

6. For monetary display — use formatCurrency from src/utils/formatCurrency.ts:
   Find every place showing an amount and replace:
     "₹450.00"  or  `₹${expense.amount}`
   With:
     formatCurrency(expense.amount, group.currencyCode)

7. Confirm myRole from group object drives UI permissions:
   - Only OWNER/ADMIN sees the settings icon
   - Only OWNER sees danger zone actions
   - MEMBER sees read-only view

8. The pairwise balances tab — BalanceSummaryCard uses balances array.
   Confirm it uses formatBalance from src/utils/formatCurrency.ts for
   positive (green) / negative (red) display.

Test with a real groupId from your backend:
  Navigate to /group/<real-id>
  Confirm all tabs load real data: Expenses, Members/Balances, Settlements
  Confirm amounts display with correct currency symbol
  Confirm member avatars show (resolvedAvatar URL, emoji, or initials fallback)
```

### Step 4 verification checklist

```
□ GET /v1/groups/:id/detail appears in Network tab
□ Real expenses render in expenses tab
□ Real members render in members tab
□ Real balances render with correct sign and color
□ Real settlements render in settlements tab
□ formatCurrency used for all monetary display — no hardcoded ₹ prefix
□ myRole drives UI permissions correctly
□ Skeleton shows during load
□ Error state shows if groupId is invalid
□ No MOCK_ import remains in GroupDetail.tsx or its sub-components
```

---

## Step 5 — Write Operations

**Time: 1 day. Two commits.**

### Step 5A — Create Expense

**Commit: `feat: wire POST /groups/:id/expenses — AddExpense form`**

#### Agent prompt

```
In src/features/expenses/AddExpense.tsx:

The form currently has a submit handler that uses mock data or does nothing.
Replace with:

  import { expensesService } from '../../services';
  import { extractApiError } from '../../services/apiClient';
  import { useQueryClient } from '@tanstack/react-query';

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await expensesService.createExpense(groupId, {
        title,
        amount,           // already a string from the form input
        currencyCode: group.currencyCode,
        category,
        expenseDate,      // YYYY-MM-DD string
        splitType,
        payers: payers.map(p => ({ userId: p.userId, paidAmount: p.paidAmount })),
        splits: splits.map(s => ({ userId: s.userId, splitAmount: s.splitAmount })),
        notes: notes || undefined,
      });

      // Invalidate group detail cache — triggers re-fetch
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });

      navigate(`/group/${groupId}`);
    } catch (err) {
      const apiErr = extractApiError(err);
      if (apiErr?.code === 'ERR_SPLIT_MISMATCH') {
        setError('Split amounts do not add up to the total.');
      } else if (apiErr?.code === 'ERR_PAYMENT_SUM_MISMATCH') {
        setError('Payer amounts do not add up to the total.');
      } else if (apiErr?.code === 'ERR_INVALID_AMOUNT') {
        setError('Amount must be greater than zero.');
      } else if (apiErr?.code === 'ERR_PAYER_NOT_SPLITTER') {
        setError('Every payer must also be in the split.');
      } else {
        setError('Failed to create expense. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

CRITICAL — amount handling:
  The form input is a string (e.g. "1500").
  The API expects a decimal string with 2 places: "1500.00"
  Before submitting, format it:
    const formattedAmount = parseFloat(amount).toFixed(2);
  Use formattedAmount in the request body, not the raw input string.
  This is the ONLY place parseFloat is acceptable — for formatting input, not arithmetic.

CRITICAL — split math validation (client-side, before submit):
  The sum of all split amounts must equal the total amount.
  Validate before calling the API:
    const splitTotal = splits.reduce((sum, s) => sum + parseFloat(s.splitAmount), 0);
    const total = parseFloat(amount);
    if (Math.abs(splitTotal - total) > 0.01) {
      setError('Split amounts must equal the total.');
      return;
    }

Test:
  Create a real expense. Confirm it appears in GroupDetail after navigation.
  Try submitting with mismatched splits — confirm error shows before API call.
```

---

### Step 5B — Create Settlement + Approve/Reject

**Commit: `feat: wire POST /groups/:id/settlements and approve/reject`**

#### Agent prompt

```
In src/features/settlements/SettleUp.tsx:

Replace submit handler with:

  import { settlementsService } from '../../services';
  import { extractApiError } from '../../services/apiClient';
  import { useQueryClient } from '@tanstack/react-query';

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await settlementsService.createSettlement(groupId, {
        toUserId: selectedMember.userId,
        amount: parseFloat(amount).toFixed(2),
        currencyCode: group.currencyCode,
        paymentMethod: paymentMethod || undefined,
        notes: notes || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
      navigate(`/group/${groupId}`);
    } catch (err) {
      const apiErr = extractApiError(err);
      if (apiErr?.code === 'ERR_PENDING_SETTLEMENT') {
        setError('A pending settlement already exists with this person. Resolve it first.');
      } else if (apiErr?.code === 'ERR_SETTLEMENT_EXCEEDS_DEBT') {
        setError('Amount cannot exceed what is owed.');
      } else if (apiErr?.code === 'ERR_SELF_SETTLEMENT') {
        setError('You cannot settle with yourself.');
      } else {
        setError('Failed to send settlement. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

In src/components/PendingApprovalsSheet.tsx:

Wire the Approve and Reject buttons:

  const handleApprove = async (settlementId: string) => {
    try {
      await settlementsService.approveSettlement(settlementId);
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    } catch (err) {
      const apiErr = extractApiError(err);
      if (apiErr?.code === 'ERR_ALREADY_PROCESSING') {
        showToast('Settlement is already being processed.');
      } else {
        showToast('Failed to approve. Please try again.');
      }
    }
  };

  const handleReject = async (settlementId: string) => {
    try {
      await settlementsService.rejectSettlement(settlementId);
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    } catch (err) {
      showToast('Failed to reject. Please try again.');
    }
  };

For showToast — use the sonner toast from src/components/ui/sonner.tsx:
  import { toast } from 'sonner';
  toast.error('message here');
  toast.success('message here');

Test:
  Send a settlement request. Confirm it appears in GroupDetail settlements tab.
  Approve it from a second account. Confirm status changes to APPROVED.
```

### Step 5 verification checklist

```
□ POST /v1/groups/:id/expenses called on expense submit
□ Expense appears in GroupDetail immediately after creation (cache invalidated)
□ Split mismatch error shows before API call — client-side validation works
□ Amount is formatted as "1500.00" decimal string in request body
□ Idempotency-Key header present on POST /expenses (check Network tab request headers)
□ POST /v1/groups/:id/settlements called on settle submit
□ Idempotency-Key header present on POST /settlements
□ ERR_PENDING_SETTLEMENT shows correct error message
□ Approve/reject buttons call correct endpoints
□ Cache invalidates after every write — group detail refreshes automatically
□ Toast shows on approve/reject errors
```

---

## Step 6 — Remaining Read Screens

**Time: half day. One commit.**

### Agent prompt

**Commit: `feat: wire read endpoints for activity, chat, whiteboard, expense detail`**

```
Wire the following screens one by one. Each follows the same pattern:
  1. Hook already exists from Track B — confirm it uses useQuery
  2. Remove any mock fallback from the service
  3. Confirm loading/error/empty states work
  4. Check Network tab for the correct endpoint

--- GroupActivity.tsx ---
Hook: useActivity(groupId) → GET /v1/groups/:id/activity
Confirm: activity entries render with actor avatar + event description
Format timestamps with:
  new Date(entry.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

--- GroupChat.tsx ---
Hook: direct call to engagementService.getMessages(groupId)
Confirm: past messages load on open
Note: real-time new messages come via MQTT in Step 8 — for now, just load history

For sending a message:
  import { v4 as uuidv4 } from 'uuid';
  const handleSend = async () => {
    const clientMessageId = uuidv4(); // generate before send
    try {
      await engagementService.sendMessage(groupId, { content, clientMessageId });
      // optimistically add to local list before refetch
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

--- GroupWhiteboard.tsx ---
Hook: direct call to engagementService.getWhiteboardItems(groupId)
Confirm: items load
Wire create/edit/delete to engagementService methods
Invalidate query after each mutation

--- ExpenseDetail.tsx ---
Currently fetches via mock. Replace with:
  const { expenseId, groupId } = useParams();
  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', groupId, expenseId],
    queryFn: () => expensesService.getExpense(groupId!, expenseId!),
    enabled: !!groupId && !!expenseId,
  });
Wire the Edit and Delete buttons:
  Edit → expensesService.updateExpense() → invalidate ['group', groupId]
  Delete → expensesService.deleteExpense() → invalidate ['group', groupId] → navigate back
```

### Step 6 verification checklist

```
□ GET /v1/groups/:id/activity appears in Network tab when visiting activity screen
□ GET /v1/groups/:id/messages appears when visiting chat
□ GET /v1/groups/:id/whiteboard appears when visiting whiteboard
□ GET /v1/groups/:id/expenses/:expenseId appears when visiting expense detail
□ Sending a chat message calls POST /v1/groups/:id/messages
□ clientMessageId is a fresh UUID v4 on every send
□ Whiteboard CRUD all works
□ Expense edit and delete work and refresh group detail
```

---

## Step 7 — Profile + Notifications

**Time: half day. One commit.**

### Agent prompt

**Commit: `feat: wire profile PATCH and notifications endpoints`**

```
--- ProfileSettings.tsx ---

The user data already comes from UserContext (wired in Track B Step 6B).
Now wire the save actions:

Update display name:
  const handleSaveProfile = async () => {
    try {
      const updated = await authService.updateProfile({ displayName });
      setUser(updated);  // update UserContext
      toast.success('Profile updated.');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

Update notification settings:
  const handleToggleNotification = async (key: string, value: boolean) => {
    try {
      const updated = await authService.updateSettings({
        notifications: { [key]: value }
      });
      setUser(updated);
    } catch (err) {
      toast.error('Failed to save setting.');
    }
  };

Update preferences (currency, dark mode):
  const handlePreferenceChange = async (key: string, value: unknown) => {
    try {
      const updated = await authService.updateSettings({
        preferences: { [key]: value }
      });
      setUser(updated);
    } catch (err) {
      toast.error('Failed to save preference.');
    }
  };

Avatar upload (if your UI has it):
  Wire to PATCH /users/me with resolvedAvatar — for emoji picker just send the emoji string.
  For photo upload — use MinIO pre-signed URL flow (defer to Phase 2 if complex).

--- Notifications.tsx ---

Replace mock array with real data:
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
  });

Wire mark as read on tap:
  const handleNotificationTap = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationsService.markAsRead(notification.id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['home'] }); // refreshes unread count
    }
    // navigate based on notification type
    if (notification.groupId) navigate(`/group/${notification.groupId}`);
  };

Wire mark all as read button:
  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['home'] });
  };

The unread count badge on the bell icon in HomeHeader comes from:
  const { user } = useUser();
  user.unreadNotificationCount  // re-fetched from /home or /auth/me

Test:
  Confirm notifications list loads from API.
  Tap a notification — confirm it marks as read and navigates correctly.
  Confirm unread badge count decrements after reading.
```

### Step 7 verification checklist

```
□ PATCH /v1/users/me called when saving profile
□ UserContext updates immediately after profile save — no stale name
□ Notification toggles call PATCH /v1/users/me/settings
□ GET /v1/notifications appears in Network tab
□ Tapping a notification calls PATCH /v1/notifications/:id/read
□ Unread badge count updates after reading notifications
□ Mark all read button works
```

---

## Step 8 — MQTT Real-Time Hints

**Time: 1 day. Two commits.**

This is the final step. MQTT makes the app feel live — when another user
adds an expense or approves a settlement, your screen updates automatically
without a manual refresh.

The backend publishes hints to these topics (Backend Architecture §12):
```
splitbliz/users/{userId}/hints       ← your personal hints
splitbliz/groups/{groupId}/hints     ← group-level hints
splitbliz/groups/{groupId}/messages  ← real-time chat messages
```

Hint payload carries NO financial data — only:
```json
{ "type": "BALANCE_UPDATED", "groupId": "...", "correlationId": "..." }
```

When a hint arrives → call `queryClient.invalidateQueries()` for the
relevant query key → React Query re-fetches → screen updates.

---

### Step 8A — MQTT Client Setup

**Commit: `feat: add MQTT client service with Eclipse Paho`**

#### Agent prompt

```
Install Eclipse Paho MQTT client:
npm install paho-mqtt
npm install -D @types/paho-mqtt

Create src/services/mqttService.ts with this content:

import Paho from 'paho-mqtt';
import { MqttHint, MqttChatMessage } from '../types';
import { MQTT_TOPICS } from '../constants/app';

type HintHandler = (hint: MqttHint) => void;
type ChatHandler = (message: MqttChatMessage) => void;

class MqttService {
  private client: Paho.Client | null = null;
  private hintHandlers: Set<HintHandler> = new Set();
  private chatHandlers: Map<string, Set<ChatHandler>> = new Map();
  private subscribedTopics: Set<string> = new Set();

  connect(userId: string): void {
    const url = import.meta.env.VITE_MQTT_URL ?? 'ws://localhost:8083/mqtt';
    const clientId = `web_${userId}_${Date.now()}`;

    this.client = new Paho.Client(url, clientId);

    this.client.onMessageArrived = (message) => {
      this.handleMessage(message);
    };

    this.client.onConnectionLost = (response) => {
      if (response.errorCode !== 0) {
        console.warn('[MQTT] Connection lost:', response.errorMessage);
        // Reconnect after 3 seconds
        setTimeout(() => this.connect(userId), 3000);
      }
    };

    this.client.connect({
      useSSL: url.startsWith('wss'),
      onSuccess: () => {
        console.log('[MQTT] Connected');
        this.subscribe(MQTT_TOPICS.userHints(userId));
      },
      onFailure: (err) => {
        console.warn('[MQTT] Connection failed:', err.errorMessage);
      },
    });
  }

  subscribe(topic: string): void {
    if (!this.client?.isConnected() || this.subscribedTopics.has(topic)) return;
    this.client.subscribe(topic, { qos: 0 });
    this.subscribedTopics.add(topic);
    console.log('[MQTT] Subscribed:', topic);
  }

  subscribeToGroup(groupId: string): void {
    this.subscribe(MQTT_TOPICS.groupHints(groupId));
    this.subscribe(MQTT_TOPICS.groupMessages(groupId));
  }

  unsubscribeFromGroup(groupId: string): void {
    const hintTopic = MQTT_TOPICS.groupHints(groupId);
    const chatTopic = MQTT_TOPICS.groupMessages(groupId);
    if (this.client?.isConnected()) {
      this.client.unsubscribe(hintTopic);
      this.client.unsubscribe(chatTopic);
    }
    this.subscribedTopics.delete(hintTopic);
    this.subscribedTopics.delete(chatTopic);
  }

  onHint(handler: HintHandler): () => void {
    this.hintHandlers.add(handler);
    return () => this.hintHandlers.delete(handler);
  }

  onChatMessage(groupId: string, handler: ChatHandler): () => void {
    if (!this.chatHandlers.has(groupId)) {
      this.chatHandlers.set(groupId, new Set());
    }
    this.chatHandlers.get(groupId)!.add(handler);
    return () => this.chatHandlers.get(groupId)?.delete(handler);
  }

  disconnect(): void {
    if (this.client?.isConnected()) {
      this.client.disconnect();
    }
    this.subscribedTopics.clear();
  }

  private handleMessage(message: Paho.Message): void {
    try {
      const payload = JSON.parse(message.payloadString);
      const topic = message.destinationName;

      if (topic.endsWith('/hints')) {
        this.hintHandlers.forEach(h => h(payload as MqttHint));
      } else if (topic.endsWith('/messages')) {
        const groupId = topic.split('/')[2];
        this.chatHandlers.get(groupId)?.forEach(h => h(payload as MqttChatMessage));
      }
    } catch (e) {
      console.warn('[MQTT] Failed to parse message:', e);
    }
  }
}

export const mqttService = new MqttService();

Add mqttService to src/services/index.ts barrel export.

Also update .env — add the local MQTT WebSocket URL:
VITE_MQTT_URL=ws://localhost:8083/mqtt

Note: EMQX default WebSocket port is 8083.
Confirm with your backend team what port EMQX is exposing WebSocket on locally.
```

---

### Step 8B — Wire MQTT into the app

**Commit: `feat: wire MQTT hints to React Query invalidation`**

#### Agent prompt

```
Create src/hooks/useMqtt.ts:

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mqttService } from '../services/mqttService';
import { useUser } from '../providers/UserContext';
import { MqttHint } from '../types';

export function useMqttConnection() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Connect on login
    mqttService.connect(user.id);

    // Global hint handler — invalidates the right query per hint type
    const unsubscribe = mqttService.onHint((hint: MqttHint) => {
      console.log('[MQTT hint]', hint);
      switch (hint.type) {
        case 'BALANCE_UPDATED':
        case 'EXPENSE_ADDED':
        case 'SETTLEMENT_UPDATED':
        case 'MEMBER_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['group', hint.groupId] });
          queryClient.invalidateQueries({ queryKey: ['home'] });
          break;
      }
    });

    return () => {
      unsubscribe();
      mqttService.disconnect();
    };
  }, [user?.id]);
}

Create src/hooks/useGroupMqtt.ts:

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mqttService } from '../services/mqttService';
import { MqttChatMessage } from '../types';

export function useGroupMqtt(groupId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;

    // Subscribe to group topics when entering a group screen
    mqttService.subscribeToGroup(groupId);

    // Real-time chat — append new message to query cache
    const unsubscribeChat = mqttService.onChatMessage(groupId, (msg: MqttChatMessage) => {
      queryClient.setQueryData(
        ['messages', groupId],
        (old: any) => {
          if (!old) return old;
          // Deduplicate by clientMessageId (handles echo of own messages)
          const exists = old.messages?.some(
            (m: MqttChatMessage) => m.clientMessageId === msg.clientMessageId
          );
          if (exists) return old;
          return { ...old, messages: [...(old.messages ?? []), msg] };
        }
      );
    });

    return () => {
      unsubscribeChat();
      mqttService.unsubscribeFromGroup(groupId);
    };
  }, [groupId]);
}

Wire useMqttConnection into src/app/App.tsx or src/app/Root.tsx:
  Add at the top level — called once after login, persists for the session.
  import { useMqttConnection } from '../hooks/useMqtt';
  function AppInner() {
    useMqttConnection();
    return <Outlet />;
  }

Wire useGroupMqtt into GroupDetail.tsx and GroupChat.tsx:
  const { groupId } = useParams();
  useGroupMqtt(groupId!);

This subscribes to group topics when the user opens a group screen
and unsubscribes when they leave.

Test (requires two browser tabs logged in as different users):
  Tab 1: open /group/:id
  Tab 2: add an expense to the same group
  Tab 1: confirm the expense appears without a manual refresh
  Tab 1: open chat, Tab 2: send a message → confirm it appears in Tab 1 instantly
```

### Step 8 verification checklist

```
□ MQTT connects on login — console shows [MQTT] Connected
□ Console shows [MQTT] Subscribed: splitbliz/users/:id/hints after login
□ Console shows [MQTT] Subscribed: splitbliz/groups/:id/hints when opening a group
□ Adding expense in Tab 2 triggers automatic refresh in Tab 1
□ Chat message from Tab 2 appears instantly in Tab 1
□ clientMessageId deduplication works — own messages don't appear twice
□ MQTT reconnects after a dropped connection (stop/start EMQX locally)
□ Disconnects cleanly on logout
□ No financial data visible in MQTT payloads (check console logs)
```

---

## Final Track A Verification Checklist

Run through this before declaring Track A complete:

```
□ GET /v1/system/config called on app start
□ POST /v1/auth/register works end-to-end
□ POST /v1/auth/login works — JWT stored in sessionStorage
□ Every authenticated request has Authorization: Bearer <token> header
□ POST /v1/auth/logout clears token — ProtectedRoute redirects to /login
□ GET /v1/home drives the home screen — no MOCK_ imports in home feature
□ GET /v1/groups/:id/detail drives group detail — no MOCK_ imports in groups feature
□ POST /v1/groups/:id/expenses creates expense — Idempotency-Key header present
□ POST /v1/groups/:id/settlements creates settlement — Idempotency-Key header present
□ Approve/reject settlement endpoints wired and working
□ All monetary values displayed via formatCurrency() — no hardcoded ₹ prefix
□ groupType → emoji via GROUP_TYPE_EMOJI map — never from API response
□ GET /v1/groups/:id/activity, /messages, /whiteboard all wired
□ GET /v1/notifications wired — mark as read works
□ PATCH /v1/users/me saves profile changes
□ MQTT connects on login, subscribes to user hints
□ MQTT group hints trigger automatic React Query invalidation
□ Real-time chat works via MQTT
□ No MOCK_ import remains anywhere in src/features/
   (run: grep -rn 'MOCK_' src/features --include="*.tsx" --include="*.ts")
□ grep result above shows 0 matches
□ All error codes handled with user-friendly messages — no raw "ERR_" strings shown
□ Skeleton shows on every screen during real network load
□ Empty state shows correctly on screens with no data
```

---

## What Comes Next — After Track A

With both tracks complete, the app is production-grade architecture with real data.
The remaining work before launch:

**Immediate (required for launch):**
- Google OAuth and Facebook OAuth (add to Login screen — backend already supports)
- Receipt upload flow via MinIO pre-signed URLs
- Push notifications — register FCM token via `notificationsService.registerFcmToken()`
- End-to-end testing of the full settlement flow with two real accounts
- CORS configuration for production domain

**Before production deployment:**
- Move from sessionStorage to a more secure token store
- Add Sentry or equivalent error reporting (replace `console.error` in ErrorBoundary)
- Environment-specific configs for staging vs production
- CSP headers on the Vite build

**React Native mobile (separate repo):**
- Copy `src/types/index.ts` → identical, no changes needed
- Copy `src/constants/` → identical, no changes needed
- Re-implement `src/services/` with React Native compatible HTTP client
- Re-implement MQTT with React Native compatible Paho or alternative
- The business logic, types, and constants are identical — only the rendering layer differs

---

*SplitBliz Frontend — Track A: API Wiring v1.0*
*Follows Track B (UI Polish) completion.*
*After this track: the app runs on real data with real-time updates.*
