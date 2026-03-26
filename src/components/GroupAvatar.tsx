import React from 'react';
import { colors } from '../constants/colors';

type GroupAvatarProps = {
  name: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  hasActivity?: boolean;
};

// Generates a consistent 1-6 integer based on a string hash
function stringToHashIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use absolute value and modulo 6 to get index 0-5
  return Math.abs(hash) % 6;
}

const colorVariants = [
  // Indigo
  { bg: 'bg-indigo-100 dark:bg-indigo-500/20', border: 'border-indigo-200 dark:border-indigo-500/30' },
  // Emerald
  { bg: 'bg-emerald-100 dark:bg-emerald-500/20', border: 'border-emerald-200 dark:border-emerald-500/30' },
  // Amber
  { bg: 'bg-amber-100 dark:bg-amber-500/20', border: 'border-amber-200 dark:border-amber-500/30' },
  // Rose
  { bg: 'bg-rose-100 dark:bg-rose-500/20', border: 'border-rose-200 dark:border-rose-500/30' },
  // Sky
  { bg: 'bg-sky-100 dark:bg-sky-500/20', border: 'border-sky-200 dark:border-sky-500/30' },
  // Fuchsia
  { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20', border: 'border-fuchsia-200 dark:border-fuchsia-500/30' },
];

export function GroupAvatar({ name, emoji = '👥', size = 'md', hasActivity = false }: GroupAvatarProps) {
  const colorIndex = stringToHashIndex(name);
  const colors = colorVariants[colorIndex];

  // Map sizes to Tailwind dimensions and font sizes
  const sizeMap = {
    sm: { container: 'w-8 h-8', text: 'text-sm' },
    md: { container: 'w-12 h-12', text: 'text-2xl' },
    lg: { container: 'w-16 h-16', text: 'text-4xl' },
  };

  const { container, text } = sizeMap[size];

  // Base avatar circle without rings
  const avatarContent = (
    <div className={`${container} rounded-full flex items-center justify-center border ${colors.border} ${colors.bg} overflow-hidden shadow-sm transition-all`}>
      <span className={text} style={{ lineHeight: 1 }}>{emoji}</span>
    </div>
  );

  // If there's activity, return it wrapped in the glowing gradient ring
  if (hasActivity) {
    // We adjust the ring padding based on the size
    const paddingMap = { sm: 'p-1', md: 'p-1', lg: 'p-1.5' };
    const p = paddingMap[size];

    return (
      <div className={`relative rounded-full ${p} bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 transition-transform hover:scale-105 shadow-md shadow-rose-500/20`}>
        <div className="rounded-full bg-white dark:bg-slate-900 overflow-hidden border-2 border-white dark:border-slate-900 pointer-events-none">
           {avatarContent}
        </div>
      </div>
    );
  }

  // Without activity, just the standard avatar
  return avatarContent;
}
