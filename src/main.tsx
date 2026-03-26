
  import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { ErrorBoundary } from './components/ErrorBoundary';
import { initRemoteConfig, getRemoteAll } from './services';

initRemoteConfig()
  .then(() => {
    const all = getRemoteAll();
    console.log('[RemoteConfig] keys:', Object.keys(all));
    Object.entries(all).forEach(([key, value]) => {
      console.log(`[RemoteConfig] ${key} =`, value.asString());
    });
  })
  .catch((err) => {
    console.error('[RemoteConfig] init failed', err);
  });
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary><App /></ErrorBoundary>
  );
  
