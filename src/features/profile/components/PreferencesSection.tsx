import React from 'react';
import { ChevronRight } from 'lucide-react';
import { colors } from '../../../constants/colors';

type ToggleRowProps = {
  label: string;
  subtitle: string;
  checked: boolean;
  onChange: () => void;
  sectionDivider: string;
  mutedLabel: string;
  purple: string;
};

function ToggleRow({ label, subtitle, checked, onChange, sectionDivider, mutedLabel, purple }: ToggleRowProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderTop: `0.5px solid ${sectionDivider}` }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{label}</p>
        <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>{subtitle}</p>
      </div>
      <button
        onClick={onChange}
        className="w-11 h-6 rounded-full transition-colors relative shrink-0"
        style={{ backgroundColor: checked ? purple : '#d0cbe8' }}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}

type PreferencesSectionProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  cardBorder: string;
  sectionDivider: string;
  mutedLabel: string;
  purple: string;
};

export function PreferencesSection({
  theme,
  onToggleTheme,
  cardBorder,
  sectionDivider,
  mutedLabel,
  purple
}: PreferencesSectionProps) {
  return (
    <div
      className="rounded-[14px] bg-white overflow-hidden"
      style={{ border: `0.5px solid ${cardBorder}` }}
    >
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
          Preferences
        </p>
      </div>

      <button className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#faeeda' }}>
          💱
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Default currency</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Used when creating new groups</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
          <span className="font-medium">₹ INR</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: colors.primaryFaint }}>
          🌐
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Language</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
          <span className="font-medium">English</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      <ToggleRow
        label="Dark mode"
        subtitle="Switch between light and dark themes"
        checked={theme === 'dark'}
        onChange={onToggleTheme}
        sectionDivider={sectionDivider}
        mutedLabel={mutedLabel}
        purple={purple}
      />
    </div>
  );
}
