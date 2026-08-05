import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { describeError } from "../../../shared/api/errorMessage";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_EVENT_EMAILS_ENABLED,
  DEFAULT_EVENT_VISIBILITY,
  getEventSettings,
  putEventSettings,
  type EventSettingsDTO,
  type EventVisibility,
} from "./eventSettings.api";

export interface EventSettingsResult {
  /** The visibility a member's own events default to. */
  visibility: EventVisibility;
  /** Whether event email notifications are on. */
  emailEnabled: boolean;
  /** Persist a new default visibility — local in demo, PUT + optimistic in live. */
  setVisibility: (visibility: EventVisibility) => void;
  /** Persist the email toggle — local in demo, PUT + optimistic in live. */
  setEmailEnabled: (enabled: boolean) => void;
  /** True while the live settings are first loading. */
  isLoading: boolean;
}

const DEFAULTS: EventSettingsDTO = {
  defaultEventVisibility: DEFAULT_EVENT_VISIBILITY,
  eventEmailsEnabled: DEFAULT_EVENT_EMAILS_ENABLED,
};

/**
 * The member's event settings (default visibility + email notifications),
 * dual-mode.
 *
 * - **Demo**: in-memory only (seeded to the same defaults the mock uses), so
 *   the controls are interactive but never hit the network.
 * - **Live**: hydrates from `GET /me/event-settings` (gated on a signed-in
 *   member) and writes through `PUT` — a full replace of both fields — with an
 *   optimistic cache update that rolls back + toasts on failure.
 */
export function useEventSettings(): EventSettingsResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [demoSettings, setDemoSettings] = useState<EventSettingsDTO>(DEFAULTS);

  const queryKey = ["event-settings", demoMode];
  const query = useQuery<EventSettingsDTO>({
    queryKey,
    enabled: !demoMode && loggedIn,
    queryFn: () => getEventSettings(),
  });

  const current: EventSettingsDTO = demoMode
    ? demoSettings
    : (query.data ?? DEFAULTS);

  const persist = useCallback(
    (next: EventSettingsDTO) => {
      if (demoMode) {
        setDemoSettings(next);
        return;
      }
      const previous = queryClient.getQueryData<EventSettingsDTO>(queryKey);
      queryClient.setQueryData<EventSettingsDTO>(queryKey, next);
      void putEventSettings(next).catch((error) => {
        logError(error, { scope: "event-settings" });
        if (previous) queryClient.setQueryData(queryKey, previous);
        else void queryClient.invalidateQueries({ queryKey });
        showToast(
          describeError("We couldn't save your event settings", error),
          "error",
        );
      });
    },
    // queryKey is a fresh array each render but its contents are stable; depend
    // on the primitive that actually varies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, queryClient, showToast],
  );

  const setVisibility = useCallback(
    (visibility: EventVisibility) => {
      const base = demoMode
        ? demoSettings
        : (queryClient.getQueryData<EventSettingsDTO>(queryKey) ?? DEFAULTS);
      persist({ ...base, defaultEventVisibility: visibility });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, demoSettings, persist, queryClient],
  );

  const setEmailEnabled = useCallback(
    (enabled: boolean) => {
      const base = demoMode
        ? demoSettings
        : (queryClient.getQueryData<EventSettingsDTO>(queryKey) ?? DEFAULTS);
      persist({ ...base, eventEmailsEnabled: enabled });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, demoSettings, persist, queryClient],
  );

  return {
    visibility: current.defaultEventVisibility,
    emailEnabled: current.eventEmailsEnabled,
    setVisibility,
    setEmailEnabled,
    isLoading: demoMode ? false : query.isLoading,
  };
}
