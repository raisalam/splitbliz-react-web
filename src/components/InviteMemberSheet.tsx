import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link } from 'lucide-react';
import { toast } from 'sonner';
import { colors } from '../constants/colors';
import { groupsService } from '../services';

interface InviteMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
}

export function InviteMemberSheet({ open, onOpenChange, groupId }: InviteMemberSheetProps) {
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !groupId) return;
    setLoading(true);
    groupsService.generateInvite(groupId)
      .then((invite) => setInviteLink(invite.inviteUrl))
      .catch(() => toast.error('Failed to generate invite link.'))
      .finally(() => setLoading(false));
  }, [open, groupId]);

  const handleClose = () => {
    onOpenChange(false);
    setInviteLink('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(inviteLink);
      toast.success('Invite link copied');
    } catch {
      toast.error('Failed to copy link');
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
            style={{ maxHeight: '60vh' }}
          >
            <div className="pt-4 pb-3 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ede9ff' }}>
                  <Link className="w-4 h-4" style={{ color: colors.primary }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                  Invite members
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
              <div className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600 break-all">
                {loading ? 'Generating invite link...' : (inviteLink || 'Invite link not available')}
              </div>
              <button
                onClick={handleCopy}
                disabled={!inviteLink}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ backgroundColor: colors.primary }}
              >
                Copy invite link
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
