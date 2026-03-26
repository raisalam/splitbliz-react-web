import React from 'react';

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
        <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>{label}</p>
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

type NotificationTogglesProps = {
  pushNotifs: boolean;
  settlementReqs: boolean;
  newExpenses: boolean;
  emailSummaries: boolean;
  reminders: boolean;
  onTogglePush: () => void;
  onToggleSettlement: () => void;
  onToggleExpenses: () => void;
  onToggleSummaries: () => void;
  onToggleReminders: () => void;
  cardBorder: string;
  sectionDivider: string;
  mutedLabel: string;
  purple: string;
};

export function NotificationToggles({
  pushNotifs,
  settlementReqs,
  newExpenses,
  emailSummaries,
  reminders,
  onTogglePush,
  onToggleSettlement,
  onToggleExpenses,
  onToggleSummaries,
  onToggleReminders,
  cardBorder,
  sectionDivider,
  mutedLabel,
  purple
}: NotificationTogglesProps) {
  return (
    <div
      className="rounded-[14px] bg-white overflow-hidden"
      style={{ border: `0.5px solid ${cardBorder}` }}
    >
      <div className="px-4 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
          Notifications
        </p>
      </div>

      <div style={{ borderTop: `none` }}>
        <ToggleRow label="Push notifications" subtitle="Stay updated on the go" checked={pushNotifs} onChange={onTogglePush} sectionDivider={sectionDivider} mutedLabel={mutedLabel} purple={purple} />
        <ToggleRow label="Settlement requests" subtitle="When someone requests a payout" checked={settlementReqs} onChange={onToggleSettlement} sectionDivider={sectionDivider} mutedLabel={mutedLabel} purple={purple} />
        <ToggleRow label="New expenses" subtitle="When a member logs an expense" checked={newExpenses} onChange={onToggleExpenses} sectionDivider={sectionDivider} mutedLabel={mutedLabel} purple={purple} />
        <ToggleRow label="Email summaries" subtitle="Weekly activity reports" checked={emailSummaries} onChange={onToggleSummaries} sectionDivider={sectionDivider} mutedLabel={mutedLabel} purple={purple} />
        <ToggleRow label="Reminders" subtitle="Nudges for unsettled balances" checked={reminders} onChange={onToggleReminders} sectionDivider={sectionDivider} mutedLabel={mutedLabel} purple={purple} />
      </div>
    </div>
  );
}
