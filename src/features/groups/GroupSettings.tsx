import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { InviteMemberSheet } from '../../components/InviteMemberSheet';
import { GroupInfoSection } from './components/GroupInfoSection';
import { MemberManagementSection } from './components/MemberManagementSection';
import { DangerZoneSection } from './components/DangerZoneSection';
import { colors } from '../../constants/colors';
import { GROUP_TYPE_EMOJI } from '../../constants/app';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsService } from '../../services';
import { useUser } from '../../providers/UserContext';
import { toast } from 'sonner';

const GROUP_TYPES = [
  { id: 'TRIP', label: 'Trip' },
  { id: 'HOME', label: 'Home' },
  { id: 'FOOD', label: 'Food' },
  { id: 'OFFICE', label: 'Office' },
  { id: 'ENTERTAINMENT', label: 'Entertainment' },
  { id: 'SPORTS', label: 'Sports' },
  { id: 'SHOPPING', label: 'Shopping' },
  { id: 'OTHER', label: 'Other' },
];

// Unique avatar colors per member index
const AVATAR_COLORS = colors.avatarPalette;

type BottomSheet = 'NONE' | 'EMOJI' | 'MEMBER_ACTION' | 'DELETE_CONFIRM';

export function GroupSettings() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: ['groupSettings', groupId],
    queryFn: () => groupsService.getGroup(groupId || ''),
    enabled: !!groupId,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => groupsService.getMembers(groupId || ''),
    enabled: !!groupId,
  });

  const parsedConfig = useMemo(() => {
    const rawConfig = (group as any)?.configuration;
    if (!rawConfig) return {};
    try {
      return typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
    } catch {
      return {};
    }
  }, [group]);

  const [groupName, setGroupName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(GROUP_TYPE_EMOJI['OTHER']);
  const [selectedType, setSelectedType] = useState('TRIP');
  const [splitType, setSplitType] = useState<'EQUAL' | 'PERCENTAGE' | 'FIXED'>('EQUAL');
  const [requireApproval, setRequireApproval] = useState(true);
  const [simplifyDebts, setSimplifyDebts] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [activeSheet, setActiveSheet] = useState<BottomSheet>('NONE');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState(false);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  useEffect(() => {
    if (!group) return;
    setGroupName(group.name || '');
    setSelectedType((group as any).groupType || 'OTHER');
    setSelectedEmoji(GROUP_TYPE_EMOJI[(group as any).groupType] ?? GROUP_TYPE_EMOJI['OTHER']);
    setSplitType((parsedConfig?.defaultSplitType as any) || 'EQUAL');
    setRequireApproval(!!parsedConfig?.requireSettlementApproval);
    setSimplifyDebts(!!parsedConfig?.simplifyDebts);
  }, [group, parsedConfig]);

  // Design tokens from spec
  const purple = colors.primary;
  const pageBg = colors.pageBg;
  const cardBorder = '#e8e4f8';
  const sectionDivider = colors.primaryFaint;
  const mutedLabel = colors.textMuted;
  const headerBorder = colors.border;

  const visibleMembers = showAllMembers ? members : members.slice(0, 4);
  const totalMembers = members.length;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return { bg: '#ede9ff', color: purple, label: 'Owner' };
      case 'ADMIN':
        return { bg: colors.successLight, color: colors.success, label: 'Admin' };
      default:
        return { bg: colors.pageBg, color: colors.textMuted, label: 'Member' };
    }
  };

  const selectedMember = members.find((m: any) => m.userId === selectedMemberId);
  const currentUserId = user?.id || '';

  const handleSave = async () => {
    if (!groupId || !group) return;
    try {
      await groupsService.updateGroup(groupId, {
        name: groupName,
        groupType: selectedType,
        currencyCode: (group as any).currencyCode ?? 'INR',
        configuration: {
          defaultSplitType: splitType,
          requireSettlementApproval: requireApproval,
          simplifyDebts,
        },
        version: (group as any).version ?? 1,
      });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupSettings', groupId] });
      toast.success('Group settings updated');
    } catch {
      toast.error('Failed to update group');
    }
  };

  const handleMemberRole = async () => {
    if (!groupId || !selectedMember) return;
    const nextRole = selectedMember.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
    try {
      await groupsService.updateMemberRole(groupId, selectedMember.userId, nextRole);
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      setActiveSheet('NONE');
      toast.success('Member role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async () => {
    if (!groupId || !selectedMember) return;
    try {
      await groupsService.removeMember(groupId, selectedMember.userId);
      queryClient.invalidateQueries({ queryKey: ['groupMembers', groupId] });
      setActiveSheet('NONE');
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleLeave = async () => {
    if (!groupId || !currentUserId) return;
    try {
      await groupsService.removeMember(groupId, currentUserId);
      navigate('/');
    } catch {
      setLeaveError(true);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    try {
      await groupsService.deleteGroup(groupId);
      navigate('/');
    } catch {
      toast.error('Failed to delete group');
    }
  };

  if (groupLoading || membersLoading) {
    return (
      <div className="min-h-screen font-sans" style={{ backgroundColor: pageBg }} />
    );
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen font-sans flex items-center justify-center" style={{ backgroundColor: pageBg }}>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">Return to Home</button>
      </div>
    );
  }

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
            style={{ backgroundColor: colors.primaryFaint }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: purple }} />
          </button>
          <span className="font-semibold text-base" style={{ color: colors.textPrimary }}>Group settings</span>
          <button
            onClick={handleSave}
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
          currencyCode={(group as any).currencyCode ?? 'INR'}
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
          currentUserId={currentUserId}
          mutedLabel={mutedLabel}
          purple={purple}
          sectionDivider={sectionDivider}
          pageBg={pageBg}
          cardBorder={cardBorder}
        />

        <DangerZoneSection
          leaveError={leaveError}
          onLeave={handleLeave}
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
                  <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {activeSheet === 'EMOJI' && 'Pick a type'}
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

              {/* TYPE GRID */}
              {activeSheet === 'EMOJI' && (
                <div className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
                  <div className="grid grid-cols-4 gap-2">
                    {GROUP_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedType(type.id);
                          setSelectedEmoji(GROUP_TYPE_EMOJI[type.id] ?? GROUP_TYPE_EMOJI['OTHER']);
                          setActiveSheet('NONE');
                        }}
                        className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                        style={{
                          backgroundColor: selectedType === type.id ? '#ede8ff' : '#f8f7fc',
                          border: selectedType === type.id ? `1.5px solid ${purple}` : '1.5px solid #e8e4f8',
                          color: selectedType === type.id ? purple : '#6b6588',
                        }}
                      >
                        <span className="text-lg">{GROUP_TYPE_EMOJI[type.id] ?? GROUP_TYPE_EMOJI['OTHER']}</span>
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* MEMBER ACTION SHEET */}
              {activeSheet === 'MEMBER_ACTION' && (
                <div className="px-5 py-4 space-y-2">
                  <button
                    onClick={handleMemberRole}
                    className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-slate-50"
                    style={{ color: colors.textPrimary }}
                  >
                    <span className="text-lg">👑</span>
                    <div>
                      <p className="text-sm font-semibold">
                        {selectedMember?.role === 'ADMIN' ? 'Remove admin' : 'Make admin'}
                      </p>
                      <p className="text-[11px]" style={{ color: mutedLabel }}>Grant or revoke admin privileges</p>
                    </div>
                  </button>
                  <button
                    onClick={handleRemoveMember}
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
                    This will permanently delete <strong style={{ color: colors.textPrimary }}>{groupName}</strong> and all its expenses. This action cannot be undone.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleDeleteGroup}
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
        groupId={groupId}
      />

    </div>
  );
}
