import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { colors } from '../constants/colors';
import { authService } from '../services';
import type { UserContact } from '../types';
import { useAddMembers } from '../hooks/useGroupMutations';
import { CachedAvatar } from './CachedAvatar';

interface InviteMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
  existingMemberIds?: string[];
}

export function InviteMemberSheet({
  open,
  onOpenChange,
  groupId,
  existingMemberIds = [],
}: InviteMemberSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserContact[]>([]);
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());

  const addMembersMutation = useAddMembers();

  const existingIds = useMemo(() => new Set(existingMemberIds), [existingMemberIds]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setResults([]);
    setContacts([]);
    setSearching(false);
    setLoadingContacts(false);
    setAddingIds(new Set());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoadingContacts(true);
    authService.getContacts()
      .then((list) => {
        setContacts(list);
      })
      .catch(() => toast.error('Failed to load contacts.'))
      .finally(() => setLoadingContacts(false));
  }, [open, existingIds]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const timer = setTimeout(() => {
      setSearching(true);
      authService.searchUsers(trimmed)
        .then((users) => {
          setResults(users);
        })
        .catch(() => toast.error('Failed to search users.'))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [open, query, existingIds]);

  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
    setResults([]);
  };

  const handleAddMember = async (userId: string) => {
    if (!groupId) {
      toast.error('Group not found.');
      return;
    }
    if (addingIds.has(userId)) return;
    setAddingIds((prev) => new Set(prev).add(userId));
    try {
      await addMembersMutation.mutateAsync({
        groupId,
        userIds: [userId]
      });
      setResults((prev) => prev.filter((u) => u.userId !== userId));
      toast.success('Member added');
    } catch {
      toast.error('Failed to add member.');
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

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
            style={{ maxHeight: '70vh' }}
          >
            <div className="pt-4 pb-3 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ede9ff' }}>
                  <UserPlus className="w-4 h-4" style={{ color: colors.primary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  Add members
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full transition-colors"
                style={{ backgroundColor: colors.pageBg }}
              >
                <X className="w-4 h-4" style={{ color: colors.textMuted }} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {searching && (
                <div className="text-sm text-slate-500">Searching...</div>
              )}

              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <div className="text-sm text-slate-500">No users found.</div>
              )}

              <div className="space-y-2">
                {(query.trim().length >= 2 ? results : contacts).map((user) => {
                  const avatar = user.resolvedAvatar;
                  const fallbackInitial = user.displayName?.trim()?.[0]?.toUpperCase() || '?';
                  const isMember = existingIds.has(user.userId);
                  return (
                    <div key={user.userId} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {avatar && avatar.startsWith('http') ? (
                          <CachedAvatar
                            src={avatar}
                            alt={user.displayName}
                            fallbackInitials={fallbackInitial}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                            {avatar || fallbackInitial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{user.displayName}</p>
                          {user.email && (
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMember(user.userId)}
                        disabled={isMember || addingIds.has(user.userId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {isMember ? 'Member' : (addingIds.has(user.userId) ? 'Adding...' : 'Add')}
                      </button>
                    </div>
                  );
                })}
                {!searching && query.trim().length < 2 && !loadingContacts && contacts.length === 0 && (
                  <div className="text-sm text-slate-500">No contacts yet.</div>
                )}
                {loadingContacts && (
                  <div className="text-sm text-slate-500">Loading contacts...</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
