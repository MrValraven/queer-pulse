import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { reasonFor } from "../../../shared/api/errorMessage";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_REMINDER_LEAD_MINUTES,
  getEventReminderPreferences,
  putEventReminderPreferences,
  type EventReminderPreferencesDTO,
} from "./eventReminders.api";

export interface EventReminderLeadResult {
  /** The effective lead, defaulted while loading and in demo. */
  leadMinutes: number;
  /** Replace it: local-only in demo, PUT + optimistic cache in live. */
  setLeadMinutes: (next: number) => void;
  isLoading: boolean;
}

/**
 * The member's event-reminder lead time, dual-mode (PRD-186).
 *
 * Same shape as `useNotificationDelivery`, deliberately: demo keeps it in
 * memory so the control is fully interactive standalone, and live hydrates
 * from `GET /me/event-reminder-preferences` (gated on a signed-in member),
 * writes through `PUT` with an optimistic cache update, and rolls back with a
 * toast on failure.
 */
export function useEventReminderLead(): EventReminderLeadResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoLead, setDemoLead] = useState(DEFAULT_REMINDER_LEAD_MINUTES);

  const queryKey = ["event-reminder-lead", demoMode];
  const query = useQuery<EventReminderPreferencesDTO>({
    queryKey,
    enabled: !demoMode && loggedIn,
    queryFn: () => getEventReminderPreferences(),
  });

  const setLeadMinutes = useCallback(
    (next: number) => {
      if (demoMode) {
        setDemoLead(next);
        return;
      }
      const previous =
        queryClient.getQueryData<EventReminderPreferencesDTO>(queryKey);
      queryClient.setQueryData<EventReminderPreferencesDTO>(queryKey, {
        leadMinutes: next,
      });
      void putEventReminderPreferences({ leadMinutes: next })
        .then((fresh) =>
          queryClient.setQueryData<EventReminderPreferencesDTO>(
            queryKey,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "event-reminder-lead" });
          if (previous) {
            queryClient.setQueryData<EventReminderPreferencesDTO>(
              queryKey,
              previous,
            );
          }
          const reason = reasonFor(error)?.replace(/\.$/, "");
          showToast(
            reason
              ? t("settings:notifications.toast.saveErrorReason", { reason })
              : t("settings:notifications.toast.saveError"),
            "error",
          );
        });
    },
    // queryKey is a fresh array each render but its contents are stable; depend
    // on the primitive that actually varies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [demoMode, queryClient, showToast, t],
  );

  return {
    leadMinutes: demoMode
      ? demoLead
      : (query.data?.leadMinutes ?? DEFAULT_REMINDER_LEAD_MINUTES),
    setLeadMinutes,
    isLoading: !demoMode && query.isLoading,
  };
}
