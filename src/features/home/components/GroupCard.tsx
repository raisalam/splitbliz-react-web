import React from 'react';
import { GroupListItem, GroupListItemProps } from '../../../components/GroupListItem';

type GroupCardProps = Pick<GroupListItemProps, 'group' | 'index' | 'onClick'>;

export function GroupCard({ group, index, onClick }: GroupCardProps) {
  return (
    <GroupListItem
      group={group}
      index={index}
      onClick={onClick}
    />
  );
}
