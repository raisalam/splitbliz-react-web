import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, CheckCircle2 } from 'lucide-react';
import brandLogo from '../../assets/brand/logo.png';
import { colors } from '../../constants/colors';
import { authService } from '../../services';
import { extractApiError } from '../../services/apiClient';
import { useUser } from '../../providers/UserContext';

type AuthState = 'A' | 'B' | 'C';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();
  
  const [authState, setAuthState] = useState<AuthState>('A');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = email.includes('@') && email.includes('.');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return;
    setError(null);
    setLoading(true);
    try {
      const exists = await authService.checkEmail(email);
      if (exists) {
        setAuthState('B');
      } else {
        navigate('/signup', { state: { email } });
      }
    } catch (err) {
      setError('Unable to check email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authService.loginEmail({ email, password });
      setUser(user);
      navigate('/');
    } catch (err) {
      const apiErr = extractApiError(err);
      if (apiErr?.code === 'ERR_UNAUTHENTICATED') {
        setError('Incorrect email or password.');
      } else if (apiErr?.code === 'ERR_ACCOUNT_LOCKED_TEMP') {
        const seconds = apiErr.details?.retryAfterSeconds ?? 900;
        const minutes = Math.ceil(seconds / 60);
        setError(`Too many attempts. Try again in ${minutes} minutes.`);
      } else if (apiErr?.code === 'ERR_ACCOUNT_SUSPENDED') {
        setError('Your account has been suspended. Contact support.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await authService.register({
        email,
        password,
        displayName: name,
      });
      setUser(user);
      navigate('/onboarding/profile');
    } catch (err) {
      const apiErr = extractApiError(err);
      if (apiErr?.code === 'ERR_PROVIDER_MISMATCH') {
        setError('An account with this email already exists. Try logging in.');
      } else if (apiErr?.code === 'ERR_VALIDATION') {
        setError(apiErr.details?.fields?.[0]?.message ?? 'Please check your details.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/v1';
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = `${base}/auth/google?redirectUri=${encodeURIComponent(redirectUri)}`;
  };

  const handleBack = () => {
    if (authState === 'B' || authState === 'C') {
      setAuthState('A');
      setPassword('');
      setName('');
      setError(null);
      setLoading(false);
    } else {
      navigate('/welcome');
    }
  };

  useEffect(() => {
    const oauthError = (location.state as { oauthError?: string } | null)?.oauthError;
    if (oauthError) {
      setError('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 8) return 1; 
    const hasNumOrSym = /[0-9!@#$%^&*]/.test(password);
    if (!hasNumOrSym) return 2; 
    return 4; 
  };
  const strength = getPasswordStrength();

  const purple = colors.primary;
  const pageBg = colors.pageBg;
  const cardBorder = '#e8e4f8';
  const muted = colors.textMuted;

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: pageBg }}>
      
      {/* Hero Header */}
      <motion.div 
        layout
        className="pt-14 pb-20 px-6 relative rounded-b-[32px]"
        style={{ background: `linear-gradient(135deg, ${purple}, ${colors.primaryLight})` }}
      >
        <div className="flex justify-between items-start mb-8">
          <button 
            onClick={handleBack}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 transition-transform hover:scale-105 active:scale-95 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <motion.div layout>
            <img src={brandLogo} alt="Logo" className="w-12 h-12 object-contain drop-shadow-md" />
          </motion.div>
        </div>
        <motion.h1 layout="position" className="text-white font-extrabold mb-2" style={{ fontSize: '28px', lineHeight: '1.2' }}>
          {authState === 'A' && 'Welcome to SplitBliz ⚡'}
          {authState === 'B' && 'Welcome back 👋'}
          {authState === 'C' && 'Create account ✨'}
        </motion.h1>
        <motion.p layout="position" className="text-white/90 font-medium" style={{ fontSize: '15px' }}>
          {authState === 'A' && 'Enter your email to get started'}
          {authState === 'B' && 'Sign in to your SplitBliz account'}
          {authState === 'C' && "New here — let's get you set up"}
        </motion.p>
      </motion.div>

      {/* Main Form Body */}
      <div className="flex-1 px-4 -mt-12 pb-8 max-w-md w-full mx-auto relative z-10">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[20px] p-6 sm:p-8 shadow-xl overflow-hidden"
          style={{ border: `1px solid ${cardBorder}` }}
        >
          
          <AnimatePresence mode="popLayout">
            {/* STATE C: NAME FIELD */}
            {authState === 'C' && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="space-y-2 mb-6"
               >
                 <label className="text-[14px] font-bold text-[#1a1625] ml-1">
                   Full name
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-5 w-5" style={{ color: muted }} />
                   </div>
                   <input
                     autoFocus
                     type="text"
                     required
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="e.g. Aman Sharma"
                     className="w-full pl-11 pr-4 py-4 text-[15px] font-semibold text-[#1a1625] rounded-[12px] outline-none transition-all placeholder:text-[#b8b4d8]"
                     style={{ backgroundColor: pageBg, border: `1.5px solid ${cardBorder}` }}
                     onFocus={(e) => e.target.style.borderColor = purple}
                     onBlur={(e) => e.target.style.borderColor = cardBorder}
                   />
                 </div>
               </motion.div>
            )}
          </AnimatePresence>

          <form 
            onSubmit={
              authState === 'A' ? handleEmailSubmit : 
              authState === 'B' ? handleLoginSubmit : 
              handleSignupSubmit
            } 
            className="space-y-6"
          >
            
            {/* Contextual Email Field */}
            <motion.div layout className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[14px] font-bold text-[#1a1625]">
                  Email address
                </label>
                {authState === 'B' && (
                   <span className="px-2.5 py-1 flex items-center gap-1" style={{ background: colors.successLight, color: colors.success, fontSize: '11px', fontWeight: 700, borderRadius: '20px' }}>
                     <CheckCircle2 className="w-3 h-3" /> Account found
                   </span>
                )}
                {authState === 'C' && (
                   <span className="px-2.5 py-1 flex items-center gap-1" style={{ background: '#ede9ff', color: purple, fontSize: '11px', fontWeight: 700, borderRadius: '20px' }}>
                     ✦ New account
                   </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: muted }} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={authState !== 'A'}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-4 text-[15px] font-semibold text-[#1a1625] rounded-[12px] outline-none transition-all placeholder:text-[#b8b4d8]"
                  style={{ 
                    backgroundColor: pageBg, 
                    border: `1.5px solid ${cardBorder}`,
                    opacity: authState !== 'A' ? 0.6 : 1
                  }}
                  onFocus={(e) => { if(authState === 'A') e.target.style.borderColor = purple; }}
                  onBlur={(e) => { if(authState === 'A') e.target.style.borderColor = cardBorder; }}
                />
              </div>
            </motion.div>

            {/* Expandable Password Field */}
            <AnimatePresence>
              {(authState === 'B' || authState === 'C') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-2"
                >
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[14px] font-bold text-[#1a1625]">
                      Password
                    </label>
                    {authState === 'B' && (
                      <a href="#" style={{ fontSize: '13px', color: purple, fontWeight: 700 }} className="hover:underline">
                        Forgot?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5" style={{ color: muted }} />
                    </div>
                    <input
                      autoFocus={authState === 'B'}
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authState === 'C' ? "Min. 8 characters" : "••••••••"}
                      className="w-full pl-11 pr-12 py-4 text-[15px] font-semibold text-[#1a1625] rounded-[12px] outline-none transition-all placeholder:text-[#b8b4d8]"
                      style={{ backgroundColor: pageBg, border: `1.5px solid ${cardBorder}` }}
                      onFocus={(e) => e.target.style.borderColor = purple}
                      onBlur={(e) => e.target.style.borderColor = cardBorder}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                      style={{ color: muted }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 hover:text-[#6c5ce7]" /> : <Eye className="h-5 w-5 hover:text-[#6c5ce7]" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {authState === 'C' && (
                    <div className="mt-3 pl-1">
                      <div className="flex gap-1 w-full mb-2">
                        {[1, 2, 3, 4].map(bar => (
                          <div 
                            key={bar} 
                            className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                            style={{ 
                              backgroundColor: 
                                bar <= strength && strength === 1 ? '#e24b4a' :
                                bar <= strength && strength === 2 ? '#f59e0b' :
                                bar <= strength && strength === 4 ? '#10b981' : '#e8e4f8'
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[12px] font-bold transition-colors" style={{
                        color: strength === 1 ? '#e24b4a' : strength === 2 ? '#f59e0b' : strength === 4 ? '#10b981' : muted
                      }}>
                        {strength === 0 && 'Enter a password'}
                        {strength === 1 && 'Weak — too short'}
                        {strength === 2 && 'Medium — add numbers or symbols'}
                        {strength === 4 && 'Strong — great password'}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart CTA */}
            <motion.div layout className="flex flex-col items-center pt-2">
              <button
                type="submit"
                disabled={loading || (
                  (authState === 'A' && !isValidEmail) ||
                  (authState === 'B' && password.length < 1) ||
                  (authState === 'C' && (password.length < 8 || name.trim().length === 0))
                )}
                className="w-full py-4 rounded-[14px] font-bold transition-all shadow-md active:scale-[0.98]"
                  style={{ 
                    fontSize: '15px',
                    background: (
                      (authState === 'A' && isValidEmail) || 
                      (authState === 'B' && password.length >= 1) ||
                      (authState === 'C' && password.length >= 8 && name.trim().length > 0)
                  ) ? `linear-gradient(135deg, ${purple}, ${colors.primaryLight})` : '#e8e4f8',
                  color: (
                    (authState === 'A' && isValidEmail) || 
                    (authState === 'B' && password.length >= 1) ||
                    (authState === 'C' && password.length >= 8 && name.trim().length > 0)
                  ) ? '#fff' : '#b8b4d8',
                  boxShadow: (
                    (authState === 'A' && isValidEmail) || 
                    (authState === 'B' && password.length >= 1) ||
                    (authState === 'C' && password.length >= 8 && name.trim().length > 0)
                  ) ? `0 6px 16px ${colors.overlay25}` : 'none'
                }}
              >
                {authState === 'A' && 'Continue →'}
                {authState === 'B' && 'Sign in →'}
                {authState === 'C' && 'Create account →'}
              </button>
              {error && (
                <p className="mt-3 text-center text-[12px] font-semibold text-rose-600">
                  {error}
                </p>
              )}
              
              {authState === 'A' && (
                <p className="mt-3 font-semibold" style={{ fontSize: '12px', color: muted }}>
                  We'll check if you have an account
                </p>
              )}
            </motion.div>
          </form>

          {/* Bottom Nav / Back Links */}
          <AnimatePresence>
            {(authState === 'B' || authState === 'C') && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="mt-6 text-center"
              >
                <button 
                  onClick={handleBack}
                  className="text-[14px] font-bold transition-colors hover:underline"
                  style={{ color: purple }}
                >
                  {authState === 'B' && 'Not you? Use different email'}
                  {authState === 'C' && 'Wrong email? Go back'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Auth (State A only) */}
          <AnimatePresence>
            {authState === 'A' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="my-8 relative flex items-center justify-center">
                  <div className="absolute w-full h-[1.5px]" style={{ backgroundColor: cardBorder }} />
                  <span className="relative bg-white px-4 font-bold uppercase tracking-wider" style={{ fontSize: '11px', color: muted }}>
                    or
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={handleGoogleAuth}
                    type="button"
                    className="w-full py-4 rounded-[14px] bg-white flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98] hover:bg-slate-50"
                    style={{ border: `1.5px solid ${cardBorder}` }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-bold text-[#1a1625]" style={{ fontSize: '15px' }}>Continue with Google</span>
                  </button>
                  <p className="mt-3 font-semibold" style={{ fontSize: '12px', color: '#b8b4d8' }}>
                    No password needed with Google
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}
