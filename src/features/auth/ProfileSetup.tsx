import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { Pencil, X } from 'lucide-react';
import { colors } from '../../constants/colors';

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

export function ProfileSetup() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState('🙂');
  const [displayName, setDisplayName] = useState('Aman Sharma');
  const [showEmojiSheet, setShowEmojiSheet] = useState(false);

  const handleUploadPhoto = () => {
    // Demo implementation
  };

  const handleContinue = () => {
    navigate('/onboarding/group');
  };

  const purple = colors.primary;
  const pageBg = colors.pageBg;
  const cardBorder = '#e8e4f8';
  const muted = colors.textMuted;

  return (
    <div className="min-h-screen font-sans relative flex flex-col" style={{ backgroundColor: pageBg }}>
      
      {/* Mini Progress Header */}
      <div 
        className="px-6 py-5 flex items-center justify-between shadow-sm z-10"
        style={{ background: `linear-gradient(135deg, ${purple}, ${colors.primaryLight})` }}
      >
        <span className="text-white font-bold tracking-wide" style={{ fontSize: '15px' }}>
          Step 1 of 2
        </span>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-5 rounded-full bg-white shadow-sm" />
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 px-6 pt-10 pb-10 flex flex-col max-w-md w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="font-extrabold mb-3" style={{ fontSize: '28px', color: colors.textPrimary, lineHeight: '1.2' }}>
            Set up your profile
          </h2>
          <p className="font-medium px-4" style={{ fontSize: '15px', color: muted, lineHeight: '1.4' }}>
            Choose an avatar or upload a photo
          </p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="relative mb-5">
            <button
              onClick={() => setShowEmojiSheet(true)}
              className="rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 bg-white shadow-md relative"
              style={{ 
                width: '100px',
                height: '100px',
                backgroundColor: '#ede9ff', 
                border: `3px dashed ${colors.primaryLight}`,
              }}
            >
              <span style={{ fontSize: '50px', lineHeight: 1 }}>{avatar}</span>
            </button>
            <div
              className="absolute bottom-0 right-[-4px] rounded-full bg-white flex items-center justify-center shadow-lg pointer-events-none"
              style={{ width: '32px', height: '32px', border: '2px solid white' }}
            >
              <Pencil className="w-4 h-4" style={{ color: purple }} />
            </div>
          </div>
          <span className="uppercase tracking-widest font-bold mb-7" style={{ fontSize: '11px', color: '#b8b4d8' }}>
            Tap to change
          </span>

          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => setShowEmojiSheet(true)}
              className="flex-1 py-4 rounded-[14px] font-bold transition-all active:scale-[0.98] shadow-sm hover:bg-white"
              style={{ backgroundColor: '#fff', border: `1.5px solid ${cardBorder}`, color: purple, fontSize: '15px' }}
            >
              Choose emoji
            </button>
            <button
              onClick={handleUploadPhoto}
              className="flex-1 py-4 rounded-[14px] font-bold transition-all active:scale-[0.98] shadow-sm hover:bg-white"
              style={{ backgroundColor: '#fff', border: `1.5px solid ${cardBorder}`, color: purple, fontSize: '15px' }}
            >
              Upload photo
            </button>
          </div>
        </motion.div>

        {/* Display Name Field */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-2 mb-auto"
        >
          <label className="text-[14px] font-bold text-[#1a1625] ml-1">
            Display name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-5 py-4 text-[15px] font-bold text-[#1a1625] rounded-[14px] outline-none transition-all placeholder:text-[#b8b4d8] bg-white shadow-sm"
            style={{ border: `1.5px solid ${cardBorder}` }}
            onFocus={(e) => e.target.style.borderColor = purple}
            onBlur={(e) => e.target.style.borderColor = cardBorder}
          />
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 flex flex-col gap-5 pt-4"
        >
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-[14px] font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/25"
            style={{ background: `linear-gradient(135deg, ${purple}, ${colors.primaryLight})`, fontSize: '16px' }}
          >
            Continue →
          </button>
          <button
            onClick={() => navigate('/onboarding/group')}
            className="w-full py-2 font-bold text-center transition-colors hover:text-[#3d3a4a]"
            style={{ color: muted, fontSize: '14px' }}
          >
            Skip for now
          </button>
        </motion.div>
      </div>

      {/* Emoji Sheet */}
      <AnimatePresence>
        {showEmojiSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEmojiSheet(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[28px] shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              <div className="px-6 py-5" style={{ borderBottom: `1px solid ${colors.primaryFaint}` }}>
                <div className="flex justify-center mb-5">
                  <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: '#e0dced' }} />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-[20px] font-extrabold" style={{ color: colors.textPrimary }}>
                    Pick an icon
                  </h3>
                  <button onClick={() => setShowEmojiSheet(false)} className="p-2.5 rounded-full transition-colors bg-[#f4f2fb] hover:bg-[#ede9ff]">
                    <X className="w-5 h-5" style={{ color: muted }} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
                <div className="grid grid-cols-7 gap-3">
                  {EMOJI_GRID.map((emoji, idx) => (
                    <button
                      key={`${emoji}-${idx}`}
                      onClick={() => {
                        setAvatar(emoji);
                        setShowEmojiSheet(false);
                      }}
                      className="aspect-square flex items-center justify-center rounded-xl text-3xl transition-all hover:scale-110 active:scale-95"
                      style={{
                        backgroundColor: avatar === emoji ? '#ede8ff' : '#f8f7fc',
                        border: avatar === emoji ? `2px solid ${purple}` : '1.5px solid transparent',
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
