import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { App } from "./app/App.tsx";
import { initObservability } from "./shared/observability/sentry";

// Fire-and-forget: the dynamic `@sentry/react` import inside only resolves
// when a DSN + prod build both hold, and must never block first paint.
void initObservability();

// Stale-deploy recovery. After a new build ships, the hashed filenames of the
// old lazy-route chunks no longer exist, so a dynamic import 404s and the app
// would otherwise show the crash panel. Vite fires `vite:preloadError` on such
// a failed import — swallow it and do one full reload to pull the fresh build.
// A timestamped sessionStorage guard blocks a tight reload loop (a genuinely
// broken chunk would keep failing) while still allowing recovery from a later,
// unrelated stale deploy in the same session.
const PRELOAD_RELOAD_KEY = "qp.preloadReloadAt";
const PRELOAD_RELOAD_COOLDOWN_MILLISECONDS = 10_000;
window.addEventListener("vite:preloadError", (event) => {
  const lastReloadAt = Number(
    window.sessionStorage.getItem(PRELOAD_RELOAD_KEY) ?? 0,
  );
  if (Date.now() - lastReloadAt < PRELOAD_RELOAD_COOLDOWN_MILLISECONDS) return;
  event.preventDefault();
  try {
    window.sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
  } catch {
    // Private-mode / blocked storage: still reload once; without the guard we
    // accept the small risk of a second attempt rather than showing the crash.
  }
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
