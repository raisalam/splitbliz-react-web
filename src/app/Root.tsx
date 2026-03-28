import React, { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { useMqttConnection } from '../hooks/useMqtt';
import { tokenStore } from '../services/apiClient';
import { mqttConfig } from '../services/mqttService';
import { firebaseSetup } from '../services/firebase';

mqttConfig.configure(import.meta.env.VITE_MQTT_URL ?? 'ws://localhost:8083/mqtt');
firebaseSetup.configure({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

export function Root() {
  useEffect(() => {
    void tokenStore.init();
  }, []);

  useMqttConnection();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans">
      <Outlet />
      <Toaster position="bottom-right" theme="system" richColors />
    </div>
  );
}
