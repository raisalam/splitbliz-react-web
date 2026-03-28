import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from '../../../constants/icons';
import { GroupListItem } from '../../../components/GroupListItem';
import type { Group } from '../../../types';

type SelectGroupSheetProps = {
  origin: 'expense' | 'settle' | null;
  groups: Group[];
  onClose: () => void;
  onSelectGroup: (groupId: string) => void;
  getNet: (group: Group) => number;
};

export function SelectGroupSheet({
  origin,
  groups,
  onClose,
  onSelectGroup,
  getNet,
}: SelectGroupSheetProps) {
  if (!origin) return null;

  const visibleGroups = origin === 'settle'
    ? groups.filter(g => getNet(g) < 0)
    : groups;

  return (
    <AnimatePresence>
      {origin && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col sm:max-w-xl sm:mx-auto"
          >
            <div className="pt-4 pb-2 px-6 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Select Group
                </h3>
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1 pb-4">
                Where would you like to {origin === 'expense' ? 'add an expense' : 'settle up'}?
              </p>
            </div>

            <div className="pb-12 pt-2 overflow-y-auto custom-scrollbar">
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                {visibleGroups.map((group, index) => (
                  <GroupListItem
                    key={group.id}
                    group={group}
                    index={index}
                    onClick={() => onSelectGroup(group.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
