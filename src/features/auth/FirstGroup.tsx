import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, createSearchParams } from 'react-router';
import { colors } from '../../constants/colors';

// 6 Intents for Screen 4
const INTENTS = [
  { id: 'trip', label: 'A trip', emoji: '✈️', placeholder: "e.g. Bali Trip 2026" },
  { id: 'home', label: 'Home expenses', emoji: '🏠', placeholder: "e.g. 123 Main St" },
  { id: 'food', label: 'Food & dining', emoji: '🍕', placeholder: "e.g. Weekend Dinners" },
  { id: 'event', label: 'An event', emoji: '🎉', placeholder: "e.g. Sarah's Birthday" },
  { id: 'office', label: 'Office / work', emoji: '💼', placeholder: "e.g. Lunch runs" },
  { id: 'other', label: 'Something else', emoji: '📂', placeholder: "e.g. Shared Expenses" },
];

export function FirstGroup() {
  const navigate = useNavigate();
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  const handleCreate = () => {
    if (!selectedIntent) return;
    const intent = INTENTS.find(i => i.id === selectedIntent);
    if (!intent) return;
    
    // Navigate to create group screen with pre-filled details in the URL
    navigate({
      pathname: '/group/new',
      search: createSearchParams({
        emoji: intent.emoji,
        type: intent.id,
        placeholder: intent.placeholder
      }).toString()
    });
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
          Step 2 of 2
        </span>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.35)' }} />
          <div className="h-2 w-5 rounded-full bg-white shadow-sm" />
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 px-6 pt-10 pb-10 flex flex-col max-w-md w-full mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8"
        >
          <h2 className="font-extrabold mb-3" style={{ fontSize: '28px', color: colors.textPrimary, lineHeight: '1.2' }}>
            What are you splitting?
          </h2>
          <p className="font-medium px-4" style={{ fontSize: '15px', color: muted, lineHeight: '1.4' }}>
            We'll set up your first group — tap to choose
          </p>
        </motion.div>

        {/* Intent Cards Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-auto"
        >
          {INTENTS.map((intent) => {
            const isSelected = selectedIntent === intent.id;
            return (
              <button
                key={intent.id}
                onClick={() => setSelectedIntent(intent.id)}
                className="flex flex-col items-center justify-center p-6 rounded-[16px] transition-all active:scale-95"
                style={{
                  backgroundColor: isSelected ? '#ede9ff' : '#fff',
                  border: isSelected ? `2px solid ${purple}` : `1.5px solid ${cardBorder}`,
                  boxShadow: isSelected ? `0 4px 12px ${colors.overlay10}` : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <span className="text-[32px] mb-3 leading-none transition-transform duration-300" style={{ transform: isSelected ? 'scale(1.15)' : 'scale(1)' }}>
                  {intent.emoji}
                </span>
                <span className="font-bold text-center" style={{ fontSize: '14px', color: isSelected ? purple : '#3d3a4a' }}>
                  {intent.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 flex flex-col gap-5 pt-4"
        >
          <button
            onClick={handleCreate}
            disabled={!selectedIntent}
            className="w-full py-4 rounded-[14px] font-bold text-white transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
            style={{ 
              background: selectedIntent ? `linear-gradient(135deg, ${purple}, ${colors.primaryLight})` : '#d4d0e8', 
              fontSize: '16px',
              boxShadow: selectedIntent ? `0 8px 24px ${colors.overlay25}` : 'none'
            }}
          >
            Set up this group →
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 font-bold text-center transition-colors hover:text-[#3d3a4a] group"
            style={{ color: muted, fontSize: '14px' }}
          >
            Skip, go to home <span className="group-hover:translate-x-1 inline-block transition-transform" style={{ color: purple }}>→</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
