import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { MOCK_USER_ID } from '../../api/groups';
import { InviteMemberSheet } from '../../components/InviteMemberSheet';
import { GroupInfoSection } from './components/GroupInfoSection';
import { MemberManagementSection } from './components/MemberManagementSection';
import { DangerZoneSection } from './components/DangerZoneSection';

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

        <GroupInfoSection
          groupName={groupName}
          selectedEmoji={selectedEmoji}
          splitType={splitType}
          onGroupNameChange={setGroupName}
          onEmojiClick={() => setActiveSheet('EMOJI')}
          onSplitTypeChange={setSplitType}
          requireApproval={requireApproval}
          simplifyDebts={simplifyDebts}
          onToggleRequireApproval={() => setRequireApproval(!requireApproval)}
          onToggleSimplifyDebts={() => setSimplifyDebts(!simplifyDebts)}
          purple={purple}
          pageBg={pageBg}
          cardBorder={cardBorder}
          sectionDivider={sectionDivider}
          mutedLabel={mutedLabel}
        />

                   </div>
        <MemberManagementSection
          visibleMembers={visibleMembers}
          totalMembers={totalMembers}
          showAllMembers={showAllMembers}
          onShowAllMembers={() => setShowAllMembers(true)}
          onInvite={() => setInviteSheetOpen(true)}
          onMemberAction={(memberId) => {
            setSelectedMemberId(memberId);
            setActiveSheet('MEMBER_ACTION');
          }}
          getRoleBadge={getRoleBadge}
          avatarColors={AVATAR_COLORS}
          currentUserId={MOCK_USER_ID}
          mutedLabel={mutedLabel}
          purple={purple}
          sectionDivider={sectionDivider}
          pageBg={pageBg}
          cardBorder={cardBorder}
        />

        <DangerZoneSection
          leaveError={leaveError}
          onLeave={() => setLeaveError(true)}
          onDelete={() => setActiveSheet('DELETE_CONFIRM')}
          sectionDivider={sectionDivider}
          cardBorder={cardBorder}
          mutedLabel={mutedLabel}
        />

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
