import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { reasonFor } from "../../../shared/api/errorMessage";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_NOTIFICATION_DELIVERY,
  detectTimeZone,
  getNotificationDelivery,
  putNotificationDelivery,
  type NotificationDeliveryDTO,
} from "./notificationDelivery.api";

export interface NotificationDeliveryResult {
  /** The effective window, defaults synthesised while loading or in demo. */
  delivery: NotificationDeliveryDTO;
  /** Replace the window: local-only in demo, PUT + optimistic cache in live. */
  setDelivery: (next: NotificationDeliveryDTO) => void;
  isLoading: boolean;
}

/**
 * The member's quiet-hours window, dual-mode.
 *
 * - **Demo**: in-memory only, so the control is fully interactive without a
 *   network call and the prototype still runs standalone.
 * - **Live**: hydrates from `GET /me/notification-delivery` (gated on a signed-in
 *   member) and writes through `PUT` with an optimistic cache update, rolling
 *   back and toasting on failure. Same shape as `useNotificationPreferences`.
 *
 * Every write carries the browser's current IANA zone unless the caller states
 * one. A window without the zone it was set in is meaningless, and the member
 * should never have to tell us what their own clock says.
 */
export function useNotificationDelivery(): NotificationDeliveryResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoDelivery, setDemoDelivery] = useState<NotificationDeliveryDTO>({
    ...DEFAULT_NOTIFICATION_DELIVERY,
    timeZone: detectTimeZone(),
  });

  const queryKey = ["notification-delivery", demoMode];
  const query = useQuery<NotificationDeliveryDTO>({
    queryKey,
    enabled: !demoMode && loggedIn,
    queryFn: () => getNotificationDelivery(),
  });

  const setDelivery = useCallback(
    (next: NotificationDeliveryDTO) => {
      if (demoMode) {
        setDemoDelivery(next);
        return;
      }
      const previous =
        queryClient.getQueryData<NotificationDeliveryDTO>(queryKey);
      queryClient.setQueryData<NotificationDeliveryDTO>(queryKey, next);
      void putNotificationDelivery(next)
        .then((fresh) =>
          queryClient.setQueryData<NotificationDeliveryDTO>(queryKey, fresh),
        )
        .catch((error) => {
          logError(error, { scope: "notification-delivery" });
          if (previous) {
            queryClient.setQueryData<NotificationDeliveryDTO>(
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
    delivery: demoMode
      ? demoDelivery
      : (query.data ?? DEFAULT_NOTIFICATION_DELIVERY),
    setDelivery,
    isLoading: !demoMode && query.isLoading,
  };
}
