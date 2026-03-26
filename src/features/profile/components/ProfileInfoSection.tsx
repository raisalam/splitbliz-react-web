import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { colors } from '../../../constants/colors';

type ProfileInfoSectionProps = {
  displayName: string;
  email: string;
  mutedLabel: string;
  cardBorder: string;
  sectionDivider: string;
  onEditName: () => void;
};

export function ProfileInfoSection({
  displayName,
  email,
  mutedLabel,
  cardBorder,
  sectionDivider,
  onEditName
}: ProfileInfoSectionProps) {
  return (
    <div
      className="rounded-[14px] bg-white overflow-hidden"
      style={{ border: `0.5px solid ${cardBorder}` }}
    >
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
          Profile
        </p>
      </div>

      <button
        onClick={onEditName}
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: colors.primaryFaint }}>
          👤
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Display name</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>{displayName}</p>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
      </button>

      <div
        className="w-full flex items-center gap-3 px-4 py-3.5"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#e3f2fd' }}>
          📧
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Email address</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>
            {email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp1 + '*'.repeat(gp2.length))}
          </p>
        </div>
        <Lock className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
      </div>
    </div>
  );
}
