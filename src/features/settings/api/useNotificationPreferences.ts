import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { describeError } from "../../../shared/api/errorMessage";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_PREFERENCE_ENABLED,
  getNotificationPreferences,
  putNotificationPreference,
  type NotificationPreferenceCategory,
  type NotificationPreferencesDTO,
} from "./notificationPreferences.api";

export interface NotificationPreferencesResult {
  /** Whether the given category is on (both channels share one toggle). */
  isEnabled: (category: NotificationPreferenceCategory) => boolean;
  /** Flip a category — local-only in demo, PUT + optimistic cache in live. */
  setEnabled: (
    category: NotificationPreferenceCategory,
    next: boolean,
  ) => void;
  /** True while the live preferences are first loading. */
  isLoading: boolean;
}

/**
 * The member's per-category notification switches, dual-mode.
 *
 * - **Demo**: in-memory only (every category defaults on), so the toggles are
 *   interactive but never hit the network.
 * - **Live**: hydrates from `GET /me/notification-preferences` (gated on a
 *   signed-in member) and writes each flip through `PUT` with an optimistic
 *   cache update, rolling back + toasting on failure.
 *
 * One toggle governs both the in-app bell and the phone push for its category,
 * so `setEnabled` writes `inApp` and `push` together.
 */
export function useNotificationPreferences(): NotificationPreferencesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Demo-only override map: absent category == default on.
  const [demoOverrides, setDemoOverrides] = useState<
    Partial<Record<NotificationPreferenceCategory, boolean>>
  >({});

  const queryKey = ["notification-preferences", demoMode];
  const query = useQuery<NotificationPreferencesDTO>({
    queryKey,
    enabled: !demoMode && loggedIn,
    queryFn: () => getNotificationPreferences(),
  });

  const setEnabled = useCallback(
    (category: NotificationPreferenceCategory, next: boolean) => {
      if (demoMode) {
        setDemoOverrides((previous) => ({ ...previous, [category]: next }));
        return;
      }
      const previous =
        queryClient.getQueryData<NotificationPreferencesDTO>(queryKey);
      queryClient.setQueryData<NotificationPreferencesDTO>(
        queryKey,
        (current) => ({
          preferences: {
            ...(current?.preferences ?? {}),
            [category]: { inApp: next, push: next },
          },
        }),
      );
      void putNotificationPreference({ category, inApp: next, push: next })
        .then((fresh) => queryClient.setQueryData(queryKey, fresh))
        .catch((error) => {
          logError(error, { scope: "notification-preferences", category });
          if (previous) queryClient.setQueryData(queryKey, previous);
          else void queryClient.invalidateQueries({ queryKey });
          showToast(
            describeError("We couldn't save your notification setting", error),
            "error",
          );
        });
    },
    // queryKey is a fresh array each render but its contents are stable; depend
    // on the primitive that actually varies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, queryClient, showToast],
  );

  const isEnabled = useCallback(
    (category: NotificationPreferenceCategory) => {
      if (demoMode) {
        return demoOverrides[category] ?? DEFAULT_PREFERENCE_ENABLED;
      }
      return (
        query.data?.preferences[category]?.inApp ?? DEFAULT_PREFERENCE_ENABLED
      );
    },
    [demoMode, demoOverrides, query.data],
  );

  return {
    isEnabled,
    setEnabled,
    isLoading: !demoMode && query.isLoading,
  };
}
