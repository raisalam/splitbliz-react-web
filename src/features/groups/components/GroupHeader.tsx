import React from 'react';
import { ArrowLeft, Moon, Sun, Bell, Settings, MessageSquare } from 'lucide-react';
import { GroupAvatar } from '../../../components/GroupAvatar';

type GroupHeaderProps = {
  group: any;
  theme: 'light' | 'dark';
  onBack: () => void;
  onChat: () => void;
  onActivity: () => void;
  onSettingsClick: () => void;
  onToggleTheme: () => void;
};

export function GroupHeader({
  group,
  theme,
  onBack,
  onChat,
  onActivity,
  onSettingsClick,
  onToggleTheme
}: GroupHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <GroupAvatar name={group.name} emoji={group.emoji} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="font-semibold text-lg leading-tight">{group.name}</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{group.memberCount} members</p>
            </div>
          </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onChat}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Group Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={onActivity}
            className="p-2 relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Group Activity"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Group Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
