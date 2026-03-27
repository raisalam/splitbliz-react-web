import type { ComponentType } from 'react';
import {
  ArrowUpDown,
  Banknote,
  Building2,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  LogOut,
  PenLine,
  Plus,
  Receipt,
  Settings,
  Shield,
  Smartphone,
  Trash,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { colors } from './colors';

type IconConfig = {
  Icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  className: string;
  bg: string;
  strokeWidth?: number;
};

export const GROUP_ACTIVITY_ICON_MAP: Record<string, IconConfig> = {
  EXPENSE: { Icon: Receipt, className: 'w-[18px] h-[18px] text-[#6c5ce7]', bg: '#ede9ff' },
  SETTLE: { Icon: Check, className: 'w-[18px] h-[18px] text-[#0f6e56]', bg: colors.successLight, strokeWidth: 3 },
  EDIT: { Icon: PenLine, className: 'w-[18px] h-[18px] text-[#e28a11]', bg: '#faeeda' },
  JOIN: { Icon: Users, className: 'w-[18px] h-[18px] text-[#2c74c9]', bg: '#e6f1fb' },
  LEAVE: { Icon: LogOut, className: 'w-[18px] h-[18px] text-[#e24b4a]', bg: '#fceaea' },
};

export const NOTIFICATION_STYLE_MAP: Record<string, IconConfig> = {
  NEW_EXPENSE: { Icon: CreditCard, className: 'w-4 h-4 text-[#6c5ce7]', bg: '#ede9ff' },
  EXPENSE_ADDED: { Icon: CreditCard, className: 'w-4 h-4 text-[#6c5ce7]', bg: '#ede9ff' },
  GROUP_INVITE: { Icon: Users, className: 'w-4 h-4 text-[#2c74c9]', bg: '#e6f1fb' },
  MEMBER_JOINED: { Icon: Users, className: 'w-4 h-4 text-[#2c74c9]', bg: '#e6f1fb' },
  REMINDER: { Icon: Clock, className: 'w-4 h-4 text-[#e24b4a]', bg: '#fceaea' },
  SETTLEMENT_APPROVED: { Icon: Check, className: 'w-4 h-4 text-[#0f6e56]', bg: colors.successLight, strokeWidth: 3 },
  SETTLEMENT_REJECTED: { Icon: X, className: 'w-4 h-4 text-[#e24b4a]', bg: '#fceaea' },
  SETTLEMENT_REQUEST: { Icon: Clock, className: 'w-4 h-4 text-[#e28a11]', bg: '#faeeda' },
  SETTLEMENT_RECEIVED: { Icon: Clock, className: 'w-4 h-4 text-[#e28a11]', bg: '#faeeda' },
  DEFAULT: { Icon: Clock, className: 'w-4 h-4 text-[#e28a11]', bg: '#faeeda' },
};

type RecentActivityConfig = {
  icon: ComponentType<{ className?: string }>;
  amountType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  bg: string;
};

export const RECENT_ACTIVITY_CONFIG: Record<string, RecentActivityConfig> = {
  EXPENSE_CREATED: { icon: Plus, amountType: 'POSITIVE', bg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
  EXPENSE_EDITED: { icon: Edit, amountType: 'NEUTRAL', bg: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  EXPENSE_DELETED: { icon: Trash, amountType: 'NEGATIVE', bg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
  SETTLEMENT_CREATED: { icon: DollarSign, amountType: 'NEGATIVE', bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  SETTLEMENT_APPROVED: { icon: Check, amountType: 'POSITIVE', bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  SETTLEMENT_REJECTED: { icon: Trash, amountType: 'NEUTRAL', bg: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
  SETTLEMENT_CANCELLED: { icon: Trash, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  MEMBER_JOINED: { icon: UserPlus, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  MEMBER_REMOVED: { icon: Users, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  MEMBER_ROLE_CHANGED: { icon: Shield, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  GROUP_CREATED: { icon: Plus, amountType: 'NEUTRAL', bg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
  GROUP_SETTINGS_UPDATED: { icon: Settings, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  DEFAULT: { icon: ArrowUpDown, amountType: 'NEUTRAL', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

export const SETTLEMENT_PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Cash', label: 'Cash', icon: Banknote },
  { id: 'Bank Transfer', label: 'Bank', icon: Building2 },
  { id: 'Other', label: 'Other', icon: CreditCard },
] as const;

const EXPENSE_CATEGORY_BORDER_CLASS: Record<string, string> = {
  TRAVEL: 'border-l-indigo-500',
  FOOD: 'border-l-orange-500',
  ACCOMMODATION: 'border-l-emerald-500',
  TRANSPORT: 'border-l-amber-500',
  ENTERTAINMENT: 'border-l-rose-500',
  SHOPPING: 'border-l-rose-500',
};

export function getExpenseBorderClass(category?: string | null): string {
  if (!category) return 'border-l-slate-300 dark:border-l-slate-700';
  return EXPENSE_CATEGORY_BORDER_CLASS[category] ?? 'border-l-slate-300 dark:border-l-slate-700';
}
