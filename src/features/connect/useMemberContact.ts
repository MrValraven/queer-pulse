import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useConnect } from "../../app/providers/useConnect";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { routes } from "../../app/routeMap";

/**
 * Contact affordance for a member: connect vs. message, resolved from whether
 * the viewer is an accepted connection. Call-sites keep their own button markup
 * and label (connected → "Message", else their existing "Say hello" copy) and
 * delegate the click to `contact`.
 */
export function useMemberContact(slug: string) {
  const { isConnected } = useConnectionsHydrated();
  const { openConnect } = useConnect();
  const navigate = useNavigate();
  const connected = isConnected(slug);

  const contact = useCallback(
    (member: { slug: string; name: string }, reason?: string) => {
      if (isConnected(member.slug)) {
        void navigate(routes.messages, {
          state: { to: { slug: member.slug, name: member.name } },
        });
      } else {
        openConnect(member.slug, reason);
      }
    },
    [isConnected, navigate, openConnect],
  );

  return { connected, contact };
}
