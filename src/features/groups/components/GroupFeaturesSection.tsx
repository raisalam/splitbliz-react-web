import React from 'react';

type GroupFeaturesSectionProps = {
  requireApproval: boolean;
  simplifyDebts: boolean;
  onToggleRequireApproval: () => void;
  onToggleSimplifyDebts: () => void;
  sectionDivider: string;
  purple: string;
  mutedLabel: string;
};

export function GroupFeaturesSection({
  requireApproval,
  simplifyDebts,
  onToggleRequireApproval,
  onToggleSimplifyDebts,
  sectionDivider,
  purple,
  mutedLabel
}: GroupFeaturesSectionProps) {
  return (
    <>
      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Require settlement approval</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Members must confirm before marking paid</p>
        </div>
        <button
          onClick={onToggleRequireApproval}
          className="w-11 h-6 rounded-full transition-colors relative shrink-0"
          style={{ backgroundColor: requireApproval ? purple : '#d4d0e8' }}
        >
          <div
            className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
            style={{ left: requireApproval ? '22px' : '2px' }}
          />
        </button>
      </div>

      <div
        className="flex items-center gap-3 px-4 py-3.5"
        style={{ borderTop: `0.5px solid ${sectionDivider}` }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Simplify debts</p>
          <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Minimize total number of transactions</p>
        </div>
        <button
          onClick={onToggleSimplifyDebts}
          className="w-11 h-6 rounded-full transition-colors relative shrink-0"
          style={{ backgroundColor: simplifyDebts ? purple : '#d4d0e8' }}
        >
          <div
            className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
            style={{ left: simplifyDebts ? '22px' : '2px' }}
          />
        </button>
      </div>
    </>
  );
}
