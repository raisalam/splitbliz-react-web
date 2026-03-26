# SplitBliz React Web Audit

Audit date: 2026-03-26  
Scope: `src/` only (no `node_modules`)

---

## 1. Folder Structure — 🔴 Critical

**Current tree (src/, max 3 levels)**
```
src/
  api/
    groups.ts
  app/
    App.tsx
    routes.tsx
    components/
      AddExpense.tsx
      CreateGroup.tsx
      ExpenseDetail.tsx
      FirstGroup.tsx
      GroupActivity.tsx
      GroupAI.tsx
      GroupChat.tsx
      GroupDetail.tsx
      GroupSettings.tsx
      GroupWhiteboard.tsx
      Home.tsx
      Login.tsx
      Notifications.tsx
      ProfileSettings.tsx
      ProfileSetup.tsx
      Root.tsx
      SettleUp.tsx
      SignUp.tsx
      Splash.tsx
      ThemeProvider.tsx
      ThemeToggle.tsx
      figma/
        ImageWithFallback.tsx
      ui/
        accordion.tsx
        alert-dialog.tsx
        alert.tsx
        aspect-ratio.tsx
        avatar.tsx
        badge.tsx
        breadcrumb.tsx
        button.tsx
        calendar.tsx
        card.tsx
        carousel.tsx
        chart.tsx
        checkbox.tsx
        collapsible.tsx
        command.tsx
        context-menu.tsx
        dialog.tsx
        drawer.tsx
        dropdown-menu.tsx
        form.tsx
        GroupAvatar.tsx
        GroupListItem.tsx
        hover-card.tsx
        input-otp.tsx
        input.tsx
        InviteMemberSheet.tsx
        label.tsx
        menubar.tsx
        navigation-menu.tsx
        pagination.tsx
        PendingApprovalsSheet.tsx
        popover.tsx
        progress.tsx
        radio-group.tsx
        resizable.tsx
        scroll-area.tsx
        select.tsx
        separator.tsx
        sheet.tsx
        sidebar.tsx
        skeleton.tsx
        slider.tsx
        sonner.tsx
        switch.tsx
        table.tsx
        tabs.tsx
        textarea.tsx
        toggle-group.tsx
        toggle.tsx
        tooltip.tsx
        use-mobile.ts
        utils.ts
  imports/
  mock/
    balances.ts
    expenses.ts
    groups.ts
    members.ts
    settlements.ts
  styles/
    fonts.css
    index.css
    tailwind.css
    theme.css
  utils/
    expenseCalculator.ts
  main.tsx
```

**Flags**
- Flat structure in `src/app/components/` mixes page-level screens and reusable UI; missing `pages/`, `layouts/`, `features/`, `providers/`, or `constants/` structure.
- `src/imports/` is empty (unused folder).
- `src/api/` contains only mock-driven functions; no base client or versioned API layers.
- `src/mock/` is used broadly in runtime UI (not confined to dev/demo).

---

## 2. Component Inventory — 🟡 Needs Work

**Legend:** `[REUSABLE] [PAGE-LEVEL] [DUPLICATE] [NEEDS SPLIT]`

| Component | Tags | Notes |
| --- | --- | --- |
| AddExpense | [PAGE-LEVEL][NEEDS SPLIT] | Large form + calculation + sheets + mock integration. |
| CreateGroup | [PAGE-LEVEL][NEEDS SPLIT] | Large form + settings + member list + emoji picker. |
| ExpenseDetail | [PAGE-LEVEL][NEEDS SPLIT] | Fetch + permissions + multiple sheets + detail UI. |
| FirstGroup | [PAGE-LEVEL] | Onboarding screen. |
| GroupActivity | [PAGE-LEVEL] | Activity timeline. |
| GroupAI | [PAGE-LEVEL][NEEDS SPLIT] | Analytics + charts + AI chat + mock generator. |
| GroupChat | [PAGE-LEVEL] | Chat view + mock message builder. |
| GroupDetail | [PAGE-LEVEL][NEEDS SPLIT] | Data fetch + multiple tabs + sheets + actions. |
| GroupSettings | [PAGE-LEVEL][NEEDS SPLIT] | Settings + members + multiple sheets + controls. |
| GroupWhiteboard | [PAGE-LEVEL][NEEDS SPLIT] | Board + filters + edit/add sheets. |
| Home | [PAGE-LEVEL][NEEDS SPLIT] | Dashboard + insight bar + actions + FAB + sheets. |
| Login | [PAGE-LEVEL] | Auth form. |
| Notifications | [PAGE-LEVEL] | Notification list. |
| ProfileSettings | [PAGE-LEVEL][NEEDS SPLIT] | Settings + multiple sheets + account actions. |
| ProfileSetup | [PAGE-LEVEL] | Onboarding screen. |
| Root | [REUSABLE] | App layout + Toaster. |
| SettleUp | [PAGE-LEVEL][NEEDS SPLIT] | Flow + validation + confirmations. |
| SignUp | [PAGE-LEVEL] | Auth form. |
| Splash | [PAGE-LEVEL] | Landing/splash screen. |
| ThemeProvider | [REUSABLE] | Theme context provider. |
| ThemeToggle | [REUSABLE] | UI toggle. |
| figma/ImageWithFallback | [REUSABLE] | Image fallback helper. |
| ui/accordion | [REUSABLE] | Shadcn UI. |
| ui/alert-dialog | [REUSABLE] | Shadcn UI. |
| ui/alert | [REUSABLE] | Shadcn UI. |
| ui/aspect-ratio | [REUSABLE] | Shadcn UI. |
| ui/avatar | [REUSABLE] | Shadcn UI. |
| ui/badge | [REUSABLE] | Shadcn UI. |
| ui/breadcrumb | [REUSABLE] | Shadcn UI. |
| ui/button | [REUSABLE] | Shadcn UI. |
| ui/calendar | [REUSABLE] | Shadcn UI. |
| ui/card | [REUSABLE] | Shadcn UI. |
| ui/carousel | [REUSABLE] | Shadcn UI. |
| ui/chart | [REUSABLE] | Shadcn UI. |
| ui/checkbox | [REUSABLE] | Shadcn UI. |
| ui/collapsible | [REUSABLE] | Shadcn UI. |
| ui/command | [REUSABLE] | Shadcn UI. |
| ui/context-menu | [REUSABLE] | Shadcn UI. |
| ui/dialog | [REUSABLE] | Shadcn UI. |
| ui/drawer | [REUSABLE] | Shadcn UI. |
| ui/dropdown-menu | [REUSABLE] | Shadcn UI. |
| ui/form | [REUSABLE] | Shadcn UI. |
| ui/GroupAvatar | [REUSABLE] | App-specific reusable. |
| ui/GroupListItem | [REUSABLE] | App-specific reusable. |
| ui/hover-card | [REUSABLE] | Shadcn UI. |
| ui/input-otp | [REUSABLE] | Shadcn UI. |
| ui/input | [REUSABLE] | Shadcn UI. |
| ui/InviteMemberSheet | [REUSABLE] | Feature-specific reusable. |
| ui/label | [REUSABLE] | Shadcn UI. |
| ui/menubar | [REUSABLE] | Shadcn UI. |
| ui/navigation-menu | [REUSABLE] | Shadcn UI. |
| ui/pagination | [REUSABLE] | Shadcn UI. |
| ui/PendingApprovalsSheet | [REUSABLE] | Feature-specific reusable. |
| ui/popover | [REUSABLE] | Shadcn UI. |
| ui/progress | [REUSABLE] | Shadcn UI. |
| ui/radio-group | [REUSABLE] | Shadcn UI. |
| ui/resizable | [REUSABLE] | Shadcn UI. |
| ui/scroll-area | [REUSABLE] | Shadcn UI. |
| ui/select | [REUSABLE] | Shadcn UI. |
| ui/separator | [REUSABLE] | Shadcn UI. |
| ui/sheet | [REUSABLE] | Shadcn UI. |
| ui/sidebar | [REUSABLE] | Shadcn UI. |
| ui/skeleton | [REUSABLE] | Shadcn UI. |
| ui/slider | [REUSABLE] | Shadcn UI. |
| ui/sonner | [REUSABLE] | Shadcn UI. |
| ui/switch | [REUSABLE] | Shadcn UI. |
| ui/table | [REUSABLE] | Shadcn UI. |
| ui/tabs | [REUSABLE] | Shadcn UI. |
| ui/textarea | [REUSABLE] | Shadcn UI. |
| ui/toggle-group | [REUSABLE] | Shadcn UI. |
| ui/toggle | [REUSABLE] | Shadcn UI. |
| ui/tooltip | [REUSABLE] | Shadcn UI. |
| ui/use-mobile | [REUSABLE] | Utility hook. |
| ui/utils | [REUSABLE] | Utility helpers. |

**Components doing too many things**
- `Home`, `GroupDetail`, `GroupAI`, `AddExpense`, `CreateGroup`, `ProfileSettings`, `GroupSettings`, `ExpenseDetail` (data fetch + complex UI + multiple sheets + business logic in single files).

---

## 3. Hardcoded Values — 🔴 Critical

### Hardcoded colors (hex/rgb/hsl)
Files and line numbers:
- `src/app/components/CreateGroup.tsx`: 73, 74, 75, 76, 77, 88, 92, 103, 109, 124, 147, 148, 149, 184, 190, 199, 228, 258, 261, 273, 276, 288, 292, 298, 312, 316, 322, 344, 345, 373, 375, 379, 398
- `src/app/components/ExpenseDetail.tsx`: 44, 73, 76, 80, 82, 85, 92, 94, 102, 110, 111, 118, 129, 134, 139, 151, 154, 163, 164, 168, 171, 181, 184, 196, 199, 202, 207, 217, 220, 222, 223, 227, 243, 254, 257, 258, 268, 271, 278, 281, 285, 289, 292, 310, 320, 323, 337, 339, 342, 351, 353, 356, 366, 368, 371, 379, 381, 384, 401, 409, 412, 415, 423, 434
- `src/app/components/FirstGroup.tsx`: 35, 36, 37, 38, 46, 52, 66, 89, 91, 97, 117, 119, 127
- `src/app/components/GroupActivity.tsx`: 80, 81, 82, 83, 84, 98, 109, 110, 112, 119, 144, 145, 147, 149, 158
- `src/app/components/GroupAI.tsx`: 281, 307, 309, 428, 429, 431, 432, 435, 439, 628
- `src/app/components/GroupSettings.tsx`: 43, 44, 65, 66, 67, 68, 69, 70, 78, 80, 82, 100, 104, 107, 121, 129, 130, 146, 155, 163, 164, 189, 193, 220, 221, 236, 242, 257, 263, 289, 321, 392, 396, 408, 412, 428, 432, 460, 462, 490, 507, 533, 542
- `src/app/components/Login.tsx`: 65, 66, 67, 68, 77, 117, 131, 153, 157, 162, 178, 200, 220, 231, 245, 246, 247, 253, 282, 287, 292, 351, 352, 353, 354, 356, 358
- `src/app/components/Notifications.tsx`: 37, 47, 57, 68, 77, 120, 127, 136, 141, 154, 155, 157, 165, 166, 172, 179, 189, 190, 192, 200, 201, 203, 211, 214, 226, 240, 241, 245, 260, 267, 268, 270, 272, 281, 295, 298, 299
- `src/app/components/ProfileSettings.tsx`: 44, 45, 46, 47, 48, 49, 76, 82, 103, 107, 111, 124, 131, 138, 149, 168, 173, 179, 190, 193, 194, 200, 203, 204, 228, 232, 242, 246, 270, 274, 277, 284, 288, 310, 314, 327, 331, 385, 389, 400, 404, 435, 448, 477, 496, 511, 546
- `src/app/components/ProfileSetup.tsx`: 31, 32, 33, 34, 42, 49, 62, 84, 85, 97, 105, 112, 126, 133, 150, 156, 179, 181, 184, 187, 204
- `src/app/components/SignUp.tsx`: 20, 25, 48, 54, 59, 65, 66, 67, 68, 75, 80, 86, 87, 88, 89, 96, 101, 107, 108, 109, 110, 115, 126, 134, 135, 144, 147, 148, 149, 150, 152, 158, 162
- `src/app/components/Splash.tsx`: 11, 26, 27, 28, 45, 69, 71, 90, 94
- `src/app/components/ui/chart.tsx`: 58
- `src/app/components/ui/InviteMemberSheet.tsx`: 8, 9, 10, 11, 15, 16, 17, 118, 125, 129, 160, 201, 233, 251, 260, 268, 300, 322, 324, 325
- `src/app/components/ui/PendingApprovalsSheet.tsx`: 61, 74, 78, 79, 85, 94, 95, 96, 103, 104, 115, 120, 121, 122, 127, 131, 144, 151, 176, 178, 184, 185, 192
- `src/app/components/ui/sidebar.tsx`: 483
- `src/styles/theme.css`: 5, 7, 11, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 36

### Hardcoded font sizes / spacing / border radius
Files and line numbers:
- `src/app/components/AddExpense.tsx`: 290, 409, 458, 644
- `src/app/components/CreateGroup.tsx`: 83, 109, 124, 134, 135, 137, 148, 164, 165, 168, 179, 194, 198, 219, 247, 248, 251, 258, 271, 273, 286, 288, 302, 310, 312, 326, 342, 345, 368, 369, 372, 399
- `src/app/components/ExpenseDetail.tsx`: 76, 79, 85, 91, 103, 108, 111, 117, 118, 123, 129, 130, 134, 135, 139, 140, 151, 154, 158, 160, 163, 164, 168, 171, 181, 184, 217, 220, 227, 230, 243, 254, 257, 258, 268, 271, 278, 281, 289, 292, 316, 318, 320, 323, 339, 342, 353, 356, 368, 371, 381, 384, 407, 412, 415, 423, 434
- `src/app/components/FirstGroup.tsx`: 48, 66, 69, 87, 90, 91, 94, 97, 115, 118, 119, 128
- `src/app/components/GroupActivity.tsx`: 80, 81, 82, 83, 84, 98, 101, 102, 109, 112, 119, 144, 149, 158
- `src/app/components/GroupAI.tsx`: 336, 378, 398, 432, 435
- `src/app/components/GroupChat.tsx`: 117, 136, 150, 162, 171
- `src/app/components/GroupDetail.tsx`: 55, 65, 76, 83, 260, 336, 342, 437, 450, 463, 627, 709, 795, 821
- `src/app/components/GroupSettings.tsx`: 94, 104, 106, 130, 137, 153, 155, 161, 164, 178, 179, 182, 189, 194, 203, 206, 217, 221, 233, 237, 246, 254, 258, 267, 278, 279, 283, 308, 328, 335, 366, 378, 379, 382, 390, 392, 397, 406, 408, 414, 416, 426, 428, 433, 455, 456, 459, 491, 512, 522, 541, 548
- `src/app/components/GroupWhiteboard.tsx`: 165, 184, 211
- `src/app/components/Home.tsx`: 366, 733
- `src/app/components/Login.tsx`: 76, 85, 90, 104, 105, 117, 131, 132, 153, 157, 162, 178, 181, 200, 204, 220, 221, 252, 275, 277, 292, 301, 317, 337, 338, 347, 348, 356, 358
- `src/app/components/Notifications.tsx`: 109, 110, 120, 121, 127, 128, 136, 140, 154, 157, 165, 172, 179, 189, 192, 200, 203, 211, 214, 226, 241, 245, 267, 272, 281, 299
- `src/app/components/ProfileSettings.tsx`: 73, 77, 86, 97, 107, 110, 130, 131, 138, 144, 148, 149, 160, 161, 167, 174, 178, 193, 203, 215, 216, 219, 228, 233, 240, 242, 247, 260, 261, 264, 270, 275, 282, 284, 289, 300, 301, 304, 310, 315, 325, 327, 352, 353, 356, 375, 376, 379, 385, 390, 398, 400, 405, 427, 485, 496, 512
- `src/app/components/ProfileSetup.tsx`: 44, 62, 65, 82, 83, 85, 88, 91, 92, 97, 104, 105, 111, 112, 126, 133, 134, 149, 150, 157, 176, 177, 179, 184, 205
- `src/app/components/SettleUp.tsx`: 360, 385, 467
- `src/app/components/SignUp.tsx`: 24, 33, 36, 47, 48, 54, 65, 66, 75, 86, 87, 96, 107, 108, 125, 134, 135, 143, 144, 152, 158
- `src/app/components/Splash.tsx`: 23, 25, 27, 28, 42, 45, 55, 70, 71, 74, 75, 85, 89, 94
- `src/app/components/ui/accordion.tsx`: 38
- `src/app/components/ui/alert-dialog.tsx`: 57
- `src/app/components/ui/badge.tsx`: 8
- `src/app/components/ui/button.tsx`: 8
- `src/app/components/ui/calendar.tsx`: 35
- `src/app/components/ui/chart.tsx`: 176, 205, 209, 293
- `src/app/components/ui/checkbox.tsx`: 17
- `src/app/components/ui/command.tsx`: 86
- `src/app/components/ui/context-menu.tsx`: 88, 105
- `src/app/components/ui/dialog.tsx`: 60
- `src/app/components/ui/drawer.tsx`: 60, 61, 68
- `src/app/components/ui/dropdown-menu.tsx`: 45, 233
- `src/app/components/ui/GroupListItem.tsx`: 34, 50
- `src/app/components/ui/input-otp.tsx`: 54
- `src/app/components/ui/input.tsx`: 12
- `src/app/components/ui/InviteMemberSheet.tsx`: 113, 114, 124, 129, 134, 159, 163, 186, 189, 209, 233, 234, 237, 260, 261, 265, 268, 293, 305, 306, 319, 325
- `src/app/components/ui/menubar.tsx`: 82, 251
- `src/app/components/ui/navigation-menu.tsx`: 62, 78, 132
- `src/app/components/ui/PendingApprovalsSheet.tsx`: 69, 72, 74, 78, 79, 85, 94, 95, 96, 104, 115, 118, 120, 121, 122, 127, 131, 132, 143, 144, 150, 151, 171, 176, 178, 185, 192
- `src/app/components/ui/radio-group.tsx`: 30
- `src/app/components/ui/scroll-area.tsx`: 21
- `src/app/components/ui/select.tsx`: 44, 68
- `src/app/components/ui/sidebar.tsx`: 30, 31, 32, 238, 294
- `src/app/components/ui/switch.tsx`: 16, 24
- `src/app/components/ui/table.tsx`: 73, 86
- `src/app/components/ui/tabs.tsx`: 29, 45
- `src/app/components/ui/textarea.tsx`: 10
- `src/app/components/ui/toggle.tsx`: 10
- `src/app/components/ui/tooltip.tsx`: 55
- `src/styles/theme.css`: 4, 33, 108, 109, 111

### Hardcoded strings that should be constants
All single-quoted string literals (excluding import lines) by file and line number:
- `src/api/groups.ts`: 14, 49, 50, 75, 91, 101
- `src/app/components/figma/ImageWithFallback.tsx`: 4
- `src/app/components/ui/button.tsx`: 8
- `src/app/components/ui/chart.tsx`: 58
- `src/app/components/ui/command.tsx`: 143
- `src/app/components/ui/context-menu.tsx`: 69, 129, 147, 172
- `src/app/components/ui/dialog.tsx`: 66
- `src/app/components/ui/dropdown-menu.tsx`: 77, 95, 131
- `src/app/components/ui/GroupAvatar.tsx`: 6, 22, 24, 26, 28, 30, 32, 35, 41, 42, 43, 58
- `src/app/components/ui/GroupListItem.tsx`: 14, 23, 33, 66, 67, 70, 71, 73, 74, 75
- `src/app/components/ui/InviteMemberSheet.tsx`: 8, 9, 10, 11, 15, 16, 17, 89, 94, 95, 111, 112, 114, 118, 125, 129, 146, 160, 188, 189, 201, 210, 233, 251, 260, 267, 268, 293, 300, 324, 325, 326, 330, 331
- `src/app/components/ui/menubar.tsx`: 106, 124, 149
- `src/app/components/ui/navigation-menu.tsx`: 132
- `src/app/components/ui/PendingApprovalsSheet.tsx`: 35, 36, 66, 67, 69, 72, 74, 78, 79, 85, 94, 95, 96, 104, 112, 115, 120, 121, 122, 127, 140, 144, 151, 174, 175, 178, 185, 192
- `src/app/components/ui/select.tsx`: 44, 114
- `src/app/components/ui/tabs.tsx`: 45
- `src/app/components/ui/toggle.tsx`: 10
- `src/app/components/AddExpense.tsx`: 8, 11, 15, 18, 33, 39, 42, 67, 114, 120, 143, 144, 212, 218, 221, 230, 233, 239, 243, 287, 291, 298, 304, 305, 334, 339, 348, 351, 357, 366, 370, 377, 393, 406, 407, 415, 427, 431, 434, 446, 451, 457, 465, 466, 467, 468, 469, 471, 481, 488, 490, 492, 493, 519, 526, 529, 532, 540, 550, 554, 556, 568, 572, 578, 579, 580, 582, 584, 593, 607, 615, 618, 622, 623, 624, 638, 641, 647, 652, 656, 662, 663, 676, 681
- `src/app/components/CreateGroup.tsx`: 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 23, 24, 25, 26, 27, 35, 36, 38, 43, 48, 49, 50, 69, 73, 74, 75, 76, 77, 88, 92, 109, 124, 147, 148, 149, 179, 184, 190, 199, 225, 228, 258, 261, 273, 276, 288, 292, 298, 302, 312, 316, 322, 326, 344, 345, 366, 367, 369, 373, 375, 379, 398, 399
- `src/app/components/ExpenseDetail.tsx`: 47, 49, 51, 57, 62, 64, 65, 66, 73, 76, 80, 82, 85, 92, 94, 102, 103, 110, 111, 114, 117, 118, 123, 129, 130, 131, 134, 135, 139, 140, 141, 151, 154, 163, 164, 168, 171, 181, 184, 195, 196, 197, 198, 199, 200, 202, 203, 207, 208, 217, 220, 221, 222, 223, 227, 228, 230, 243, 254, 257, 258, 268, 271, 278, 281, 289, 292, 313, 314, 316, 318, 320, 323, 339, 342, 353, 356, 368, 371, 381, 384, 404, 405, 407, 409, 412, 415, 423, 434
- `src/app/components/FirstGroup.tsx`: 7, 8, 9, 10, 11, 12, 26, 35, 36, 37, 38, 48, 52, 66, 69, 89, 91, 94, 97, 117, 118, 119, 126, 128
- `src/app/components/GroupActivity.tsx`: 7, 12, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 40, 43, 44, 45, 46, 47, 48, 49, 52, 53, 54, 55, 56, 57, 58, 61, 62, 63, 64, 65, 66, 80, 81, 82, 83, 84, 98, 102, 112, 118, 145, 147, 149, 158
- `src/app/components/GroupAI.tsx`: 9, 12, 56, 60, 92, 114, 130, 138, 172, 174, 198, 208, 209, 212, 255, 267, 273, 284, 341, 366, 368, 369, 379, 380, 381, 383, 428, 429, 431, 432, 433, 434, 435, 439, 472, 498, 519, 533, 602, 610, 612
- `src/app/components/GroupChat.tsx`: 11, 17, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 66, 67, 68, 71, 91, 92, 142, 147, 148, 155, 160, 166, 167, 171, 173, 191, 202, 203
- `src/app/components/GroupDetail.tsx`: 10, 15, 31, 32, 35, 36, 37, 41, 42, 43, 44, 45, 46, 49, 59, 63, 77, 78, 79, 97, 98, 141, 155, 160, 161, 166, 167, 171, 173, 190, 195, 205, 249, 259, 286, 294, 297, 307, 316, 336, 342, 364, 367, 393, 395, 399, 471, 473, 480, 486, 488, 495, 502, 507, 513, 514, 517, 524, 526, 565, 583, 590, 600, 603, 613, 623, 626, 644, 646, 652, 683, 707, 708, 738, 739, 740, 743, 744, 745, 747, 748, 755, 756, 757, 759, 767, 793, 794, 820
- `src/app/components/GroupSettings.tsx`: 10, 11, 12, 13, 14, 15, 16, 17, 22, 23, 24, 25, 26, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 43, 44, 47, 55, 59, 65, 66, 67, 68, 69, 70, 77, 78, 79, 80, 82, 100, 104, 107, 126, 129, 130, 138, 146, 153, 155, 163, 164, 189, 193, 210, 211, 212, 219, 220, 221, 236, 242, 246, 257, 263, 267, 289, 299, 300, 321, 329, 346, 392, 396, 408, 412, 424, 428, 432, 444, 448, 453, 454, 456, 460, 462, 463, 464, 465, 468, 478, 486, 490, 491, 502, 505, 507, 516, 530, 533, 538, 539, 542, 547
- `src/app/components/GroupWhiteboard.tsx`: 9, 10, 11, 12, 13, 17, 18, 19, 20, 21, 22, 25, 27, 43, 44, 45, 48, 49, 50, 53, 54, 55, 58, 59, 60, 63, 64, 65, 68, 69, 70, 80, 84, 87, 102, 107, 143, 144, 169, 170, 185, 209, 210, 239, 242, 256, 263
- `src/app/components/Home.tsx`: 30, 41, 42, 43, 44, 45, 51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 67, 71, 72, 73, 74, 76, 77, 105, 110, 111, 112, 122, 123, 124, 125, 131, 132, 133, 134, 135, 140, 141, 142, 143, 149, 151, 177, 193, 208, 211, 217, 223, 225, 228, 231, 243, 244, 245, 247, 250, 255, 256, 258, 272, 298, 303, 314, 335, 341, 379, 380, 384, 386, 417, 447, 452, 466, 467, 478, 482, 485, 489, 528, 530, 531, 532, 539, 545, 547, 548, 549, 556, 563, 596, 616, 617, 618, 634, 635, 636, 638, 668, 679, 690, 713, 714, 731, 732, 746, 752, 753, 762, 778, 779
- `src/app/components/Login.tsx`: 6, 11, 17, 23, 24, 26, 32, 37, 43, 47, 48, 52, 65, 66, 67, 68, 71, 85, 86, 87, 88, 90, 91, 92, 93, 110, 113, 143, 144, 156, 157, 161, 162, 176, 182, 184, 185, 192, 195, 203, 204, 214, 219, 236, 245, 246, 247, 253, 255, 256, 257, 258, 271, 272, 273, 277, 279, 280, 281, 282, 284, 285, 286, 287, 289, 290, 291, 292, 295, 296, 297, 300, 301, 310, 320, 321, 329, 332, 338, 356, 358
- `src/app/components/Notifications.tsx`: 7, 29, 30, 32, 33, 34, 35, 36, 37, 38, 41, 42, 44, 45, 46, 47, 48, 51, 52, 54, 55, 56, 57, 61, 62, 64, 65, 66, 67, 68, 69, 72, 73, 75, 76, 77, 91, 109, 110, 111, 112, 113, 118, 120, 125, 127, 136, 141, 151, 155, 157, 162, 166, 172, 179, 186, 190, 192, 197, 201, 203, 208, 214, 226, 235, 240, 241, 245, 260, 266, 268, 270, 272, 281, 290, 291, 295, 299
- `src/app/components/ProfileSettings.tsx`: 10, 11, 12, 13, 14, 15, 16, 17, 21, 28, 29, 30, 31, 44, 45, 46, 47, 48, 49, 58, 59, 60, 64, 65, 66, 76, 82, 86, 103, 107, 111, 129, 131, 133, 136, 138, 144, 147, 149, 168, 173, 190, 193, 194, 200, 203, 204, 225, 228, 232, 242, 246, 248, 270, 274, 277, 284, 288, 310, 314, 327, 331, 342, 385, 389, 396, 400, 404, 416, 420, 425, 426, 429, 435, 438, 448, 453, 471, 477, 480, 490, 491, 496, 507, 511, 512, 524, 525, 536, 546, 551
- `src/app/components/ProfileSetup.tsx`: 7, 8, 9, 10, 11, 12, 13, 14, 19, 20, 28, 31, 32, 33, 34, 44, 49, 62, 65, 82, 83, 84, 85, 88, 92, 97, 105, 112, 150, 155, 157, 174, 175, 177, 179, 181, 184, 204, 205
- `src/app/components/SettleUp.tsx`: 10, 23, 26, 27, 28, 29, 33, 52, 62, 63, 64, 80, 97, 108, 112, 116, 118, 123, 124, 125, 126, 159, 198, 218, 234, 250, 256, 263, 269, 275, 296, 297, 309, 312, 322, 332, 333, 350, 354, 358, 359, 366, 367, 368, 369, 371, 378, 388, 392, 396, 402, 403, 415, 417, 422, 424, 425, 430, 431, 433, 440, 449, 452, 455, 456, 466, 470, 472, 473, 474, 476
- `src/app/components/SignUp.tsx`: 12, 16, 25, 28, 48, 66, 67, 68, 87, 88, 89, 108, 109, 110, 126, 144, 152, 159, 161
- `src/app/components/Splash.tsx`: 11, 25, 26, 27, 28, 45, 58, 59, 60, 69, 70, 71, 88, 90, 94
- `src/app/components/ThemeProvider.tsx`: 3, 13, 17, 22, 35
- `src/mock/balances.ts`: 2, 4, 5, 6, 7, 8, 9, 13, 14, 15, 16, 17, 18, 23, 25, 26, 27, 28, 29, 30
- `src/mock/expenses.ts`: 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 45, 49, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 65, 66
- `src/mock/groups.ts`: 1, 4, 5, 10, 22, 23, 24, 28, 29, 32, 33, 37, 38, 39, 43, 44, 45, 46
- `src/mock/members.ts`: 31, 32
- `src/mock/settlements.ts`: 9, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 57, 58, 59, 60, 61, 62, 63, 64, 65, 68, 69, 70, 71, 72, 73, 74, 75, 76, 79, 80, 81, 82, 83, 84, 85, 86, 87, 90, 91, 92, 93, 94, 95, 96, 97, 98, 101, 102, 103, 104, 105, 106, 107, 108, 109, 112, 113, 114, 115, 116, 117, 118, 119, 120, 123, 124, 125, 126, 127, 128, 129, 130, 131, 134, 135, 136, 137, 138, 139, 140, 141, 142, 145, 146, 147, 148, 149, 150, 151, 152, 153, 156, 157, 158, 159, 160, 161, 162, 163, 164
- `src/utils/expenseCalculator.ts`: 1, 24, 52, 55, 70

---

## 4. Data & State — 🔴 Critical

### Hardcoded mock data arrays/objects
- `src/mock/groups.ts`: `MOCK_USER_ID`, `MOCK_GROUPS`
- `src/mock/members.ts`: `MOCK_GROUP_MEMBERS`
- `src/mock/expenses.ts`: `MOCK_EXPENSES`
- `src/mock/balances.ts`: `MOCK_PAIR_BALANCES`
- `src/mock/settlements.ts`: `MOCK_SETTLEMENTS`
- `src/app/components/Home.tsx`: `MOCK_STATIC_ACTIONS`, `MOCK_RECENT_ACTIVITY`
- `src/app/components/GroupActivity.tsx`: `MOCK_ACTIVITY`
- `src/app/components/GroupAI.tsx`: mock generator built on `MOCK_GROUPS`, `MOCK_EXPENSES`, `MOCK_PAIR_BALANCES`
- `src/app/components/GroupChat.tsx`: `buildMockMessages`

### useState usages (by file and line)
- `src/app/components/AddExpense.tsx`: 25, 26, 36, 37, 42
- `src/app/components/CreateGroup.tsx`: 34, 35, 36, 37, 38, 39, 40, 41
- `src/app/components/ExpenseDetail.tsx`: 11, 16, 17, 18, 19
- `src/app/components/GroupActivity.tsx`: 74
- `src/app/components/GroupAI.tsx`: 217, 241, 246, 247
- `src/app/components/GroupChat.tsx`: 81
- `src/app/components/GroupDetail.tsx`: 96, 108, 109, 110
- `src/app/components/GroupSettings.tsx`: 53, 54, 56, 57, 58, 61, 62
- `src/app/components/GroupWhiteboard.tsx`: 80, 81, 82, 83, 84, 85
- `src/app/components/Home.tsx`: 107, 207, 209, 210, 212, 213
- `src/app/components/Login.tsx`: 12, 13, 14, 15
- `src/app/components/Notifications.tsx`: 84
- `src/app/components/ProfileSettings.tsx`: 29, 30, 31, 34, 35, 36, 37, 38, 41
- `src/app/components/ProfileSetup.tsx`: 19, 20, 21
- `src/app/components/SettleUp.tsx`: 18, 19, 20, 26, 27, 31, 32, 33
- `src/app/components/SignUp.tsx`: 8
- `src/app/components/figma/ImageWithFallback.tsx`: 7
- `src/app/components/ui/carousel.tsx`: 61, 62
- `src/app/components/ui/InviteMemberSheet.tsx`: 35, 37
- `src/app/components/ui/PendingApprovalsSheet.tsx`: 29, 30
- `src/app/components/ui/sidebar.tsx`: 70, 74

**useState entries that should likely be global or server-state**
- `Home`: `staticActions`, `pending settlements` are shared user-level action items and should be backed by central store or server cache.
- `GroupDetail`: `group`, `members`, `balances`, `expenses`, `settlements` should be a data-layer concern (server cache), not local component state.
- `GroupSettings` / `ProfileSettings`: settings data should come from a centralized user/group state rather than local-only state.

### Prop drilling deeper than 2 levels
- Not observed in the current codebase. Data is mostly local or pulled from mocks and API helpers.

---

## 5. Routing — 🟡 Needs Work

**Routes defined (src/app/routes.tsx)**
- `/` (index → `Home`)
- `/welcome` → `Splash`
- `/login` → `Login`
- `/onboarding/profile` → `ProfileSetup`
- `/onboarding/group` → `FirstGroup`
- `/profile` → `ProfileSettings`
- `/group/new` → `CreateGroup`
- `/group/:groupId` → `GroupDetail`
- `/group/:groupId/settings` → `GroupSettings`
- `/group/:groupId/add-expense` → `AddExpense`
- `/group/:groupId/settle` → `SettleUp`
- `/group/:groupId/whiteboard` → `GroupWhiteboard`
- `/group/:groupId/chat` → `GroupChat`
- `/group/:groupId/ai` → `GroupAI`
- `/group/:groupId/activity` → `GroupActivity`
- `/group/:groupId/expense/:expenseId` → `ExpenseDetail`
- `/notifications` → `Notifications`

**Missing**
- Protected routes / auth guard: **missing**
- 404 / Not Found route: **missing**
- Layout wrapper: **present** (`Root`)

---

## 6. API Readiness — 🔴 Critical

**Existing API / fetch / axios code**
- `src/api/groups.ts`: mock-backed async functions for groups, expenses, settlements.
- No `fetch`/`axios`/`ky` calls found in `src/`.

**Base client or interceptors**
- **No** base API client or interceptors.

**Mock data usages that must be replaced by real API**
`MOCK_` references by file:
- `src/api/groups.ts`: 1, 2, 3, 4, 5, 7, 13, 20, 25, 31, 34, 57, 58, 60, 70, 78, 84, 89, 99
- `src/app/components/AddExpense.tsx`: 10, 80, 99, 233, 243, 406, 407, 493, 624
- `src/app/components/CreateGroup.tsx`: 5, 43, 64
- `src/app/components/ExpenseDetail.tsx`: 5, 49, 55, 188
- `src/app/components/GroupActivity.tsx`: 5, 22, 74, 76
- `src/app/components/GroupAI.tsx`: 13, 14, 15, 16, 85, 88, 89, 472, 498
- `src/app/components/GroupChat.tsx`: 6, 7, 21, 92, 130
- `src/app/components/GroupDetail.tsx`: 14, 155, 171, 525, 597, 652, 715, 812
- `src/app/components/GroupSettings.tsx`: 5, 21, 53, 54, 72, 73, 86, 299, 565
- `src/app/components/GroupWhiteboard.tsx`: 6, 41, 79
- `src/app/components/Home.tsx`: 31, 32, 33, 39, 49, 84, 103, 209, 216, 217, 220, 252, 275, 334, 359, 379, 380, 446, 604, 753, 754
- `src/app/components/Notifications.tsx`: 5, 27, 84, 92
- `src/app/components/SettleUp.tsx`: 6, 7, 26, 62, 63, 98, 114, 115, 428
- `src/app/components/ui/InviteMemberSheet.tsx`: 4, 41, 47, 50
- `src/mock/*`: all mock data sources

---

## 7. Missing Critical Files — 🔴 Critical

| File / Requirement | Exists |
| --- | --- |
| `constants/colors.js` (or theme file) | YES (`src/styles/theme.css`) |
| `constants/typography.js` | NO |
| `constants/spacing.js` | NO |
| `services/api.js` (base client) | NO |
| `hooks/` folder with custom hooks | NO |
| `.env` with API base URL | NO |
| Error Boundary component | NO |
| 404 / Not Found page | NO |
| Loading / Skeleton component | YES (`src/app/components/ui/skeleton.tsx`) |
| Empty state component | NO |

---

## 8. Code Quality Flags — 🟡 Needs Work

**console usage**
- `src/app/components/ExpenseDetail.tsx`: line 35 (`console.error`)
- `src/app/components/GroupDetail.tsx`: line 130 (`console.error`)

**TODO / FIXME**
- None found.

**Unused imports / components**
- Not detectable without a typecheck/lint pass in this audit; likely some unused imports in large page components, but not confirmed.

**Inline styles (should be centralized)**
Files with inline `style={{...}}`:
- `src/app/components/CreateGroup.tsx`: 80, 83, 88, 90, 92, 103, 109, 111, 124, 135, 137, 146, 165, 168, 179, 184, 190, 199, 219, 228, 235, 248, 251, 258, 261, 262, 271, 273, 276, 277, 286, 288, 292, 293, 298, 302, 310, 312, 316, 317, 322, 326, 343, 369, 372, 373, 375, 379, 381, 397, 402
- `src/app/components/ExpenseDetail.tsx`: 73, 76, 80, 82, 85, 92, 94, 101, 109, 117, 118, 123, 129, 130, 134, 135, 139, 140, 151, 154, 163, 164, 168, 171, 181, 184, 217, 220, 222, 223, 227, 230, 243, 254, 257, 258, 268, 271, 278, 281, 289, 292, 316, 318, 320, 323, 339, 342, 353, 356, 368, 371, 381, 384, 407, 409, 412, 415, 423, 434
- `src/app/components/FirstGroup.tsx`: 41, 46, 48, 52, 66, 69, 88, 94, 97, 116, 128, 130
- `src/app/components/GroupActivity.tsx`: 98, 102, 112, 145, 147, 149, 158
- `src/app/components/GroupAI.tsx`: 432, 433, 435
- `src/app/components/GroupDetail.tsx`: 336, 342
- `src/app/components/GroupSettings.tsx`: 89, 94, 100, 102, 104, 107, 121, 128, 133, 140, 146, 152, 162, 179, 182, 189, 193, 194, 196, 203, 204, 207, 218, 233, 236, 237, 242, 246, 254, 257, 258, 263, 267, 279, 283, 289, 308, 313, 321, 325, 328, 336, 349, 351, 366, 379, 382, 390, 392, 396, 397, 399, 406, 408, 412, 416, 419, 426, 428, 432, 433, 435, 456, 459, 460, 462, 470, 472, 489, 494, 507, 512, 522, 532, 533, 542, 549
- `src/app/components/Login.tsx`: 71, 77, 85, 90, 105, 122, 132, 157, 162, 169, 179, 204, 211, 221, 229, 243, 252, 276, 301, 318, 337, 338, 348, 356, 358
- `src/app/components/Notifications.tsx`: 120, 127, 136, 141, 155, 157, 166, 172, 179, 190, 192, 201, 203, 214, 226, 239, 245, 260, 268, 270, 272, 281, 295, 299
- `src/app/components/ProfileSettings.tsx`: 73, 76, 77, 82, 86, 93, 97, 103, 105, 107, 111, 124, 131, 138, 140, 144, 149, 161, 168, 173, 174, 179, 190, 191, 193, 194, 200, 201, 203, 204, 216, 219, 228, 232, 233, 235, 240, 242, 246, 247, 251, 261, 264, 270, 274, 275, 277, 282, 284, 288, 289, 291, 301, 304, 310, 314, 315, 317, 325, 327, 331, 333, 353, 356, 361, 376, 379, 385, 389, 390, 392, 398, 400, 404, 405, 407, 435, 439, 448, 455, 463, 477, 481, 494, 510, 515, 528, 539, 546, 553
- `src/app/components/ProfileSetup.tsx`: 37, 42, 44, 49, 62, 65, 81, 88, 92, 94, 97, 105, 112, 134, 150, 157, 177, 179, 181, 184, 188, 203, 208
- `src/app/components/SignUp.tsx`: 25, 48, 66, 87, 108, 126, 144, 152
- `src/app/components/Splash.tsx`: 11, 24, 45, 68, 90, 94
- `src/app/components/ui/chart.tsx`: 294
- `src/app/components/ui/GroupAvatar.tsx`: 51
- `src/app/components/ui/InviteMemberSheet.tsx`: 114, 118, 125, 129, 135, 137, 160, 164, 168, 173, 187, 192, 201, 209, 224, 228, 233, 234, 238, 251, 255, 260, 261, 266, 282, 284, 286, 293, 300, 305, 306, 320
- `src/app/components/ui/PendingApprovalsSheet.tsx`: 69, 72, 74, 78, 79, 85, 94, 95, 96, 104, 115, 120, 121, 122, 127, 144, 151, 178, 185, 192
- `src/app/components/ui/progress.tsx`: 25

---

## Prioritized Action List (Top 10)

1. Replace mock data usages (`MOCK_*`) with real API integration across all page components and `src/api/groups.ts`.
2. Introduce a base API client with interceptors and error handling.
3. Split large page components (`Home`, `GroupDetail`, `GroupAI`, `AddExpense`, `CreateGroup`, `ProfileSettings`, `GroupSettings`, `ExpenseDetail`) into smaller feature modules.
4. Add auth gating and protected routes for group and profile pages.
5. Add a 404/Not Found route and component.
6. Centralize design tokens (colors, typography, spacing) to eliminate extensive hardcoded styles.
7. Create shared empty state and loading components and standardize usage.
8. Move inline styles into theme/tokens or component-level styles for consistency.
9. Establish a hooks layer (`src/hooks`) for data fetching and shared UI behavior.
10. Add an Error Boundary to cover route-level rendering failures.
