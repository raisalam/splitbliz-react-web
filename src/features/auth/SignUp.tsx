import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/onboarding/profile');
  };

  const handleGoogleAuth = () => {
    navigate('/onboarding/profile'); // Google on Sign Up always goes to Screen 4
  };

  return (
    <div className="min-h-screen bg-[#f4f2fb] flex flex-col font-sans">
      
      {/* Hero Header */}
      <div 
        className="pt-12 pb-16 px-6 relative rounded-b-[24px]"
        style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}
      >
        <button 
          onClick={() => navigate('/welcome')}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 mb-6 transition-transform hover:scale-105 active:scale-95 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-bold text-[24px] mb-1">
          Create account ✨
        </h1>
        <p className="text-white/80 text-[13px] font-medium">
          Join SplitBliz — it's free
        </p>
      </div>

      {/* Main Form Body */}
      <div className="flex-1 px-4 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[14px] p-6 shadow-sm"
          style={{ border: '0.5px solid #e8e4f8' }}
        >
          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* Full Name Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#3d3a4a] ml-1">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#9490b8]" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aman Sharma"
                  className="w-full pl-10 pr-4 py-3 text-[13px] font-medium text-[#1a1625] rounded-[9px] outline-none transition-all placeholder:text-[#b8b4d8]"
                  style={{ backgroundColor: '#f4f2fb', border: '1.5px solid #e8e4f8' }}
                  onFocus={(e) => e.target.style.borderColor = '#6c5ce7'}
                  onBlur={(e) => e.target.style.borderColor = '#e8e4f8'}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#3d3a4a] ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#9490b8]" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 text-[13px] font-medium text-[#1a1625] rounded-[9px] outline-none transition-all placeholder:text-[#b8b4d8]"
                  style={{ backgroundColor: '#f4f2fb', border: '1.5px solid #e8e4f8' }}
                  onFocus={(e) => e.target.style.borderColor = '#6c5ce7'}
                  onBlur={(e) => e.target.style.borderColor = '#e8e4f8'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 pb-2">
              <label className="text-[12px] font-bold text-[#3d3a4a] ml-1 flex justify-between">
                <span>Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#9490b8]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-3 text-[13px] font-medium text-[#1a1625] rounded-[9px] outline-none transition-all placeholder:text-[#b8b4d8]"
                  style={{ backgroundColor: '#f4f2fb', border: '1.5px solid #e8e4f8' }}
                  onFocus={(e) => e.target.style.borderColor = '#6c5ce7'}
                  onBlur={(e) => e.target.style.borderColor = '#e8e4f8'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9490b8] hover:text-[#6c5ce7] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-[12px] text-white font-bold text-[13px] transition-transform active:scale-[0.98] shadow-md shadow-indigo-600/20"
              style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}
            >
              Create account →
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-[#e8e4f8]" />
            <span className="relative bg-white px-3 text-[11px] font-semibold text-[#9490b8]">
              or continue with
            </span>
          </div>

          {/* Google Auth */}
          <button
            onClick={handleGoogleAuth}
            className="w-full py-3 rounded-[12px] bg-white flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98]"
            style={{ border: '1.5px solid #e8e4f8' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-semibold text-[#1a1625]" style={{ fontSize: '11px' }}>Google</span>
          </button>
        </motion.div>

        {/* Swap Link */}
        <div className="mt-8 text-center pb-8">
          <p className="text-[12px] font-medium text-[#9490b8]">
            Have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="font-bold text-[#6c5ce7] hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
