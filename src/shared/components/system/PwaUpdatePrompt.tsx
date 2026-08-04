import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { PwaUpdatePill } from "./PwaUpdatePill";

/**
 * Registers the service worker and, when a new build is waiting, offers a
 * reload rather than taking one. The worker is registered with
 * `registerType: "prompt"` (vite.config.ts) precisely so the swap happens on
 * the user's say-so: auto-claiming mid-session can leave the running page
 * importing lazy chunks the new build no longer ships.
 *
 * The UI is a PERSISTENT pill (PwaUpdatePill), not a transient toast: a
 * service-worker update asks for a decision, and a 30-second toast that a user
 * happens not to see means they run a stale build until their next cold start.
 * The pill stays until the user reloads or dismisses it (dismissal is honoured
 * until the next new build is detected).
 */
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  // Dismissal hides the pill for the rest of this session; a cold start (or the
  // next genuinely new build after a reload) surfaces it again.
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!needRefresh || dismissed) return null;

  return (
    <PwaUpdatePill
      updating={updating}
      onReload={() => {
        setUpdating(true);
        void updateServiceWorker(true);
      }}
      onDismiss={() => setDismissed(true)}
    />
  );
}
