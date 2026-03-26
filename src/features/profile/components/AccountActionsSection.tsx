import React from 'react';
import { ChevronRight } from 'lucide-react';

type AccountActionsSectionProps = {
  variant: 'plan' | 'account';
  purple: string;
  mutedLabel: string;
  cardBorder: string;
  sectionDivider: string;
  onDeleteAccount: () => void;
};

export function AccountActionsSection({
  variant,
  purple,
  mutedLabel,
  cardBorder,
  sectionDivider,
  onDeleteAccount
}: AccountActionsSectionProps) {
  return (
    <>
      {variant === 'plan' && (
        <div
          className="rounded-[14px] bg-white p-4"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: '#faeeda' }}
              >
                ⚡
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1a1625' }}>Free Plan</p>
                <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Basic features for personal use</p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-[20px] text-xs font-bold text-white transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${purple}, #a29bfe)` }}
            >
              Upgrade to PRO
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span style={{ color: '#1a1625' }}>Active groups</span>
                <span style={{ color: purple }}>3 / 5</span>
              </div>
              <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: '#f0eeff' }}>
                <div className="h-full rounded-full" style={{ width: '60%', background: `linear-gradient(90deg, ${purple}, #a29bfe)` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span style={{ color: '#1a1625' }}>Monthly expenses</span>
                <span style={{ color: purple }}>8 / 20</span>
              </div>
              <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: '#f0eeff' }}>
                <div className="h-full rounded-full" style={{ width: '40%', background: 'linear-gradient(90deg, #1d9e75, #5dcaa5)' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {variant === 'account' && (
        <div
          className="rounded-[14px] bg-white overflow-hidden mb-8"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Account
            </p>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#faeeda' }}>
              🚪
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#e65100' }}>Log out</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Sign out of this device</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>

          <button
            onClick={onDeleteAccount}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-red-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fceaea' }}>
              🗑️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#e24b4a' }}>Delete account</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Permanently removes all your data</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>
        </div>
      )}
    </>
  );
}
