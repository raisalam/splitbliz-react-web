
  import { createRoot } from "react-dom/client";
import { AppGate } from "./app/AppGate";
import { ErrorBoundary } from './components/ErrorBoundary';
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary><AppGate /></ErrorBoundary>
  );
  
