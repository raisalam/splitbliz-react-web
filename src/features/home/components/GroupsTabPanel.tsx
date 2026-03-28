import React from 'react';
import { motion } from 'motion/react';
import { Search } from '../../../constants/icons';
import { EmptyState } from '../../../components/EmptyState';
import { GroupCard } from './GroupCard';
import type { Group } from '../../../types';

type GroupsTabPanelProps = {
  groups: Group[];
  filteredGroups: Group[];
  onCreateGroup: () => void;
  onSelectGroup: (groupId: string) => void;
};

export function GroupsTabPanel({
  groups,
  filteredGroups,
  onCreateGroup,
  onSelectGroup,
}: GroupsTabPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {groups.length === 0 ? (
        <EmptyState
          title="No groups yet"
          description="Create your first group to start splitting expenses."
          action={{ label: 'Create group', onClick: onCreateGroup }}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {filteredGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              index={index}
              onClick={() => onSelectGroup(group.id)}
            />
          ))}

          {filteredGroups.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">No groups found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your search query.
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
