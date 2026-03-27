import React from 'react';
import { Search } from 'lucide-react';

type GroupSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function GroupSearchBar({ value, onChange }: GroupSearchBarProps) {
  return (
    <div className="mb-4">
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
