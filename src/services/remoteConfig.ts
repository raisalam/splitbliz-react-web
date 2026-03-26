import { fetchAndActivate, getAll, getBoolean, getNumber, getString, setLogLevel, type RemoteConfig } from 'firebase/remote-config';
import { remoteConfig } from './firebase';

const DEFAULTS: Record<string, string | number | boolean> = {
  feature_new_ui: false,
};

export function initRemoteConfig(options?: { minFetchIntervalMs?: number; }) {
  remoteConfig.settings = {
    minimumFetchIntervalMillis: options?.minFetchIntervalMs ?? 60_000,
  };
  remoteConfig.defaultConfig = DEFAULTS;
  setLogLevel('error');
  return fetchAndActivate(remoteConfig);
}

export function getRemoteString(key: string, rc: RemoteConfig = remoteConfig) {
  return getString(rc, key);
}

export function getRemoteNumber(key: string, rc: RemoteConfig = remoteConfig) {
  return getNumber(rc, key);
}

export function getRemoteBoolean(key: string, rc: RemoteConfig = remoteConfig) {
  return getBoolean(rc, key);
}

export function getRemoteAll(rc: RemoteConfig = remoteConfig) {
  return getAll(rc);
}
