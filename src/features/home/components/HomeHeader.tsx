import React from 'react';
import { Bell, Moon, Sun, LogOut } from 'lucide-react';
import { useUser } from '../../../providers/UserContext';

type HomeHeaderProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNotificationsClick: () => void;
  onAvatarClick: () => void;
  onLogout: () => void;
  brandLogo: string;
  unreadCount: number;
};

export function HomeHeader({
  theme,
  onToggleTheme,
  onNotificationsClick,
  onAvatarClick,
  onLogout,
  brandLogo,
  unreadCount
}: HomeHeaderProps) {
  const { user } = useUser();
  const hasUnread = unreadCount > 0;
  const avatarUrl = user?.resolvedAvatar ?? '';
  const avatarInitial = (user?.displayName?.charAt(0) ?? 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden bg-indigo-50 dark:bg-slate-800 p-1 ring-1 ring-indigo-100 dark:ring-slate-700">
            <img src={brandLogo} alt="SplitBliz" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <span className="font-semibold text-lg hidden sm:block tracking-tight">SplitBliz</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button
              onClick={onNotificationsClick}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
            </button>
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></span>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <div className="flex items-center gap-3">
            <button onClick={onAvatarClick} className="relative rounded-full hover:ring-2 hover:ring-indigo-500/50 transition-all">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.displayName ?? 'User Avatar'}
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                />
              ) : (
                <span className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-200">
                  {avatarInitial}
                </span>
              )}
            </button>
            <button onClick={onLogout} className="p-2 text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
