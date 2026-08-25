import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { describeError } from "../../../shared/api/errorMessage";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_REMINDER_LEAD_MINUTES,
  getEventReminderPrefs,
  putEventReminderPrefs,
  type EventReminderPrefsDTO,
} from "./eventReminderPrefs.api";

export interface EventReminderPrefsResult {
  /** Minutes before an event that the reminder fires (60 / 1440 / 10080). */
  leadMinutes: number;
  /** Persist a new lead — local-only in demo, PUT + optimistic cache in live. */
  setLeadMinutes: (minutes: number) => void;
  /** True while the live preference is first loading. */
  isLoading: boolean;
}

/**
 * The member's event-reminder lead time, dual-mode.
 *
 * - **Demo**: in-memory only (seeded to the same 1-day default the mock uses),
 *   so the control is interactive but never hits the network.
 * - **Live**: hydrates from `GET /me/event-reminder-preferences` (gated on a
 *   signed-in member) and writes through `PUT` with an optimistic cache update,
 *   rolling back + toasting on failure.
 */
export function useEventReminderPrefs(): EventReminderPrefsResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [demoLeadMinutes, setDemoLeadMinutes] = useState(
    DEFAULT_REMINDER_LEAD_MINUTES,
  );

  const queryKey = ["event-reminder-prefs", demoMode];
  const query = useQuery<EventReminderPrefsDTO>({
    queryKey,
    enabled: !demoMode && loggedIn,
    queryFn: () => getEventReminderPrefs(),
  });

  const setLeadMinutes = useCallback(
    (minutes: number) => {
      if (demoMode) {
        setDemoLeadMinutes(minutes);
        return;
      }
      const previous =
        queryClient.getQueryData<EventReminderPrefsDTO>(queryKey);
      queryClient.setQueryData<EventReminderPrefsDTO>(queryKey, {
        leadMinutes: minutes,
      });
      void putEventReminderPrefs({ leadMinutes: minutes }).catch((error) => {
        logError(error, { scope: "event-reminder-prefs", minutes });
        if (previous) queryClient.setQueryData(queryKey, previous);
        else void queryClient.invalidateQueries({ queryKey });
        showToast(
          describeError("We couldn't save your reminder timing", error),
          "error",
        );
      });
    },
    // queryKey is a fresh array each render but its contents are stable; depend
    // on the primitive that actually varies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, queryClient, showToast],
  );

  if (demoMode) {
    return { leadMinutes: demoLeadMinutes, setLeadMinutes, isLoading: false };
  }
  return {
    leadMinutes: query.data?.leadMinutes ?? DEFAULT_REMINDER_LEAD_MINUTES,
    setLeadMinutes,
    isLoading: query.isLoading,
  };
}
