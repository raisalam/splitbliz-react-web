import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export function Splash() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col justify-between p-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #4a3bb5, #6c5ce7, #a29bfe)' }}
    >
      <div className="flex-1 flex flex-col justify-center relative z-10 py-12 gap-8">
        
        {/* Section 1: App Icon */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-4"
        >
          <div 
            className="w-[88px] h-[88px] flex items-center justify-center text-[48px] shadow-2xl"
            style={{ 
              borderRadius: '24px', 
              backgroundColor: 'rgba(255,255,255,0.18)', 
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            ⚡
          </div>
        </motion.div>

        {/* Section 2: Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center px-4 mb-4"
        >
          <h1 className="text-white font-extrabold mb-4 leading-[1.15] tracking-tight text-[36px]">
            Split smarter,<br />not harder.
          </h1>
          <p className="font-medium text-[16px] leading-[1.5]" style={{ color: 'rgba(255,255,255,0.85)' }}>
            The easiest way to track and settle<br />shared expenses.
          </p>
        </motion.div>

        {/* Section 3: Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-4 flex flex-col items-center max-w-[280px] mx-auto mb-8"
        >
          {[
            { icon: '🧾', text: 'Track group expenses' },
            { icon: '⚖️', text: 'Auto split & settle up' },
            { icon: '🔔', text: 'Get notified instantly' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
              className="w-full flex items-center gap-4 px-5 py-3.5 backdrop-blur-md shadow-sm"
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '14px',
                border: '1.5px solid rgba(255,255,255,0.1)'
              }}
            >
              <span className="text-[22px] leading-none">{feature.icon}</span>
              <span className="text-white font-semibold text-[15px]">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Section 4: CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4 flex flex-col items-center w-full max-w-[320px] mx-auto"
        >
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-[16px] bg-white transition-transform active:scale-[0.98] shadow-2xl font-extrabold text-[16px]"
            style={{ color: '#6c5ce7' }}
          >
            Get started →
          </button>
          <p className="mt-6 text-center font-medium leading-[1.5] text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
            By continuing you agree to our<br />Terms & Privacy Policy
          </p>
        </motion.div>

      </div>
    </div>
  );
}
