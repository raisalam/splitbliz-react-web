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
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>SplitBliz is temporarily unavailable</h2>
        <p style={{ color: '#9490b8' }}>
          {config?.app_maintenance_message || 'We are upgrading SplitBliz. We\'ll be back shortly!'}
        </p>
        {config?.app_maintenance_eta && (
          <p style={{ color: '#9490b8' }}>ETA: {config.app_maintenance_eta}</p>
        )}
      </div>
    );
  }

  return <App />;
}
