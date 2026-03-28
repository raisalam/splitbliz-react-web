import React from 'react';
import { ChevronRight } from '../../../constants/icons';

type DangerZoneSectionProps = {
  leaveError: boolean;
  onLeave: () => void;
  onDelete: () => void;
  sectionDivider: string;
  cardBorder: string;
  mutedLabel: string;
};

export function DangerZoneSection({
  leaveError,
  onLeave,
  onDelete,
  sectionDivider,
  cardBorder,
  mutedLabel
}: DangerZoneSectionProps) {
  return (
    <div
      className="rounded-[14px] bg-white overflow-hidden"
      style={{ border: `0.5px solid ${cardBorder}` }}
    >
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
          Group Actions
        </p>
      </div>

      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#f0f0f0' }}>
          🗄️
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: '#3d3a4a' }}>Archive group</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Hide from active groups. Can be restored.</p>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
      </button>

      <button
        onClick={onLeave}
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fff3e0' }}>
          🚪
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: '#e65100' }}>Leave group</p>
          {leaveError ? (
            <p className="text-[11px] mt-0.5 text-red-500 font-medium">Settle your balance first</p>
          ) : (
            <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>You must be fully settled to leave.</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
      </button>

      <button
        onClick={onDelete}
        className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-red-50/50"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#ffebee' }}>
          🗑️
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold" style={{ color: '#e24b4a' }}>Delete group</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Permanently deletes all expenses. Cannot be undone.</p>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
      </button>
    </div>
  );
}
