import { useEffect, useState } from 'react';
import App from './App';
import { getRemoteString, initRemoteConfig } from '../services';
import brandLogo from '../assets/brand/logo.png';

type KillSwitchConfig = {
  app_kill_switch?: boolean;
  app_maintenance_mode?: boolean;
  app_maintenance_message?: string;
  app_maintenance_eta?: string;
  app_force_update?: boolean;
  app_min_version?: string;
  app_store_url?: string;
};

export function AppGate() {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [config, setConfig] = useState<KillSwitchConfig | null>(null);

  useEffect(() => {
    initRemoteConfig()
      .then(() => {
        const raw = getRemoteString('splitbliz_config');
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as KillSwitchConfig;
            setConfig(parsed);
            const isBlocked = Boolean(parsed.app_kill_switch || parsed.app_maintenance_mode);
            setBlocked(isBlocked);
            console.log('[RemoteConfig] splitbliz_config =', parsed);
          } catch (err) {
            console.error('[RemoteConfig] splitbliz_config parse error', err);
          }
        }
      })
      .catch((err) => {
        console.error('[RemoteConfig] init failed', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans text-slate-900 dark:text-white transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 sm:p-10 shadow-xl shadow-indigo-500/5 text-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-500/20 overflow-hidden p-2">
              <img src={brandLogo} alt="SplitBliz Logo" className="w-full h-full object-contain" />
            </div>
            
            <h2 className="text-2xl font-bold tracking-tight mb-3">
              SplitBliz is temporarily unavailable
            </h2>
            
            <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed mb-6">
              {config?.app_maintenance_message || 'We are upgrading SplitBliz. We\'ll be back shortly!'}
            </p>
            
            {config?.app_maintenance_eta && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Expected back: {config.app_maintenance_eta}
              </div>
            )}
            
            <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-400">
                If you need help, please contact
              </p>
              <a href="mailto:support@splitbliz.com" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors">
                support@splitbliz.com
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <App />;
}
