
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppGate } from "./app/AppGate";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UserProvider } from "./providers/UserContext";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ErrorBoundary>
        <AppGate />
      </ErrorBoundary>
    </UserProvider>
  </QueryClientProvider>
);
  
