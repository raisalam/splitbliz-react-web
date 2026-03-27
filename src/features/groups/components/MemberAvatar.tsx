import React from 'react';
import { CachedAvatar } from '../../../components/CachedAvatar';

type MemberAvatarProps = {
  member: any;
  className: string;
};

function getInitial(name?: string | null) {
  return name?.trim()?.[0]?.toUpperCase() || '?';
}

export function MemberAvatar({ member, className }: MemberAvatarProps) {
  const avatarValue = member?.resolvedAvatar || member?.avatarUrl || null;
  const isAvatarUrl = typeof avatarValue === 'string' && avatarValue.startsWith('http');
  const fallbackInitials = getInitial(member?.displayName);

  if (isAvatarUrl) {
    return (
      <CachedAvatar
        src={avatarValue}
        alt={member?.displayName}
        fallbackInitials={fallbackInitials}
        className={className}
      />
    );
  }

  return (
    <div className={`${className} flex items-center justify-center font-bold text-slate-700 bg-slate-200`}>
      {avatarValue || fallbackInitials}
    </div>
  );
}
