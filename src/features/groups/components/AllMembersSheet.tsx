import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, X } from '../../../constants/icons';
import { MemberAvatar } from './MemberAvatar';

type AllMembersSheetProps = {
  open: boolean;
  members: any[];
  currentUserId: string;
  onClose: () => void;
  onInvite: () => void;
};

export function AllMembersSheet({
  open,
  members,
  currentUserId,
  onClose,
  onInvite,
}: AllMembersSheetProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="pt-4 pb-2 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  All Members ({members.length})
                </h3>
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 pb-24 pt-4 overflow-y-auto space-y-3">
              {members.map((member: any) => {
                const isMe = member.userId === currentUserId;
                return (
                  <div key={member.userId} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <MemberAvatar member={member} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{member.displayName}</h4>
                        {isMe && <span className="text-xs text-slate-400">(You)</span>}
                        {member.role === 'OWNER' && (
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase">Owner</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-900 dark:via-slate-900 pointer-events-none">
              <div className="pointer-events-auto">
                <button
                  onClick={onInvite}
                  className="w-full py-3.5 rounded-2xl font-bold text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Invite Members
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
