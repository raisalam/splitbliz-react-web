import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Check, X, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { MOCK_USER_ID } from '../../api/groups';

// 35+ emojis for the picker grid
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

const GROUP_TYPES = [
  { id: 'trip', label: 'Trip', emoji: '✈️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'event', label: 'Event', emoji: '🎉' },
  { id: 'office', label: 'Office', emoji: '💼' },
  { id: 'couple', label: 'Couple', emoji: '💑' },
  { id: 'other', label: 'Other', emoji: '📂' },
];

export function CreateGroup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [groupName, setGroupName] = useState('');
  const [groupNamePlaceholder, setGroupNamePlaceholder] = useState('Enter group name...');
  const [selectedEmoji, setSelectedEmoji] = useState('👥');
  const [emojiSheetOpen, setEmojiSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('trip');
  const [requireApproval, setRequireApproval] = useState(true);
  const [simplifyDebts, setSimplifyDebts] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [members, setMembers] = useState<{ id: string; name: string; isAdmin?: boolean }[]>([
    { id: MOCK_USER_ID, name: 'Rais', isAdmin: true }
  ]);

  // Pre-fill from URL parameters if available (used by Onboarding Intent Picker)
  useEffect(() => {
    const emojiParam = searchParams.get('emoji');
    const typeParam = searchParams.get('type');
    const placeholderParam = searchParams.get('placeholder');

    if (emojiParam) setSelectedEmoji(emojiParam);
    if (typeParam) setSelectedType(typeParam);
    if (placeholderParam) setGroupNamePlaceholder(placeholderParam);
  }, [searchParams]);

  const addMember = () => {
    if (!newMemberName.trim()) return;
    setMembers(prev => [...prev, { id: `m-${Date.now()}`, name: newMemberName.trim() }]);
    setNewMemberName('');
  };

  const removeMember = (id: string) => {
    if (id === MOCK_USER_ID) return; // Can't remove yourself
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const handleCreate = () => {
    navigate('/');
  };

  // Colors from the spec
  const purple = '#6c5ce7';
  const pageBg = '#f4f2fb';
  const cardBorder = '#e8e4f8';
  const sectionDivider = '#f0eeff';
  const mutedLabel = '#9490b8';

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: pageBg }}>

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md" style={{ borderBottom: `0.5px solid ${cardBorder}` }}>
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: '#ede8ff' }}
          >
            <ArrowLeft className="w-4.5 h-4.5" style={{ color: purple }} />
          </button>
          <h1 className="font-bold text-lg" style={{ color: '#1a1625' }}>Create group</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex items-center gap-5"
          style={{ background: `linear-gradient(135deg, ${purple}, #a29bfe)` }}
        >
          {/* Emoji Icon Picker */}
          <button
            onClick={() => setEmojiSheetOpen(true)}
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110 active:scale-95"
            style={{ border: '2px dashed rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <span className="text-3xl" style={{ lineHeight: 1 }}>{selectedEmoji}</span>
          </button>

          {/* Group Name Input */}
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Group name</p>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={groupNamePlaceholder}
              autoFocus
              className="w-full bg-transparent text-white text-xl font-bold placeholder:text-white/40 outline-none pb-1"
              style={{ borderBottom: '1.5px solid rgba(255,255,255,0.4)' }}
            />
          </div>
        </motion.div>

        {/* Group Type Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[14px] p-4 bg-white"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] mb-3" style={{ color: mutedLabel }}>
            Group Type
          </p>
          <div className="grid grid-cols-4 gap-2">
            {GROUP_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{
                  backgroundColor: selectedType === type.id ? '#ede8ff' : '#f8f7fc',
                  border: selectedType === type.id ? `1.5px solid ${purple}` : '1.5px solid #e8e4f8',
                  color: selectedType === type.id ? purple : '#6b6588',
                }}
              >
                <span className="text-lg">{type.emoji}</span>
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
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
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Members
            </p>
          </div>

          {/* Member rows */}
          <div>
            {members.map((member, idx) => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderTop: idx > 0 ? `0.5px solid ${sectionDivider}` : 'none' }}
              >
                {/* Avatar circle */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                  style={{ backgroundColor: member.isAdmin ? purple : '#a29bfe' }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate" style={{ color: '#1a1625' }}>
                      {member.name}
                    </span>
                    {member.isAdmin && (
                      <span className="text-[10px] text-slate-400">(you)</span>
                    )}
                    {member.isAdmin && (
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: '#ede8ff', color: purple }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                {!member.isAdmin && (
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add member input row */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: `0.5px solid ${sectionDivider}` }}>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addMember(); }}
                placeholder="Enter name or phone / email…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 py-1"
                style={{ color: '#1a1625' }}
              />
            </div>
            <button
              onClick={addMember}
              disabled={!newMemberName.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-40"
              style={{ backgroundColor: purple }}
            >
              Add
            </button>
          </div>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Settings
            </p>
          </div>

          {/* Currency Row */}
          <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/50 transition-colors">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#e8f5e9' }}>
              💰
            </div>
            <span className="flex-1 text-left text-sm font-semibold" style={{ color: '#1a1625' }}>Currency</span>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
              <span className="font-medium">₹ INR</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Default Split Row */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50/50 transition-colors"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#e3f2fd' }}>
              ⚖️
            </div>
            <span className="flex-1 text-left text-sm font-semibold" style={{ color: '#1a1625' }}>Default split</span>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
              <span className="font-medium">Equal</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Require Settlement Approval Toggle */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fff3e0' }}>
              🔒
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Require settlement approval</p>
              <p className="text-xs mt-0.5" style={{ color: mutedLabel }}>Settlements need admin approval before being applied</p>
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
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#e8eaf6' }}>
              🔄
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Simplify debts</p>
              <p className="text-xs mt-0.5" style={{ color: mutedLabel }}>Automatically combine multiple debts between members</p>
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

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-2 pb-8"
        >
          <button
            disabled={!groupName.trim()}
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[14px] font-bold text-base text-white transition-all active:scale-[0.98] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: groupName.trim() ? `linear-gradient(135deg, ${purple}, #a29bfe)` : '#d4d0e8',
              boxShadow: groupName.trim() ? '0 8px 24px rgba(108,92,231,0.3)' : 'none',
            }}
          >
            <Check className="w-5 h-5" />
            Create group
          </button>
        </motion.div>

      </main>

      {/* Emoji Picker Bottom Sheet */}
      <AnimatePresence>
        {emojiSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEmojiSheetOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '70vh' }}
            >
              {/* Sheet Header */}
              <div className="pt-4 pb-3 px-6 flex flex-col items-center" style={{ borderBottom: `0.5px solid ${sectionDivider}` }}>
                <div className="w-10 h-1.5 rounded-full mb-4" style={{ backgroundColor: '#e0dced' }} />
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-bold" style={{ color: '#1a1625' }}>Pick an icon</h3>
                  <button
                    onClick={() => setEmojiSheetOpen(false)}
                    className="p-2 rounded-full transition-colors"
                    style={{ backgroundColor: '#f4f2fb' }}
                  >
                    <X className="w-4 h-4" style={{ color: mutedLabel }} />
                  </button>
                </div>
              </div>

              {/* 7-column Emoji Grid */}
              <div className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
                <div className="grid grid-cols-7 gap-2">
                  {EMOJI_GRID.map((emoji, idx) => (
                    <button
                      key={`${emoji}-${idx}`}
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setEmojiSheetOpen(false);
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
