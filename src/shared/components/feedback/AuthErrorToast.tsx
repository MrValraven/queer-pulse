import { useEffect, useRef } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useTranslation } from "../../i18n/useTranslation";
import { useToast } from "./useToast";

/** A stable string to dedupe on — distinct per error shape, not per rendered
 * (locale-dependent) message. */
function errorSignature(
  error: NonNullable<ReturnType<typeof useAuth>["authError"]>,
): string {
  return error.kind === "server" ? `server:${error.status}` : "network";
}

/**
 * Bridges a session-load failure to a toast. `AuthProvider` sits outside the
 * `ToastProvider`/`I18nProvider`, so it can't raise a toast itself — this
 * null-rendering component lives inside both, resolves the error code into
 * the active language, and surfaces it when it appears, so a backend fault
 * (e.g. a 500 from `/auth/me`) is visible instead of silently looking like
 * "signed out". Fires once per distinct error.
 */
export function AuthErrorToast() {
  const { authError } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!authError) {
      shown.current = null;
      return;
    }
    const signature = errorSignature(authError);
    if (signature === shown.current) return;
    shown.current = signature;
    const message =
      authError.kind === "server"
        ? t("shared:auth.error.server", { status: authError.status })
        : t("shared:auth.error.network");
    showToast(message, "error", 6000);
  }, [authError, showToast, t]);

  return null;
}
