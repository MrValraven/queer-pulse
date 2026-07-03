import { useEffect, useRef } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "./useToast";

/**
 * Bridges a session-load failure to a toast. `AuthProvider` sits outside the
 * `ToastProvider`, so it can't raise a toast itself — this null-rendering
 * component lives inside both and surfaces `authError` when it appears, so a
 * backend fault (e.g. a 500 from `/auth/me`) is visible instead of silently
 * looking like "signed out". Fires once per distinct error message.
 */
export function AuthErrorToast() {
  const { authError } = useAuth();
  const { showToast } = useToast();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (authError && authError !== shown.current) {
      shown.current = authError;
      showToast(authError, "error", 6000);
    }
    if (!authError) shown.current = null;
  }, [authError, showToast]);

  return null;
}
