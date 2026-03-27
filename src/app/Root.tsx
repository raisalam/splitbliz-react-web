import React from 'react';
import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { useMqttConnection } from '../hooks/useMqtt';

export function Root() {
  useMqttConnection();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans">
      <Outlet />
      <Toaster position="bottom-right" theme="system" richColors />
    </div>
  );
}
