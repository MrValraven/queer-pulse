import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "../shared/components/feedback/useToast";
import { useTranslation } from "../shared/i18n/useTranslation";
import { useIsStaffOnlyBounce } from "./authGate";

/**
 * Tells a signed-in member why a staff or admin link dropped them on their feed
 * (PRD-330). The gate in `useAuthGateRedirect` only returns a path, and
 * `AppRoutes` renders once per route-transition plane, so a toast raised there
 * could fire twice. This null-rendering bridge is mounted once in `App.tsx`,
 * beside `AuthErrorToast`, and fires once per bounced path.
 */
export function StaffOnlyBounceToast() {
  const isStaffOnlyBounce = useIsStaffOnlyBounce();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const announcedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!isStaffOnlyBounce) {
      announcedPath.current = null;
      return;
    }
    if (announcedPath.current === pathname) return;
    announcedPath.current = pathname;
    showToast(t("shared:auth.gate.noAccess"), "info", 5200);
  }, [isStaffOnlyBounce, pathname, showToast, t]);

  return null;
}
