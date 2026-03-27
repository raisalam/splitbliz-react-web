// =============================================================================
// SplitBliz - Emoji and icon constants
// Centralized emoji sources to avoid per-component maps.
// =============================================================================

export const DEFAULT_GROUP_EMOJI = '\u{1F465}'; // Group
export const DEFAULT_AVATAR_EMOJI = '\u{1F642}'; // Avatar

export const GROUP_TYPE_EMOJI: Record<string, string> = {
  TRIP: '\u{2708}\u{FE0F}',
  HOME: '\u{1F3E0}',
  FOOD: '\u{1F354}',
  OFFICE: '\u{1F4BC}',
  ENTERTAINMENT: '\u{1F3AC}',
  SPORTS: '\u{26BD}',
  SHOPPING: '\u{1F6CD}\u{FE0F}',
  OTHER: DEFAULT_GROUP_EMOJI,
};

export const GROUP_EMOJI_GRID: string[] = [
  '\u{2708}\u{FE0F}', '\u{1F3E0}', '\u{1F355}', '\u{26BD}', '\u{1F389}', '\u{1F4BC}', '\u{1F491}', '\u{1F4C2}',
  '\u{1F697}', '\u{1F3DD}\u{FE0F}', '\u{1F5FA}\u{FE0F}', '\u{1F3D6}\u{FE0F}', '\u{26F1}\u{FE0F}', '\u{1F3D5}\u{FE0F}', '\u{1F685}', '\u{1F9F3}',
  '\u{1F354}', '\u{1F363}', '\u{1F377}', '\u{2615}', '\u{1F32E}', '\u{1F37B}', '\u{1F37D}\u{FE0F}', '\u{1F366}',
  '\u{1F6CB}\u{FE0F}', '\u{1F6D2}', '\u{1F50C}', '\u{1F6C1}', '\u{1F9F9}', '\u{1F4A1}', '\u{1F511}', '\u{1F4FA}',
  '\u{1F388}', '\u{1F38A}', '\u{1F381}', '\u{1F57A}', '\u{1F973}', '\u{1F3A4}', '\u{1F3B6}', '\u{1F3AB}',
  '\u{1F3C0}', '\u{1F3C8}', '\u{1F3BE}', '\u{1F3D3}', '\u{1F3F8}', '\u{1F94A}', '\u{1F3CB}\u{FE0F}', '\u{1F3C4}',
  '\u{1F4BB}', '\u{1F4CA}', '\u{1F4CB}', '\u{1F4DD}', '\u{1F4DE}', '\u{1F3E2}', '\u{1F454}', '\u{1F4DD}',
  '\u{1F465}', '\u{1F91D}', '\u{1F64C}', '\u{1F4AA}', '\u{1F525}', '\u{2728}', '\u{1F680}', '\u{1F3AF}',
];

export const AVATAR_EMOJI_GRID: string[] = GROUP_EMOJI_GRID;

export const EXPENSE_CATEGORY_EMOJI: Record<string, string> = {
  FOOD: '\u{1F37D}\u{FE0F}',
  TRAVEL: '\u{2708}\u{FE0F}',
  TRANSPORT: '\u{1F695}',
  ACCOMMODATION: '\u{1F3E0}',
  ENTERTAINMENT: '\u{1F3AC}',
  SHOPPING: '\u{1F6CD}\u{FE0F}',
  UTILITIES: '\u{1F4A1}',
  MEDICAL: '\u{1F48A}',
  EDUCATION: '\u{1F4DA}',
  OTHER: '\u{1F9FE}',
};

export const EXPENSE_CATEGORY_OPTIONS = [
  { key: 'TRAVEL', label: 'Travel', emoji: EXPENSE_CATEGORY_EMOJI.TRAVEL },
  { key: 'FOOD', label: 'Food', emoji: EXPENSE_CATEGORY_EMOJI.FOOD },
  { key: 'ACCOMMODATION', label: 'Rent', emoji: EXPENSE_CATEGORY_EMOJI.ACCOMMODATION },
  { key: 'ENTERTAINMENT', label: 'Fun', emoji: EXPENSE_CATEGORY_EMOJI.ENTERTAINMENT },
  { key: 'SHOPPING', label: 'Shopping', emoji: EXPENSE_CATEGORY_EMOJI.SHOPPING },
  { key: 'UTILITIES', label: 'Utilities', emoji: EXPENSE_CATEGORY_EMOJI.UTILITIES },
  { key: 'TRANSPORT', label: 'Travel', emoji: EXPENSE_CATEGORY_EMOJI.TRANSPORT },
  { key: 'MEDICAL', label: 'Other', emoji: EXPENSE_CATEGORY_EMOJI.OTHER },
  { key: 'EDUCATION', label: 'Other', emoji: EXPENSE_CATEGORY_EMOJI.OTHER },
  { key: 'OTHER', label: 'Other', emoji: EXPENSE_CATEGORY_EMOJI.OTHER },
];

export const EXPENSE_CATEGORY_CHIPS = [
  { key: 'TRAVEL', label: 'Travel', emoji: EXPENSE_CATEGORY_EMOJI.TRAVEL },
  { key: 'FOOD', label: 'Food', emoji: EXPENSE_CATEGORY_EMOJI.FOOD },
  { key: 'ACCOMMODATION', label: 'Rent', emoji: EXPENSE_CATEGORY_EMOJI.ACCOMMODATION },
  { key: 'ENTERTAINMENT', label: 'Fun', emoji: EXPENSE_CATEGORY_EMOJI.ENTERTAINMENT },
  { key: 'SHOPPING', label: 'Shopping', emoji: EXPENSE_CATEGORY_EMOJI.SHOPPING },
  { key: 'UTILITIES', label: 'Utilities', emoji: EXPENSE_CATEGORY_EMOJI.UTILITIES },
  { key: 'OTHER', label: 'Other', emoji: EXPENSE_CATEGORY_EMOJI.OTHER },
];

export const AI_CATEGORY_EMOJI: Record<string, string> = {
  TRAVEL: '\u{2708}\u{FE0F}',
  FOOD: '\u{1F355}',
  RENT: '\u{1F3E0}',
  ENTERTAINMENT: '\u{1F3AC}',
  SHOPPING: '\u{1F6CD}\u{FE0F}',
  OTHER: '\u{1F4E6}',
};

export const FIRST_GROUP_INTENTS = [
  { id: 'trip', label: 'A trip', emoji: GROUP_TYPE_EMOJI.TRIP, placeholder: 'e.g. Bali Trip 2026' },
  { id: 'home', label: 'Home expenses', emoji: GROUP_TYPE_EMOJI.HOME, placeholder: 'e.g. 123 Main St' },
  { id: 'food', label: 'Food & dining', emoji: '\u{1F355}', placeholder: 'e.g. Weekend Dinners' },
  { id: 'event', label: 'An event', emoji: '\u{1F389}', placeholder: 'e.g. Sarah\'s Birthday' },
  { id: 'office', label: 'Office / work', emoji: GROUP_TYPE_EMOJI.OFFICE, placeholder: 'e.g. Lunch runs' },
  { id: 'other', label: 'Something else', emoji: '\u{1F4C2}', placeholder: 'e.g. Shared Expenses' },
];

export const WHITEBOARD_CATEGORIES = [
  { key: 'ALL', label: 'All', emoji: '\u{1F4CB}' },
  { key: 'PAYMENT', label: 'Payment Info', emoji: '\u{1F4B3}' },
  { key: 'RULES', label: 'Rules', emoji: '\u{1F4CC}' },
  { key: 'LINKS', label: 'Links', emoji: '\u{1F517}' },
  { key: 'NOTES', label: 'Notes', emoji: '\u{1F4DD}' },
];

export const UI_EMOJI = {
  MONEY: '\u{1F4B0}',
  BOLT: '\u{26A1}',
  PARTY: '\u{1F389}',
  SPARKLES: '\u{2728}',
  BELL: '\u{1F514}',
  RECEIPT: '\u{1F9FE}',
  SPLIT_EQUAL: '\u{2696}\u{FE0F}',
  SPLIT_CUSTOM: '\u{270F}\u{FE0F}',
  CALENDAR: '\u{1F4C5}',
  SHARE: '\u{1F4E4}',
  DUPLICATE: '\u{1F4CB}',
  DELETE: '\u{1F5D1}\u{FE0F}',
  EDIT: '\u{270F}\u{FE0F}',
};

export const SPLASH_FEATURES = [
  { icon: UI_EMOJI.RECEIPT, text: 'Track group expenses' },
  { icon: UI_EMOJI.SPLIT_EQUAL, text: 'Auto split and settle up' },
  { icon: UI_EMOJI.BELL, text: 'Get notified instantly' },
];

export const INSIGHT_EMOJI = {
  OWED: UI_EMOJI.MONEY,
  OWE: UI_EMOJI.BOLT,
  SETTLED: UI_EMOJI.PARTY,
  CLEAR: UI_EMOJI.SPARKLES,
};

export const EXPENSE_ACTION_EMOJI = {
  EDIT: UI_EMOJI.EDIT,
  SHARE: UI_EMOJI.SHARE,
  DUPLICATE: UI_EMOJI.DUPLICATE,
  DELETE: UI_EMOJI.DELETE,
  RECEIPT: UI_EMOJI.RECEIPT,
};
