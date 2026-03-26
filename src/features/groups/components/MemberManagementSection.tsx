import React from 'react';
import { MoreHorizontal, UserPlus } from 'lucide-react';

type MemberManagementSectionProps = {
  visibleMembers: any[];
  totalMembers: number;
  showAllMembers: boolean;
  onShowAllMembers: () => void;
  onInvite: () => void;
  onMemberAction: (memberId: string) => void;
  getRoleBadge: (role: string) => { bg: string; color: string; label: string };
  avatarColors: string[];
  currentUserId: string;
  mutedLabel: string;
  purple: string;
  sectionDivider: string;
  pageBg: string;
  cardBorder: string;
};

export function MemberManagementSection({
  visibleMembers,
  totalMembers,
  showAllMembers,
  onShowAllMembers,
  onInvite,
  onMemberAction,
  getRoleBadge,
  avatarColors,
  currentUserId,
  mutedLabel,
  purple,
  sectionDivider,
  pageBg,
  cardBorder
}: MemberManagementSectionProps) {
  return (
    <div
      className="rounded-[14px] bg-white overflow-hidden"
      style={{ border: `0.5px solid ${cardBorder}` }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
          Members · {totalMembers}
        </p>
        <button
          onClick={onInvite}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
          style={{ backgroundColor: '#ede9ff', color: purple }}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite
        </button>
      </div>

      <div>
        {visibleMembers.map((member, idx) => {
          const isCurrentUser = member.userPublicId === currentUserId || member.displayName === 'Rais';
          const isOwner = member.role === 'OWNER';
          const badge = getRoleBadge(member.role);
          const avatarColor = avatarColors[idx % avatarColors.length];

          return (
            <div
              key={member.userPublicId}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: `0.5px solid ${sectionDivider}` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                style={{ backgroundColor: avatarColor }}
              >
                {member.displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate" style={{ color: '#1a1625' }}>
                    {member.displayName}
                  </span>
                  {isCurrentUser && (
                    <span className="text-xs" style={{ color: mutedLabel }}>(You)</span>
                  )}
                </div>
                <p className="text-[11px]" style={{ color: mutedLabel }}>
                  {member.role === 'OWNER' ? 'Group Owner' : member.role === 'ADMIN' ? 'Group Admin' : 'Member'}
                </p>
              </div>

              <span
                className="text-[10px] font-bold uppercase px-2 py-1 rounded-md shrink-0"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {badge.label}
              </span>

              {!isCurrentUser && !isOwner ? (
                <button
                  onClick={() => onMemberAction(member.userPublicId)}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-slate-100"
                  style={{ backgroundColor: pageBg }}
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: mutedLabel }} />
                </button>
              ) : (
                <div className="w-7" />
              )}
            </div>
          );
        })}
      </div>

      {!showAllMembers && totalMembers > 4 && (
        <button
          onClick={onShowAllMembers}
          className="w-full py-3 text-center text-sm font-semibold transition-colors hover:bg-slate-50/50"
          style={{ color: purple, borderTop: `0.5px solid ${sectionDivider}` }}
        >
          View all {totalMembers} members ›
        </button>
      )}
    </div>
  );
}
