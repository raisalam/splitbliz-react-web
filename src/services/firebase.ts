import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getRemoteConfig } from 'firebase/remote-config';

let _firebaseConfig: FirebaseOptions = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
};

export const firebaseSetup = {
  configure: (config: FirebaseOptions) => { _firebaseConfig = config; },
};

let _remoteConfigInstance: ReturnType<typeof getRemoteConfig> | null = null;

export function getFirebaseRemoteConfig() {
  if (!_remoteConfigInstance) {
    const app = getApps().length ? getApps()[0] : initializeApp(_firebaseConfig);
    _remoteConfigInstance = getRemoteConfig(app);
  }
  return _remoteConfigInstance;
}

export const remoteConfig = new Proxy({} as ReturnType<typeof getRemoteConfig>, {
  get: (_target, prop) => (getFirebaseRemoteConfig() as any)[prop],
});
