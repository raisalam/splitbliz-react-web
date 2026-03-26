import React from 'react';
import { motion } from 'motion/react';
import { Pencil } from 'lucide-react';

type ProfileAvatarSectionProps = {
  displayName: string;
  avatar: string;
  purple: string;
  onEdit: () => void;
};

export function ProfileAvatarSection({
  displayName,
  avatar,
  purple,
  onEdit
}: ProfileAvatarSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl pt-6 pb-6 flex flex-col items-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${purple}, #a29bfe)` }}
    >
      <div className="relative mb-3">
        <button
          onClick={onEdit}
          className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 text-3xl font-bold text-white bg-white/20"
          style={{ border: '3px solid rgba(255,255,255,0.5)' }}
        >
          {avatar.length === 1 && avatar !== 'R' ? avatar : avatar === 'R' ? displayName.charAt(0).toUpperCase() : avatar}
        </button>
        <button
          onClick={onEdit}
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
        >
          <Pencil className="w-3 h-3" style={{ color: purple }} />
        </button>
      </div>

      <p className="text-white font-bold mb-2.5" style={{ fontSize: '20px', lineHeight: 1 }}>{displayName}</p>

      <button
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-xs text-white font-medium transition-colors hover:bg-white/25 active:scale-95"
        style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <span>✏️</span> Edit profile info
      </button>
    </motion.div>
  );
}
