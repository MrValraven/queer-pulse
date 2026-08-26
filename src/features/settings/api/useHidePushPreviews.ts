import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logError, logWarn } from "../../../shared/observability/logger";
import { mirrorHidePushPreviews } from "../../../pushPrivacy";
import {
  DEFAULT_HIDE_PUSH_PREVIEWS,
  getPushPreviews,
  putPushPreviews,
  type PushPreviewsDTO,
} from "./pushPreviews.api";

export interface HidePushPreviewsResult {
  /** Whether a push may name who it is from and what it said. */
  isHidingPreviews: boolean;
  /** Flip it: local-only in demo, PUT plus a mirror write in live. */
  setHidingPreviews: (next: boolean) => void;
  /** True while the live setting is first loading. */
  isLoading: boolean;
}

const PUSH_PREVIEWS_QUERY_KEY = ["push-previews"] as const;

interface HidePushPreviewsOptions {
  /**
   * Whether this caller wants the server value fetched. Defaults to `true`.
   *
   * `PushPreviewMirrorProvider` passes `false` on a browser that has no service
   * worker to read the mirror, so the app-wide sync costs nothing on a device
   * where it could not matter. React Query merges the `enabled` of every
   * subscriber to a key, so the settings row opening later still fetches.
   */
  isFetchEnabled?: boolean;
}

/**
 * The member's lock-screen preview switch, dual-mode, with the local mirror
 * kept in step.
 *
 * - **Demo**: in-memory, defaulting to hidden, so the toggle is interactive in
 *   the standalone prototype without touching the network.
 * - **Live**: hydrates from `GET /me/push-previews` and writes each flip
 *   through `PUT` with an optimistic cache update, rolling back and toasting on
 *   failure.
 *
 * THE SERVER IS THE AUTHORITY (ID-13). Whatever it says is mirrored into
 * IndexedDB for `sw.ts` on every settle, which is what carries the choice to a
 * second device and what stops a stale local flag from disagreeing with the
 * payloads actually being sent. A mirror write that fails is logged and not
 * toasted: it can only leave this device redacting a payload that no longer
 * needs it, whereas a failed PUT genuinely leaves previews showing and must
 * reach the member.
 *
 * Saves immediately on flip, like `useLoginAlerts`, so it does not take part in
 * any pane's dirty/save flow. A privacy switch that only takes effect after the
 * member finds a Save button is a switch that silently did not take effect.
 */
export function useHidePushPreviews(
  options: HidePushPreviewsOptions = {},
): HidePushPreviewsResult {
  const { isFetchEnabled = true } = options;
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoHiding, setDemoHiding] = useState(DEFAULT_HIDE_PUSH_PREVIEWS);

  const query = useQuery<PushPreviewsDTO>({
    queryKey: PUSH_PREVIEWS_QUERY_KEY,
    enabled: !demoMode && loggedIn && isFetchEnabled,
    queryFn: () => getPushPreviews(),
  });

  // Mirror whatever the server last said. Runs on the first fetch (boot or
  // sign-in), on a refetch, and after a successful PUT, because all three land
  // in the same cache entry, so there is exactly one place that writes the
  // mirror from a server value rather than one per call site.
  const serverHidePreviews = query.data?.hidePreviews;
  useEffect(() => {
    if (demoMode || serverHidePreviews === undefined) return;
    void mirrorHidePushPreviews(serverHidePreviews).then((didWrite) => {
      if (!didWrite) {
        logWarn("Could not mirror push-preview setting for the service worker");
      }
    });
  }, [demoMode, serverHidePreviews]);

  const setHidingPreviews = useCallback(
    (next: boolean) => {
      if (demoMode) {
        setDemoHiding(next);
        return;
      }
      const previous = queryClient.getQueryData<PushPreviewsDTO>(
        PUSH_PREVIEWS_QUERY_KEY,
      );
      queryClient.setQueryData<PushPreviewsDTO>(PUSH_PREVIEWS_QUERY_KEY, {
        hidePreviews: next,
      });
      void putPushPreviews(next)
        .then((fresh) =>
          queryClient.setQueryData<PushPreviewsDTO>(
            PUSH_PREVIEWS_QUERY_KEY,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "push-previews" });
          // Roll back to exactly what the server last said, rather than to the
          // inverse of `next`: two fast flips would otherwise leave the toggle
          // showing a state nobody chose.
          queryClient.setQueryData<PushPreviewsDTO>(
            PUSH_PREVIEWS_QUERY_KEY,
            previous,
          );
          // This one has to be loud. A silent failure leaves the row saying
          // previews are hidden while every push still carries a name.
          showToast(
            t("settings:notifications.phonePush.previews.error"),
            "error",
          );
        });
    },
    [demoMode, queryClient, showToast, t],
  );

  return {
    isHidingPreviews: demoMode
      ? demoHiding
      : (query.data?.hidePreviews ?? DEFAULT_HIDE_PUSH_PREVIEWS),
    setHidingPreviews,
    isLoading: !demoMode && isFetchEnabled && query.isLoading,
  };
}
