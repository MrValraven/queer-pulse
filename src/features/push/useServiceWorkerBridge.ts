import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  isIsViewingConversationRequest,
  isNavigateRequest,
  type IsViewingConversationReply,
  type NavigateReply,
} from "../../pushBridge";
import { useRealtime } from "../../shared/api/realtime";
import {
  isViewingConversation,
  toInAppNavigationTarget,
} from "./serviceWorkerBridgeDecision";

function postReply(
  replyPort: MessagePort,
  reply: IsViewingConversationReply | NavigateReply,
): void {
  try {
    replyPort.postMessage(reply);
  } catch {
    // The worker stopped waiting (it closes its port on timeout). Silence is
    // the safe answer on the C3 bridge, so there is nothing to recover.
  }
}

/**
 * The page half of the C3 service-worker bridge (ENG-226, ENG-235).
 *
 * The worker asks a focused window two things over a `MessageChannel`:
 * - "are you viewing conversation X?": answered from the realtime layer's
 *   requested thread, the router's pathname and the tab's visibility, so a push
 *   for the thread already on screen is suppressed;
 * - "navigate to this url": answered by routing in-app, so tapping a
 *   notification keeps the SPA (a half-typed draft, the open socket) instead of
 *   reloading the document.
 *
 * Must render inside the router (it does: `PushAppEffects` mounts from
 * AppChrome, inside `BrowserRouter`). A message without a reply port is not a
 * bridge request and is ignored, which leaves the worker's other messages
 * (`push-subscription-changed`) to their own listener.
 */
export function useServiceWorkerBridge(): void {
  const { getActiveConversationId } = useRealtime();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Read at request time, so a navigation does not re-register the listener.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const serviceWorkerContainer = navigator.serviceWorker;

    function handleServiceWorkerMessage(event: MessageEvent<unknown>) {
      const replyPort = event.ports[0];
      if (!replyPort) return;
      const request = event.data;

      if (isIsViewingConversationRequest(request)) {
        postReply(replyPort, {
          isViewing: isViewingConversation({
            conversationId: request.conversationId,
            activeConversationId: getActiveConversationId(),
            pathname: pathnameRef.current,
            visibilityState: document.visibilityState,
          }),
        });
        return;
      }

      if (isNavigateRequest(request)) {
        const target = toInAppNavigationTarget(
          request.url,
          window.location.origin,
        );
        if (target === null) {
          postReply(replyPort, { isHandled: false });
          return;
        }
        try {
          void navigate(target);
          postReply(replyPort, { isHandled: true });
        } catch {
          postReply(replyPort, { isHandled: false });
        }
      }
    }

    serviceWorkerContainer.addEventListener(
      "message",
      handleServiceWorkerMessage,
    );
    return () => {
      serviceWorkerContainer.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, [getActiveConversationId, navigate]);
}
