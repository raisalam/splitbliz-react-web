import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Check, Users } from 'lucide-react';
import { MOCK_GROUPS, MOCK_USER_ID } from '../../../mock/groups';
import { toast } from 'sonner';

// Design tokens
const purple = '#6c5ce7';
const pageBg = '#f4f2fb';
const sectionDivider = '#f0eeff';
const mutedLabel = '#9490b8';

// Unique avatar colors
const AVATAR_COLORS = [
  '#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e',
  '#e84393', '#00cec9', '#d63031', '#a29bfe', '#55efc4',
  '#636e72', '#ffeaa7', '#fab1a0', '#74b9ff', '#81ecec',
];

interface InviteMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
}

interface Suggestion {
  id: string;
  name: string;
  fromGroup: string;
  alreadyInGroup: boolean;
  avatarColorIndex: number;
}

export function InviteMemberSheet({ open, onOpenChange, groupId }: InviteMemberSheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);

  // Compute smart suggestions: members from other groups not in this group
  const suggestions = useMemo<Suggestion[]>(() => {
    const currentGroup = MOCK_GROUPS.find(g => g.publicId === groupId) || MOCK_GROUPS[0];
    const currentMemberIds = new Set(currentGroup.members.map(m => m.userPublicId));

    const seen = new Set<string>();
    const result: Suggestion[] = [];

    MOCK_GROUPS.forEach(group => {
      if (group.publicId === currentGroup.publicId) return;
      group.members.forEach((member, mIdx) => {
        if (member.userPublicId === MOCK_USER_ID) return; // Skip self
        if (seen.has(member.userPublicId)) return;
        seen.add(member.userPublicId);

        result.push({
          id: member.userPublicId,
          name: member.displayName,
          fromGroup: group.name,
          alreadyInGroup: currentMemberIds.has(member.userPublicId),
          avatarColorIndex: result.length,
        });
      });
    });

    // Sort: available first, then already-in-group
    return result.sort((a, b) => Number(a.alreadyInGroup) - Number(b.alreadyInGroup));
  }, [groupId]);

  const filteredSuggestions = suggestions.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.fromGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedIds(new Set());
    setSearchQuery('');
    setSearchFocused(false);
  };

  const handleSendInvites = () => {
    if (selectedIds.size === 0) return;
    toast.success(`${selectedIds.size} invite${selectedIds.size > 1 ? 's' : ''} sent!`);
    handleClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://splitbliz.app/invite/abc123');
    toast.success('Link copied');
  };

  const selectedSuggestions = suggestions.filter(s => selectedIds.has(s.id));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Drag Handle */}
            <div className="pt-3 flex justify-center">
              <div className="w-9 h-1 rounded-full" style={{ backgroundColor: '#e0ddf5' }} />
            </div>

            {/* Header */}
            <div className="px-5 pt-3 pb-3 flex items-center gap-3">
              <div
                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: '#ede9ff' }}
              >
                👥
              </div>
              <h3 className="flex-1 font-bold" style={{ fontSize: '15px', color: '#1a1625' }}>
                Invite members
              </h3>
              <button
                onClick={handleClose}
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: pageBg }}
              >
                <X className="w-3.5 h-3.5" style={{ color: mutedLabel }} />
              </button>
            </div>

            {/* Selected Pills Strip */}
            <AnimatePresence>
              {selectedSuggestions.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-2 flex gap-2 flex-wrap">
                    {selectedSuggestions.map(s => {
                      const color = AVATAR_COLORS[s.avatarColorIndex % AVATAR_COLORS.length];
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="flex items-center gap-1.5 py-1 pl-1 pr-2 rounded-[20px]"
                          style={{ backgroundColor: '#ede9ff' }}
                        >
                          <div
                            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium" style={{ color: purple }}>{s.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSelection(s.id); }}
                            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-purple-200/50 transition-colors"
                          >
                            <X className="w-3 h-3" style={{ color: purple }} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            <div className="px-5 pb-3">
              <div
                className="relative rounded-[12px] transition-all"
                style={{
                  backgroundColor: searchFocused ? 'white' : pageBg,
                  border: searchFocused ? `1.5px solid ${purple}` : '1.5px solid transparent',
                }}
              >
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: mutedLabel }} />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full bg-transparent text-sm outline-none py-2.5 pl-10 pr-4"
                  style={{ color: '#1a1625' }}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 pb-24 hide-scrollbar">
              {/* Section label */}
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] mb-2" style={{ color: mutedLabel }}>
                {searchQuery ? 'Results' : 'Smart Suggestions'}
              </p>

              <div className="space-y-1">
                {filteredSuggestions.map((suggestion) => {
                  const isSelected = selectedIds.has(suggestion.id);
                  const color = AVATAR_COLORS[suggestion.avatarColorIndex % AVATAR_COLORS.length];

                  if (suggestion.alreadyInGroup) {
                    // Already in group row — non-tappable, dimmed
                    return (
                      <div
                        key={suggestion.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ opacity: 0.5 }}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {suggestion.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate" style={{ color: '#1a1625' }}>{suggestion.name}</p>
                          <p className="text-[11px]" style={{ color: mutedLabel }}>From {suggestion.fromGroup}</p>
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase px-2 py-1 rounded-md shrink-0"
                          style={{ backgroundColor: pageBg, color: mutedLabel }}
                        >
                          In group
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={suggestion.id}
                      onClick={() => toggleSelection(suggestion.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.99]"
                      style={{ backgroundColor: isSelected ? '#f5f3ff' : 'transparent' }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {suggestion.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[13px] font-semibold truncate" style={{ color: '#1a1625' }}>{suggestion.name}</p>
                        <p className="text-[11px]" style={{ color: mutedLabel }}>From {suggestion.fromGroup}</p>
                      </div>
                      {/* Check circle */}
                      <div
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          backgroundColor: isSelected ? purple : 'transparent',
                          border: isSelected ? 'none' : '1.5px solid #d0cbe8',
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}

                {/* Empty state */}
                {filteredSuggestions.length === 0 && (
                  <div className="text-center py-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: pageBg }}
                    >
                      <Users className="w-6 h-6" style={{ color: mutedLabel }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: mutedLabel }}>
                      No users found matching "{searchQuery}"
                    </p>
                  </div>
                )}

                {/* Invite via link — always pinned at bottom */}
                <div style={{ borderTop: `0.5px solid ${sectionDivider}`, marginTop: '8px', paddingTop: '8px' }}>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-purple-50/50 active:scale-[0.99]"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0"
                      style={{ backgroundColor: '#ede9ff' }}
                    >
                      🔗
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[13px] font-semibold" style={{ color: purple }}>Invite via link</p>
                      <p className="text-[11px]" style={{ color: mutedLabel }}>Share a link — works even if they're not on SplitBliz yet</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
              <div className="pointer-events-auto">
                <button
                  disabled={selectedIds.size === 0}
                  onClick={handleSendInvites}
                  className="w-full py-3.5 rounded-[14px] font-bold text-sm transition-all active:scale-[0.98]"
                  style={{
                    background: selectedIds.size > 0
                      ? `linear-gradient(135deg, ${purple}, #a29bfe)`
                      : pageBg,
                    color: selectedIds.size > 0 ? 'white' : '#b8b4d8',
                    boxShadow: selectedIds.size > 0 ? '0 6px 20px rgba(108,92,231,0.3)' : 'none',
                    cursor: selectedIds.size > 0 ? 'pointer' : 'default',
                  }}
                >
                  {selectedIds.size > 0
                    ? `Send ${selectedIds.size} invite${selectedIds.size > 1 ? 's' : ''}`
                    : 'Select members to invite'
                  }
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
