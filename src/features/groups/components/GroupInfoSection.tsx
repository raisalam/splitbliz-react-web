import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Pencil } from 'lucide-react';
import { GroupFeaturesSection } from './GroupFeaturesSection';
import { colors } from '../../../constants/colors';

type GroupInfoSectionProps = {
  groupName: string;
  selectedEmoji: string;
  currencyCode: string;
  splitType: 'EQUAL' | 'PERCENTAGE' | 'FIXED';
  onGroupNameChange: (value: string) => void;
  onEmojiClick: () => void;
  onSplitTypeChange: (value: 'EQUAL' | 'PERCENTAGE' | 'FIXED') => void;
  requireApproval: boolean;
  simplifyDebts: boolean;
  onToggleRequireApproval: () => void;
  onToggleSimplifyDebts: () => void;
  purple: string;
  pageBg: string;
  cardBorder: string;
  sectionDivider: string;
  mutedLabel: string;
};

export function GroupInfoSection({
  groupName,
  selectedEmoji,
  currencyCode,
  splitType,
  onGroupNameChange,
  onEmojiClick,
  onSplitTypeChange,
  requireApproval,
  simplifyDebts,
  onToggleRequireApproval,
  onToggleSimplifyDebts,
  purple,
  pageBg,
  cardBorder,
  sectionDivider,
  mutedLabel
}: GroupInfoSectionProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 flex items-center gap-5"
        style={{ background: `linear-gradient(135deg, ${purple}, ${colors.primaryLight})` }}
      >
        <div className="relative shrink-0">
          <button
            onClick={onEmojiClick}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2.5px solid rgba(255,255,255,0.45)',
            }}
          >
            <span className="text-3xl" style={{ lineHeight: 1 }}>{selectedEmoji}</span>
          </button>
          <div
            className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
            onClick={onEmojiClick}
          >
            <Pencil className="w-3 h-3" style={{ color: purple }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Group name</p>
          <input
            type="text"
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            className="w-full bg-transparent text-white text-lg font-bold outline-none pb-1"
            style={{
              borderBottom: '1.5px solid rgba(255,255,255,0.45)',
            }}
          />
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              PRO
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[14px] bg-white overflow-hidden"
        style={{ border: `0.5px solid ${cardBorder}` }}
      >
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
            Preferences
          </p>
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fff3e0' }}>
            💱
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Currency</span>
            <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>All expenses in this group</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
            <span className="font-medium">{currencyCode}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>

        <div className="px-4 py-3.5" style={{ borderTop: `0.5px solid ${sectionDivider}` }}>
          <p className="text-xs font-medium mb-2.5" style={{ color: mutedLabel }}>Default split type</p>
          <div
            className="flex p-[3px] rounded-[10px]"
            style={{ backgroundColor: pageBg }}
          >
            {[
              { id: 'EQUAL' as const, label: 'Equal' },
              { id: 'PERCENTAGE' as const, label: 'Percentage' },
              { id: 'FIXED' as const, label: 'Exact amounts' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => onSplitTypeChange(type.id)}
                className="flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all"
                style={{
                  backgroundColor: splitType === type.id ? 'white' : 'transparent',
                  color: splitType === type.id ? purple : '#8a86a5',
                  boxShadow: splitType === type.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <GroupFeaturesSection
          requireApproval={requireApproval}
          simplifyDebts={simplifyDebts}
          onToggleRequireApproval={onToggleRequireApproval}
          onToggleSimplifyDebts={onToggleSimplifyDebts}
          sectionDivider={sectionDivider}
          purple={purple}
          mutedLabel={mutedLabel}
        />
      </motion.div>
    </>
  );
}
