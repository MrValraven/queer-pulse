import { useCallback, useState } from "react";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionActions } from "./api/useConnectionActions";

/**
 * Answer the connection request a member has already sent you, from wherever
 * you happen to be reading their profile (PRD-03).
 *
 * One implementation for every hero that offers the two answers, so the desktop
 * and mobile action rows cannot drift apart on what accepting means. The
 * mutations themselves (optimistic move, rollback, error toast) stay in
 * `useConnectionActions`; this adds the success toast and the in-flight flag a
 * button row needs, and looks up which connection is being answered.
 *
 * `isAnswering` disables both buttons while one is in flight: accepting and
 * declining the same request at once is not a thing a member can mean.
 */
export function useIncomingRequestActions(slug: string, firstName: string) {
  const { incomingConnectionId } = useConnectionsHydrated();
  const { acceptRequest, declineRequest } = useConnectionActions();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [isAnswering, setIsAnswering] = useState(false);

  const answer = useCallback(
    async (action: "accept" | "decline") => {
      if (isAnswering) return;
      setIsAnswering(true);
      const respond = action === "accept" ? acceptRequest : declineRequest;
      // `id` is undefined in demo mode (no server ids), where the actions are
      // local-only by design and never reach the network.
      const didSucceed = await respond({
        slug,
        id: incomingConnectionId(slug),
      });
      setIsAnswering(false);
      // A failure already toasted its reason and rolled the local move back.
      if (!didSucceed) return;
      showToast(
        action === "accept"
          ? t("connect:toast.connected", { name: firstName })
          : t("connect:toast.declined"),
        "success",
      );
    },
    [
      isAnswering,
      acceptRequest,
      declineRequest,
      incomingConnectionId,
      slug,
      firstName,
      showToast,
      t,
    ],
  );

  const accept = useCallback(() => answer("accept"), [answer]);
  const decline = useCallback(() => answer("decline"), [answer]);

  return { accept, decline, isAnswering };
}
