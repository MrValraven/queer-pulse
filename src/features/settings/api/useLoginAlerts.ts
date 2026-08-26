import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_LOGIN_ALERTS_ENABLED,
  getLoginAlerts,
  putLoginAlerts,
  type LoginAlertsDTO,
} from "./loginAlerts.api";

export interface LoginAlertsResult {
  /** Whether the member is told about sign-ins from devices they have not used. */
  isEnabled: boolean;
  /** Flip it — local-only in demo, PUT with an optimistic cache write in live. */
  setEnabled: (next: boolean) => void;
  /** True while the live setting is first loading. */
  isLoading: boolean;
}

const LOGIN_ALERTS_QUERY_KEY = ["login-alerts"] as const;

/**
 * The member's new-device sign-in alert switch, dual-mode.
 *
 * - **Demo**: in-memory, defaulting on, so the toggle is interactive in the
 *   standalone prototype without touching the network.
 * - **Live**: hydrates from `GET /me/login-alerts` (gated on a signed-in
 *   member) and writes each flip through `PUT` with an optimistic cache
 *   update, rolling back and toasting on failure.
 *
 * Saves immediately on flip, like `useNotificationPreferences`, so it does not
 * take part in the Account pane's dirty/save flow. A security switch that only
 * takes effect after the member finds a Save button is a switch that silently
 * did not take effect.
 */
export function useLoginAlerts(): LoginAlertsResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoEnabled, setDemoEnabled] = useState(DEFAULT_LOGIN_ALERTS_ENABLED);

  const query = useQuery<LoginAlertsDTO>({
    queryKey: LOGIN_ALERTS_QUERY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: () => getLoginAlerts(),
  });

  const setEnabled = useCallback(
    (next: boolean) => {
      if (demoMode) {
        setDemoEnabled(next);
        return;
      }
      const previous = queryClient.getQueryData<LoginAlertsDTO>(
        LOGIN_ALERTS_QUERY_KEY,
      );
      queryClient.setQueryData<LoginAlertsDTO>(LOGIN_ALERTS_QUERY_KEY, {
        enabled: next,
      });
      void putLoginAlerts(next)
        .then((fresh) =>
          queryClient.setQueryData<LoginAlertsDTO>(
            LOGIN_ALERTS_QUERY_KEY,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "login-alerts" });
          // Roll back to exactly what the server last said, rather than to the
          // inverse of `next`: two fast flips would otherwise leave the toggle
          // showing a state nobody chose.
          queryClient.setQueryData<LoginAlertsDTO>(
            LOGIN_ALERTS_QUERY_KEY,
            previous,
          );
          showToast(t("settings:account.loginAlerts.toastError"), "error");
        });
    },
    [demoMode, queryClient, showToast, t],
  );

  return {
    isEnabled: demoMode
      ? demoEnabled
      : (query.data?.enabled ?? DEFAULT_LOGIN_ALERTS_ENABLED),
    setEnabled,
    isLoading: !demoMode && query.isLoading,
  };
}
