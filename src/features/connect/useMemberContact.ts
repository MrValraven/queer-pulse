import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConnect } from "../../app/providers/useConnect";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { routes } from "../../app/routeMap";

/**
 * Contact affordance for a member: message, answer, or connect, resolved from
 * the relationship the server reports.
 *
 * Three states, because there are three (PRD-03):
 *  - `connected` → the call-site says "Message" and `contact` opens the thread.
 *  - `hasIncomingRequest` → this member has ALREADY asked. The honest offer is
 *    to answer them, so a hero that knows about this renders Accept/Decline,
 *    and `contact` opens the Connect modal, which shows the same two answers
 *    rather than a compose form whose send would be refused.
 *  - neither → the existing "Say hello" reach-out.
 *
 * A decline cooldown is deliberately absent from this list. The backend keeps a
 * refusal silent (PRD-20's `assertRequestNotOnDeclineHold` answers a cooldown,
 * a cap and a block with one indistinguishable conflict), so no client surface
 * may claim to know about one. Those members stay on "Say hello", which is what
 * that design intends.
 */
export function useMemberContact(slug: string) {
  const { isConnected, isIncoming } = useConnectionsHydrated();
  const { openConnect } = useConnect();
  const navigate = useNavigate();
  const connected = isConnected(slug);
  // Accepted wins: once a request is answered the pair is simply connected.
  const hasIncomingRequest = !connected && isIncoming(slug);

  const contact = useCallback(
    (member: { slug: string; name: string }, reason?: string) => {
      if (isConnected(member.slug)) {
        void navigate(routes.messages, {
          state: { to: { slug: member.slug, name: member.name } },
        });
      } else {
        // The modal reads the same store, so a member with a request waiting
        // lands on its accept/decline panel instead of the compose form. Every
        // call site inherits that without knowing about it.
        openConnect(member.slug, reason);
      }
    },
    [isConnected, navigate, openConnect],
  );

  return { connected, hasIncomingRequest, contact };
}
