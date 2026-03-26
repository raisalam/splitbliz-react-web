import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { ProfileAvatarSection } from './components/ProfileAvatarSection';
import { ProfileInfoSection } from './components/ProfileInfoSection';
import { NotificationToggles } from './components/NotificationToggles';
import { PreferencesSection } from './components/PreferencesSection';
import { AccountActionsSection } from './components/AccountActionsSection';
import { colors } from '../../constants/colors';
import { useUser } from '../../providers/UserContext';

// 7-column emoji grid
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

// Type for active bottom sheet
type BottomSheet = 'NONE' | 'EDIT_HERO' | 'EDIT_NAME' | 'DELETE_CONFIRM';

export function ProfileSettings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useUser();

  // State
  const [activeSheet, setActiveSheet] = useState<BottomSheet>('NONE');
  const [avatar, setAvatar] = useState('R'); // Default to initial
  
  // Notification Toggles
  const [pushNotifs, setPushNotifs] = useState(true);
  const [settlementReqs, setSettlementReqs] = useState(true);
  const [newExpenses, setNewExpenses] = useState(true);
  const [emailSummaries, setEmailSummaries] = useState(true);
  const [reminders, setReminders] = useState(false);

  // Edit Sheet State
  const [tempValue, setTempValue] = useState('');

  // Design tokens
  const purple = colors.primary;
  const pageBg = colors.pageBg;
  const cardBorder = '#e8e4f8';
  const sectionDivider = colors.primaryFaint;
  const mutedLabel = colors.textMuted;
  const headerBorder = colors.border;

  // Handlers
  const handleOpenEdit = (sheet: BottomSheet, initialValue: string = '') => {
    setTempValue(initialValue);
    setActiveSheet(sheet);
  };

  const handleSaveEdit = () => {
    if (activeSheet === 'EDIT_NAME') {
      setUser(user ? { ...user, displayName: tempValue } : user);
    }
    setActiveSheet('NONE');
    toast.success('Profile updated');
  };

  const handleDelete = () => {
    setActiveSheet('NONE');
    toast.success('Account deleted');
    navigate('/');
  };

  const displayName = user?.displayName ?? '';
  const email = user?.email ?? '';

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
          <span className="font-semibold text-base" style={{ color: colors.textPrimary }}>Profile & Settings</span>
          <button
            onClick={() => navigate(-1)}
            className="px-3.5 py-1.5 rounded-[20px] text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#ede9ff', color: purple }}
          >
            Save
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <ProfileAvatarSection
          displayName={displayName}
          avatar={avatar}
          purple={purple}
          onEdit={() => setActiveSheet('EDIT_HERO')}
        />

        <AccountActionsSection
          variant="plan"
          purple={purple}
          mutedLabel={mutedLabel}
          cardBorder={cardBorder}
          sectionDivider={sectionDivider}
          onDeleteAccount={() => setActiveSheet('DELETE_CONFIRM')}
        />

        <ProfileInfoSection
          displayName={displayName}
          email={email}
          mutedLabel={mutedLabel}
          cardBorder={cardBorder}
          sectionDivider={sectionDivider}
          onEditName={() => handleOpenEdit('EDIT_NAME', displayName)}
        />

        {/* Connected Accounts Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Connected Accounts
            </p>
          </div>

          <div className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center font-bold text-white shrink-0" style={{ backgroundColor: '#ea4335' }}>
              G
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Google</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>{email}</p>
            </div>
            <button className="text-xs font-semibold" style={{ color: '#e24b4a' }}>Disconnect</button>
          </div>

          <div
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: '#f0f0f0' }}>
              📱
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Phone number</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Not connected</p>
            </div>
            <button className="text-xs font-semibold" style={{ color: purple }}>Connect</button>
          </div>
        </motion.div>

        <PreferencesSection
          theme={theme}
          onToggleTheme={toggleTheme}
          cardBorder={cardBorder}
          sectionDivider={sectionDivider}
          mutedLabel={mutedLabel}
          purple={purple}
        />

        <NotificationToggles
          pushNotifs={pushNotifs}
          settlementReqs={settlementReqs}
          newExpenses={newExpenses}
          emailSummaries={emailSummaries}
          reminders={reminders}
          onTogglePush={() => setPushNotifs(!pushNotifs)}
          onToggleSettlement={() => setSettlementReqs(!settlementReqs)}
          onToggleExpenses={() => setNewExpenses(!newExpenses)}
          onToggleSummaries={() => setEmailSummaries(!emailSummaries)}
          onToggleReminders={() => setReminders(!reminders)}
          cardBorder={cardBorder}
          sectionDivider={sectionDivider}
          mutedLabel={mutedLabel}
          purple={purple}
        />

        <AccountActionsSection
          variant="account"
          purple={purple}
          mutedLabel={mutedLabel}
          cardBorder={cardBorder}
          sectionDivider={sectionDivider}
          onDeleteAccount={() => setActiveSheet('DELETE_CONFIRM')}
        />

        <div className="h-6" />
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
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[24px] shadow-2xl overflow-hidden flex flex-col pt-3"
            >
              {activeSheet === 'EDIT_NAME' && (
                <div className="px-5 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-9 h-1 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      Edit profile
                    </h3>
                    <button onClick={() => setActiveSheet('NONE')} className="p-2 rounded-full bg-slate-100">
                      <X className="w-4 h-4" style={{ color: mutedLabel }} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    autoFocus
                    className="w-full text-lg font-semibold bg-transparent border-b-2 py-3 outline-none"
                    style={{ borderBottomColor: purple, color: colors.textPrimary }}
                    placeholder="Enter value"
                  />
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => setActiveSheet('NONE')}
                      className="flex-1 py-3.5 rounded-xl font-semibold"
                      style={{ backgroundColor: pageBg, color: mutedLabel }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!tempValue.trim()}
                      className="flex-1 py-3.5 rounded-xl font-bold text-white transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: purple }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              {activeSheet === 'EDIT_HERO' && (
                <div className="px-5 pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-9 h-1 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      Pick an icon
                    </h3>
                    <button onClick={() => setActiveSheet('NONE')} className="p-2 rounded-full bg-slate-100">
                      <X className="w-4 h-4" style={{ color: mutedLabel }} />
                    </button>
                  </div>

                  <div className="h-[50vh] overflow-y-auto px-1 py-2 hide-scrollbar">
                    <div className="grid grid-cols-7 gap-2">
                      {/* Avatar initial reset button */}
                      <button
                        onClick={() => {
                          setAvatar('R');
                          setActiveSheet('NONE');
                        }}
                        className="aspect-square flex items-center justify-center rounded-xl text-lg font-bold text-white transition-all hover:scale-110 active:scale-95"
                        style={{
                          backgroundColor: purple,
                          border: avatar === 'R' ? `3px solid rgba(108,92,231,0.3)` : '1px solid transparent',
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </button>

                      {EMOJI_GRID.map((emoji, idx) => (
                        <button
                          key={`${emoji}-${idx}`}
                          onClick={() => {
                            setAvatar(emoji);
                            setActiveSheet('NONE');
                          }}
                          className="aspect-square flex items-center justify-center rounded-xl text-2xl transition-all hover:scale-110 active:scale-95"
                          style={{
                            backgroundColor: avatar === emoji ? '#ede8ff' : '#f8f7fc',
                            border: avatar === emoji ? `2px solid ${purple}` : '1px solid transparent',
                          }}
                        >
                          <span style={{ lineHeight: 1 }}>{emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <button
                        onClick={() => {
                          toast.success('Upload dialog opened');
                          setActiveSheet('NONE');
                        }}
                        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
                        style={{ backgroundColor: pageBg, color: purple }}
                      >
                        Upload custom image
                      </button>
                  </div>
                </div>
              )}

              {activeSheet === 'DELETE_CONFIRM' && (
                <div className="px-5 py-6">
                  <h3 className="text-xl font-bold text-red-600 mb-2">Delete account?</h3>
                  <p className="text-sm shadow-sm mb-6" style={{ color: mutedLabel }}>
                    This will permanently delete your account, remove you from all groups, and erase all your data. This action cannot be undone.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleDelete}
                      className="w-full py-3.5 rounded-xl font-bold text-white transition-transform active:scale-98"
                      style={{ backgroundColor: '#e24b4a' }}
                    >
                      Yes, delete my account
                    </button>
                    <button
                      onClick={() => setActiveSheet('NONE')}
                      className="w-full py-3.5 rounded-xl font-semibold transition-transform active:scale-98"
                      style={{ backgroundColor: pageBg, color: mutedLabel }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
