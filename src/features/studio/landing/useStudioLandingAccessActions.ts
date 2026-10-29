import { useCallback, useEffect, useState, type RefObject } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "../api/studio.api";
import type { StudioErrorCode } from "../api/studio.types";
import { useStudioAccessRequestState } from "../api/useStudioAccess";
import {
  useCancelStudioAccessRequest,
  useRequestStudioAccess,
} from "../api/useStudioAccessRequest";
import { studioErrorMessageKeyOf } from "../studioErrors.data";

type TranslateFunction = ReturnType<typeof useTranslation>["t"];

/** Where focus goes once the state a member's action asked for has mounted:
 *  the on-list line after sending, the request button after cancelling. */
export type StudioLandingFocusTarget = "onList" | "request";

/** Answers the request hooks settle by reading GET /studio/me again: the
 *  state that comes back (on the list, or Studio home) says it,
 *  so no failure line shows for them. */
const SETTLED_BY_REFETCH: ReadonlySet<StudioErrorCode> = new Set([
  "studio_access_request_exists",
  "studio_access_already_granted",
]);

/** The failure line under a button: what failed, then the server's reason. */
function failureLineOf(
  t: TranslateFunction,
  error: unknown,
  actionKey: string,
): string | null {
  if (error === null || error === undefined) return null;
  const code = studioErrorCodeOf(error);
  if (code !== null && SETTLED_BY_REFETCH.has(code)) return null;
  return `${t(actionKey)}. ${t(studioErrorMessageKeyOf(error, "save"))}`;
}

/**
 * The member side of a landing CTA: where the member stands on the Studio
 * access list (GET /studio/me), the send and cancel actions, their failure
 * lines, the line the status region speaks, and where focus should land
 * once the new state has mounted.
 */
export function useStudioLandingAccessActions() {
  const { t } = useTranslation();
  const requestState = useStudioAccessRequestState();
  const requestAccess = useRequestStudioAccess();
  const cancelRequest = useCancelStudioAccessRequest();
  const [announcementKey, setAnnouncementKey] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] =
    useState<StudioLandingFocusTarget | null>(null);
  const clearFocusTarget = useCallback(() => setFocusTarget(null), []);

  function sendRequest(wantsToRelease: boolean) {
    if (requestAccess.isPending) return;
    cancelRequest.reset();
    requestAccess.mutate(
      { wantsToRelease },
      {
        onSuccess: () => {
          setAnnouncementKey("studio:landing.cta.requestSent");
          setFocusTarget("onList");
        },
      },
    );
  }

  function cancel() {
    if (cancelRequest.isPending) return;
    requestAccess.reset();
    cancelRequest.mutate(undefined, {
      onSuccess: () => {
        setAnnouncementKey("studio:landing.cta.requestCancelled");
        setFocusTarget("request");
      },
    });
  }

  return {
    isChecking: !requestState.isKnown,
    isOnList: requestState.isKnown && requestState.hasPendingRequest,
    hasNoRequest: requestState.isKnown && !requestState.hasPendingRequest,
    isArtistRequest: requestState.wantsToRelease,
    isRequestPending: requestAccess.isPending,
    isCancelPending: cancelRequest.isPending,
    requestFailure: failureLineOf(
      t,
      requestAccess.error,
      "studio:landing.cta.requestFailed",
    ),
    cancelFailure: failureLineOf(
      t,
      cancelRequest.error,
      "studio:landing.cta.cancelFailed",
    ),
    announcement: announcementKey ? t(announcementKey) : "",
    focusTarget,
    clearFocusTarget,
    sendRequest,
    cancel,
  };
}

/**
 * Moves focus to `element` once the state the member's action asked for has
 * mounted, since the control they pressed folded away with the old state.
 */
export function useFocusOnArrival(
  actions: ReturnType<typeof useStudioLandingAccessActions>,
  target: StudioLandingFocusTarget,
  isShown: boolean,
  element: RefObject<HTMLElement | null>,
) {
  const { focusTarget, clearFocusTarget } = actions;
  useEffect(() => {
    if (focusTarget !== target || !isShown) return;
    element.current?.focus({ preventScroll: true });
    clearFocusTarget();
  }, [focusTarget, target, isShown, element, clearFocusTarget]);
}
