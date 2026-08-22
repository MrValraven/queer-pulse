import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { App } from "./app/App.tsx";
import { initObservability } from "./shared/observability/sentry";
import { isSandbox } from "./shared/sandbox/sandbox";
import { installSandboxStorage } from "./shared/sandbox/sandboxStorage";
import { reloadForStaleChunk } from "./shared/lib/staleChunkReload";

// A dev-only simulation sandbox instance gets isolated in-memory storage so
// its writes (auth, onboarding, dismissals) never leak to the real app.
if (isSandbox()) installSandboxStorage();

// Fire-and-forget: the dynamic `@sentry/react` import inside only resolves
// when a DSN + prod build both hold, and must never block first paint.
void initObservability();

// Stale-deploy recovery. Vite fires `vite:preloadError` when a lazy chunk's
// dynamic import 404s because a new build replaced it — swallow it and do one
// full reload to pull the fresh build. The reload policy (and its cooldown
// guard) lives in `reloadForStaleChunk` so this listener and the per-chunk
// retry in `app/routeHelpers.tsx` share ONE decision instead of two that could
// disagree about whether a second failure should reload again.
window.addEventListener("vite:preloadError", (event) => {
  if (reloadForStaleChunk()) event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
