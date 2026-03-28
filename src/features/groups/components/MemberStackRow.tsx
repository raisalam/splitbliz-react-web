import React from 'react';
import { Plus } from '../../../constants/icons';
import { MemberAvatar } from './MemberAvatar';
import type { GroupMember } from '../../../types';

type MemberStackRowProps = {
  members: GroupMember[];
  onShowAll: () => void;
  onInvite: () => void;
};

export function MemberStackRow({ members, onShowAll, onInvite }: MemberStackRowProps) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <div className="flex items-center">
        <div
          className="flex items-center cursor-pointer relative"
          onClick={onShowAll}
        >
          {members.slice(0, 5).map((member, i) => (
            <div
              key={member.userId}
              className="relative hover:-translate-y-1 transition-transform"
              style={{ zIndex: 10 - i, marginLeft: i === 0 ? 0 : '-10px' }}
            >
              <MemberAvatar
                member={member}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 dark:border-slate-950"
              />
            </div>
          ))}
          {members.length > 5 && (
            <div
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-950 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 relative hover:-translate-y-1 transition-transform"
              style={{ zIndex: 5, marginLeft: '-10px' }}
            >
              +{members.length - 5}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-3" />

        <button
          onClick={onInvite}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Invite
        </button>
      </div>
    </div>
  );
}
