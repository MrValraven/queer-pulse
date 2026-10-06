import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { reasonLabel } from "./connectModal.data";
import { CONNECTION_META } from "./connections.data";

/** One leading and one trailing straight or curly double quote. The demo seeds
 *  wrap their messages in literal quotes, and the blockquote already reads as
 *  a quotation. */
const WRAPPING_QUOTES = /^["“”]|["“”]$/g;

/**
 * What a member wrote when they sent the request now waiting for you: the
 * message (trimmed, unwrapped from any literal quotes, null when empty) and the
 * translated label of the reason they picked (null when they gave none).
 *
 * Live mode reads the server's relationship lists; demo mode reads the seeded
 * request notes in the connections registry. ConnectModal is lazy-loaded and
 * already pulls in the member registry that one builds on, so reading it here
 * adds nothing to first paint.
 */
export function useIncomingRequestNote(slug: string | undefined): {
  message: string | null;
  reasonLabel: string | null;
} {
  const { demoMode } = useDemoMode();
  const { incomingRequest } = useConnectionsHydrated();
  const { t } = useTranslation();

  if (!slug) return { message: null, reasonLabel: null };

  const request = demoMode
    ? {
        message: CONNECTION_META[slug]?.requestMessage ?? null,
        reason: CONNECTION_META[slug]?.requestReason ?? null,
      }
    : incomingRequest(slug);

  const message =
    request?.message?.trim().replace(WRAPPING_QUOTES, "").trim() ?? "";

  return {
    message: message.length > 0 ? message : null,
    reasonLabel: reasonLabel(request?.reason ?? undefined, t),
  };
}
