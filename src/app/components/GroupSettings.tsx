import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, Pencil, X, MoreHorizontal, UserPlus } from 'lucide-react';
import { MOCK_USER_ID } from '../../api/groups';
import { InviteMemberSheet } from './ui/InviteMemberSheet';

// 7-column emoji grid (same as CreateGroup)
const EMOJI_GRID = [
  '✈️', '🏠', '🍕', '⚽', '🎉', '💼', '💑', '📂',
  '🚗', '🏝️', '🗺️', '🏖️', '⛰️', '🏕️', '🚅', '🧳',
  '🍔', '🍣', '🍷', '☕', '🌮', '🍻', '🍽️', '🍦',
  '🛋️', '🛒', '🔌', '🛁', '🧹', '💡', '🔑', '📺',
  '🎈', '🎊', '🎁', '🕺', '🥳', '🎤', '🎶', '🎫',
  '🏀', '🏈', '🎾', '🏓', '🏸', '🥊', '🏋️', '🏄',
  '💻', '📊', '📋', '📅', '📞', '🏢', '👔', '📝',
  '👥', '🤝', '🙌', '💪', '🔥', '✨', '🚀', '🎯',
];

// Mock data — 10 members
const MOCK_GROUP = {
  publicId: 'g-trip-goa',
  name: 'Goa Trip 2026',
  emoji: '✈️',
  planTierCode: 'PRO',
  currencyCode: 'INR',
  members: [
    { userPublicId: 'u0-0', displayName: 'Rais', role: 'OWNER' },
    { userPublicId: 'u0-1', displayName: 'Aman', role: 'ADMIN' },
    { userPublicId: 'u0-2', displayName: 'Neha', role: 'MEMBER' },
    { userPublicId: 'u0-3', displayName: 'Sarah', role: 'MEMBER' },
    { userPublicId: 'u0-4', displayName: 'John', role: 'MEMBER' },
    { userPublicId: 'u0-5', displayName: 'Emma', role: 'MEMBER' },
    { userPublicId: 'u0-6', displayName: 'Arjun', role: 'MEMBER' },
    { userPublicId: 'u0-7', displayName: 'Priya', role: 'MEMBER' },
    { userPublicId: 'u0-8', displayName: 'Karan', role: 'MEMBER' },
    { userPublicId: 'u0-9', displayName: 'Divya', role: 'MEMBER' },
  ]
};

// Unique avatar colors per member index
const AVATAR_COLORS = [
  '#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e',
  '#e84393', '#00cec9', '#d63031', '#a29bfe', '#55efc4',
];

type BottomSheet = 'NONE' | 'EMOJI' | 'MEMBER_ACTION' | 'DELETE_CONFIRM';

export function GroupSettings() {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [groupName, setGroupName] = useState(MOCK_GROUP.name);
  const [selectedEmoji, setSelectedEmoji] = useState(MOCK_GROUP.emoji);
  const [splitType, setSplitType] = useState<'EQUAL' | 'PERCENTAGE' | 'EXACT'>('EQUAL');
  const [requireApproval, setRequireApproval] = useState(true);
  const [simplifyDebts, setSimplifyDebts] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [activeSheet, setActiveSheet] = useState<BottomSheet>('NONE');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  // Design tokens from spec
  const purple = '#6c5ce7';
  const pageBg = '#f4f2fb';
  const cardBorder = '#e8e4f8';
  const sectionDivider = '#f0eeff';
  const mutedLabel = '#9490b8';
  const headerBorder = '#e0ddf5';

  const visibleMembers = showAllMembers ? MOCK_GROUP.members : MOCK_GROUP.members.slice(0, 4);
  const totalMembers = MOCK_GROUP.members.length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return { bg: '#ede9ff', color: purple, label: 'Owner' };
      case 'ADMIN':
        return { bg: '#e1f5ee', color: '#0f6e56', label: 'Admin' };
      default:
        return { bg: '#f4f2fb', color: '#9490b8', label: 'Member' };
    }
  };

  const selectedMember = MOCK_GROUP.members.find(m => m.userPublicId === selectedMemberId);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: pageBg }}>

      {/* Top Bar */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md"
        style={{ borderBottom: `0.5px solid ${headerBorder}` }}
      >
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#f0eeff' }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: purple }} />
          </button>
          <span className="font-semibold" style={{ fontSize: '16px', color: '#1a1625' }}>Group settings</span>
          <button
            className="px-3.5 py-1.5 rounded-[20px] text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#ede9ff', color: purple }}
          >
            Save
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-5 space-y-4">

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex items-center gap-5"
          style={{ background: `linear-gradient(135deg, ${purple}, #a29bfe)` }}
        >
          {/* Icon Circle with edit badge */}
          <div className="relative shrink-0">
            <button
              onClick={() => setActiveSheet('EMOJI')}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2.5px solid rgba(255,255,255,0.45)',
              }}
            >
              <span className="text-3xl" style={{ lineHeight: 1 }}>{selectedEmoji}</span>
            </button>
            {/* Edit badge */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer"
              onClick={() => setActiveSheet('EMOJI')}
            >
              <Pencil className="w-3 h-3" style={{ color: purple }} />
            </div>
          </div>

          {/* Group Name Input */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>Group name</p>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-transparent text-white outline-none pb-1"
              style={{
                fontSize: '18px',
                fontWeight: 700,
                borderBottom: '1.5px solid rgba(255,255,255,0.45)',
              }}
            />
            {/* PRO badge */}
            <div className="mt-2">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.4)',
                }}
              >
                ★ PRO
              </span>
            </div>
          </div>
        </motion.div>

        {/* Preferences Card */}
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

          {/* Currency Row */}
          <button className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fff3e0' }}>
              💱
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold" style={{ color: '#1a1625' }}>Currency</span>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>All expenses in this group</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
              <span className="font-medium">₹ INR</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Default Split Type */}
          <div className="px-4 py-3.5" style={{ borderTop: `0.5px solid ${sectionDivider}` }}>
            <p className="text-xs font-medium mb-2.5" style={{ color: mutedLabel }}>Default split type</p>
            <div
              className="flex p-[3px] rounded-[10px]"
              style={{ backgroundColor: pageBg }}
            >
              {[
                { id: 'EQUAL' as const, label: 'Equal' },
                { id: 'PERCENTAGE' as const, label: 'Percentage' },
                { id: 'EXACT' as const, label: 'Exact amounts' },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setSplitType(type.id)}
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

          {/* Require Settlement Approval Toggle */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Require settlement approval</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Members must confirm before marking paid</p>
            </div>
            <button
              onClick={() => setRequireApproval(!requireApproval)}
              className="w-11 h-6 rounded-full transition-colors relative shrink-0"
              style={{ backgroundColor: requireApproval ? purple : '#d4d0e8' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
                style={{ left: requireApproval ? '22px' : '2px' }}
              />
            </button>
          </div>

          {/* Simplify Debts Toggle */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Simplify debts</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Minimize total number of transactions</p>
            </div>
            <button
              onClick={() => setSimplifyDebts(!simplifyDebts)}
              className="w-11 h-6 rounded-full transition-colors relative shrink-0"
              style={{ backgroundColor: simplifyDebts ? purple : '#d4d0e8' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
                style={{ left: simplifyDebts ? '22px' : '2px' }}
              />
            </button>
          </div>
        </motion.div>

        {/* Members Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Members · {totalMembers}
            </p>
            <button
              onClick={() => setInviteSheetOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ backgroundColor: '#ede9ff', color: purple }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite
            </button>
          </div>

          {/* Member Rows */}
          <div>
            {visibleMembers.map((member, idx) => {
              const isCurrentUser = member.userPublicId === MOCK_USER_ID || member.displayName === 'Rais';
              const isOwner = member.role === 'OWNER';
              const badge = getRoleBadge(member.role);
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

              return (
                <div
                  key={member.userPublicId}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderTop: `0.5px solid ${sectionDivider}` }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {member.displayName.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + Role */}
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

                  {/* Role badge */}
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-1 rounded-md shrink-0"
                    style={{ backgroundColor: badge.bg, color: badge.color }}
                  >
                    {badge.label}
                  </span>

                  {/* Action button — hidden for current user and owner */}
                  {!isCurrentUser && !isOwner ? (
                    <button
                      onClick={() => {
                        setSelectedMemberId(member.userPublicId);
                        setActiveSheet('MEMBER_ACTION');
                      }}
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

          {/* View All row */}
          {!showAllMembers && totalMembers > 4 && (
            <button
              onClick={() => setShowAllMembers(true)}
              className="w-full py-3 text-center text-sm font-semibold transition-colors hover:bg-slate-50/50"
              style={{ color: purple, borderTop: `0.5px solid ${sectionDivider}` }}
            >
              View all {totalMembers} members ›
            </button>
          )}
        </motion.div>

        {/* Group Actions Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Group Actions
            </p>
          </div>

          {/* Archive Group */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#f0f0f0' }}>
              🗄️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#3d3a4a' }}>Archive group</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Hide from active groups. Can be restored.</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>

          {/* Leave Group */}
          <button
            onClick={() => setLeaveError(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fff3e0' }}>
              🚪
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#e65100' }}>Leave group</p>
              {leaveError ? (
                <p className="text-[11px] mt-0.5 text-red-500 font-medium">Settle your balance first</p>
              ) : (
                <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>You must be fully settled to leave.</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>

          {/* Delete Group */}
          <button
            onClick={() => setActiveSheet('DELETE_CONFIRM')}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-red-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#ffebee' }}>
              🗑️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#e24b4a' }}>Delete group</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Permanently deletes all expenses. Cannot be undone.</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>
        </motion.div>

        <div className="h-8" />
      </main>

      {/* Bottom Sheets */}
      <AnimatePresence>
        {activeSheet !== 'NONE' && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveSheet('NONE')}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: activeSheet === 'EMOJI' ? '70vh' : 'auto' }}
            >
              {/* Sheet Header */}
              <div className="pt-4 pb-3 px-6 flex flex-col items-center" style={{ borderBottom: `0.5px solid ${sectionDivider}` }}>
                <div className="w-10 h-1.5 rounded-full mb-4" style={{ backgroundColor: '#e0dced' }} />
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-bold" style={{ color: '#1a1625' }}>
                    {activeSheet === 'EMOJI' && 'Pick an icon'}
                    {activeSheet === 'MEMBER_ACTION' && (selectedMember?.displayName || 'Member')}
                    {activeSheet === 'DELETE_CONFIRM' && 'Delete group?'}
                  </h3>
                  <button
                    onClick={() => setActiveSheet('NONE')}
                    className="p-2 rounded-full transition-colors"
                    style={{ backgroundColor: pageBg }}
                  >
                    <X className="w-4 h-4" style={{ color: mutedLabel }} />
                  </button>
                </div>
              </div>

              {/* EMOJI GRID */}
              {activeSheet === 'EMOJI' && (
                <div className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
                  <div className="grid grid-cols-7 gap-2">
                    {EMOJI_GRID.map((emoji, idx) => (
                      <button
                        key={`${emoji}-${idx}`}
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setActiveSheet('NONE');
                        }}
                        className="aspect-square flex items-center justify-center rounded-xl text-2xl transition-all hover:scale-110 active:scale-95"
                        style={{
                          backgroundColor: selectedEmoji === emoji ? '#ede8ff' : '#f8f7fc',
                          border: selectedEmoji === emoji ? `2px solid ${purple}` : '1px solid transparent',
                        }}
                      >
                        <span style={{ lineHeight: 1 }}>{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MEMBER ACTION SHEET */}
              {activeSheet === 'MEMBER_ACTION' && (
                <div className="px-5 py-4 space-y-2">
                  <button
                    onClick={() => setActiveSheet('NONE')}
                    className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-slate-50"
                    style={{ color: '#1a1625' }}
                  >
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="text-sm font-semibold">Make admin</p>
                      <p className="text-[11px]" style={{ color: mutedLabel }}>Grant admin privileges</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveSheet('NONE')}
                    className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-red-50"
                  >
                    <span className="text-lg">🚫</span>
                    <div>
                      <p className="text-sm font-semibold text-red-600">Remove from group</p>
                      <p className="text-[11px]" style={{ color: mutedLabel }}>Member will lose access</p>
                    </div>
                  </button>
                  <div className="h-4" />
                </div>
              )}

              {/* DELETE CONFIRMATION SHEET */}
              {activeSheet === 'DELETE_CONFIRM' && (
                <div className="px-5 py-5">
                  <p className="text-sm mb-6" style={{ color: mutedLabel }}>
                    This will permanently delete <strong style={{ color: '#1a1625' }}>{groupName}</strong> and all its expenses. This action cannot be undone.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveSheet('NONE');
                        navigate('/');
                      }}
                      className="w-full py-3.5 rounded-[14px] font-bold text-white text-sm transition-all active:scale-[0.98]"
                      style={{ backgroundColor: '#e24b4a' }}
                    >
                      Delete group
                    </button>
                    <button
                      onClick={() => setActiveSheet('NONE')}
                      className="w-full py-3.5 rounded-[14px] font-semibold text-sm transition-all active:scale-[0.98]"
                      style={{ backgroundColor: pageBg, color: mutedLabel }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="h-4" />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <InviteMemberSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        groupId={groupId || MOCK_GROUP.publicId}
      />

    </div>
  );
}
