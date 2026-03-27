import React from 'react';
import { motion } from 'motion/react';
import { GroupAvatar } from '../../../components/GroupAvatar';
import { GROUP_TYPE_EMOJI } from '../../../constants/app';
import type { Group } from '../../../types';

type StoriesRowProps = {
  groups: Group[];
  onSelectGroup: (groupId: string) => void;
  getNet: (group: Group) => number;
};

export function StoriesRow({ groups, onSelectGroup, getNet }: StoriesRowProps) {
  return (
    <div className="mb-8">
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
        {groups.map((group, i) => {
          const shortName = group.name.split(' ')[0].slice(0, 8);
          const emoji = GROUP_TYPE_EMOJI[group.groupType] ?? GROUP_TYPE_EMOJI['OTHER'];
          const hasActivity = getNet(group) !== 0;
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              onClick={() => onSelectGroup(group.id)}
              className="flex flex-col items-center gap-2 cursor-pointer snap-start shrink-0"
            >
              <GroupAvatar name={group.name} emoji={emoji} size="sm" hasActivity={hasActivity} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 text-center truncate">
                {shortName}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
