import { useEffect, useState } from 'react';
import App from './App';
import { getRemoteString, initRemoteConfig } from '../services';

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
    return null;
  }

  if (blocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f2fb',
          padding: '40px 24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '520px',
            background: '#ffffff',
            border: '1px solid #e8e4f8',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 12px 36px rgba(26, 22, 37, 0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '16px',
              background: 'rgba(108, 92, 231, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c5ce7',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            SB
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1625' }}>
            SplitBliz is temporarily unavailable
          </h2>
          <p style={{ margin: '12px 0 0', color: '#9490b8', fontSize: '14px', lineHeight: 1.5 }}>
            {config?.app_maintenance_message || 'We are upgrading SplitBliz. We\'ll be back shortly!'}
          </p>
          {config?.app_maintenance_eta && (
            <p style={{ margin: '12px 0 0', color: '#6c5ce7', fontWeight: 600, fontSize: '14px' }}>
              Expected back: {config.app_maintenance_eta}
            </p>
          )}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f0eeff',
              color: '#b8b4d8',
              fontSize: '12px',
            }}
          >
            If you need help, contact support@splitbliz.com
          </div>
        </div>
      </div>
    );
  }

  return <App />;
}
