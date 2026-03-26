import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeProvider';
import { ArrowLeft, ChevronRight, Pencil, X, LogOut, Trash2, Lock } from 'lucide-react';
import { toast } from 'sonner';

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

  // State
  const [activeSheet, setActiveSheet] = useState<BottomSheet>('NONE');
  const [displayName, setDisplayName] = useState('Rais');
  const [email, setEmail] = useState('rais@example.com');
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
  const purple = '#6c5ce7';
  const pageBg = '#f4f2fb';
  const cardBorder = '#e8e4f8';
  const sectionDivider = '#f0eeff';
  const mutedLabel = '#9490b8';
  const headerBorder = '#e0ddf5';

  // Handlers
  const handleOpenEdit = (sheet: BottomSheet, initialValue: string = '') => {
    setTempValue(initialValue);
    setActiveSheet(sheet);
  };

  const handleSaveEdit = () => {
    if (activeSheet === 'EDIT_NAME') setDisplayName(tempValue);
    setActiveSheet('NONE');
    toast.success('Profile updated');
  };

  const handleDelete = () => {
    setActiveSheet('NONE');
    toast.success('Account deleted');
    navigate('/');
  };

  // Generic Toggle UI
  const ToggleRow = ({ label, subtitle, checked, onChange }: { label: string, subtitle: string, checked: boolean, onChange: () => void }) => (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderTop: `0.5px solid ${sectionDivider}` }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>{label}</p>
        <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>{subtitle}</p>
      </div>
      <button
        onClick={onChange}
        className="w-11 h-6 rounded-full transition-colors relative shrink-0"
        style={{ backgroundColor: checked ? purple : '#d0cbe8' }}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all"
          style={{ left: checked ? '22px' : '2px' }}
        />
      </button>
    </div>
  );

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
          <span className="font-semibold" style={{ fontSize: '16px', color: '#1a1625' }}>Profile & Settings</span>
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
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl pt-6 pb-6 flex flex-col items-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${purple}, #a29bfe)` }}
        >
          {/* Avatar Stack */}
          <div className="relative mb-3">
            <button
              onClick={() => setActiveSheet('EDIT_HERO')}
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 text-3xl font-bold text-white bg-white/20"
              style={{ border: '3px solid rgba(255,255,255,0.5)' }}
            >
              {avatar.length === 1 && avatar !== 'R' ? avatar : avatar === 'R' ? displayName.charAt(0).toUpperCase() : avatar}
            </button>
            <button
              onClick={() => setActiveSheet('EDIT_HERO')}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
            >
              <Pencil className="w-3 h-3" style={{ color: purple }} />
            </button>
          </div>

          <p className="text-white font-bold mb-2.5" style={{ fontSize: '20px', lineHeight: 1 }}>{displayName}</p>

          <button
            onClick={() => setActiveSheet('EDIT_HERO')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-xs text-white font-medium transition-colors hover:bg-white/25 active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <span>✏️</span> Edit profile info
          </button>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[14px] bg-white p-4"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: '#faeeda' }}
              >
                ⚡
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: '#1a1625' }}>Free Plan</p>
                <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Basic features for personal use</p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded-[20px] text-xs font-bold text-white transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${purple}, #a29bfe)` }}
            >
              Upgrade to PRO
            </button>
          </div>

          {/* Usage Bars */}
          <div className="space-y-3.5">
            {/* Bar 1 */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span style={{ color: '#1a1625' }}>Active groups</span>
                <span style={{ color: purple }}>3 / 5</span>
              </div>
              <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: '#f0eeff' }}>
                <div className="h-full rounded-full" style={{ width: '60%', background: `linear-gradient(90deg, ${purple}, #a29bfe)` }} />
              </div>
            </div>
            {/* Bar 2 */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span style={{ color: '#1a1625' }}>Monthly expenses</span>
                <span style={{ color: purple }}>8 / 20</span>
              </div>
              <div className="h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: '#f0eeff' }}>
                <div className="h-full rounded-full" style={{ width: '40%', background: 'linear-gradient(90deg, #1d9e75, #5dcaa5)' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Profile
            </p>
          </div>

          <button
            onClick={() => handleOpenEdit('EDIT_NAME', displayName)}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#f0eeff' }}>
              👤
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Display name</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>{displayName}</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>

          <div
            className="w-full flex items-center gap-3 px-4 py-3.5"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#e3f2fd' }}>
              📧
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Email address</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>
                {email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp1 + '*'.repeat(gp2.length))}
              </p>
            </div>
            <Lock className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </div>
        </motion.div>

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
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Google</p>
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
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Phone number</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Not connected</p>
            </div>
            <button className="text-xs font-semibold" style={{ color: purple }}>Connect</button>
          </div>
        </motion.div>

        {/* Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Preferences
            </p>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#faeeda' }}>
              💱
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Default currency</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Used when creating new groups</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
              <span className="font-medium">₹ INR</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#f0eeff' }}>
              🌐
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#1a1625' }}>Language</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm" style={{ color: mutedLabel }}>
              <span className="font-medium">English</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <ToggleRow
            label="Dark mode"
            subtitle="Switch between light and dark themes"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </motion.div>

        {/* Notifications Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-[14px] bg-white overflow-hidden"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Notifications
            </p>
          </div>

          <div style={{ borderTop: `none` }}>
            <ToggleRow label="Push notifications" subtitle="Stay updated on the go" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
            <ToggleRow label="Settlement requests" subtitle="When someone requests a payout" checked={settlementReqs} onChange={() => setSettlementReqs(!settlementReqs)} />
            <ToggleRow label="New expenses" subtitle="When a member logs an expense" checked={newExpenses} onChange={() => setNewExpenses(!newExpenses)} />
            <ToggleRow label="Email summaries" subtitle="Weekly activity reports" checked={emailSummaries} onChange={() => setEmailSummaries(!emailSummaries)} />
            <ToggleRow label="Reminders" subtitle="Nudges for unsettled balances" checked={reminders} onChange={() => setReminders(!reminders)} />
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[14px] bg-white overflow-hidden mb-8"
          style={{ border: `0.5px solid ${cardBorder}` }}
        >
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em]" style={{ color: mutedLabel }}>
              Account
            </p>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/50">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#faeeda' }}>
              🚪
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#e65100' }}>Log out</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Sign out of this device</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>

          <button
            onClick={() => setActiveSheet('DELETE_CONFIRM')}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-red-50/50"
            style={{ borderTop: `0.5px solid ${sectionDivider}` }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-sm" style={{ backgroundColor: '#fceaea' }}>
              🗑️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold" style={{ color: '#e24b4a' }}>Delete account</p>
              <p className="text-[11px] mt-0.5" style={{ color: mutedLabel }}>Permanently removes all your data</p>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: mutedLabel }} />
          </button>
        </motion.div>

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
                    <h3 className="text-lg font-bold" style={{ color: '#1a1625' }}>
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
                    style={{ borderBottomColor: purple, color: '#1a1625' }}
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
                    <h3 className="text-lg font-bold" style={{ color: '#1a1625' }}>
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
