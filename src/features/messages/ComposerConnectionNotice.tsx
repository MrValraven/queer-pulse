// src/features/messages/ComposerConnectionNotice.tsx
import { FiUserPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { useIncomingRequestActions } from "../connect/useIncomingRequestActions";
import { useMemberContact } from "../connect/useMemberContact";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ComposerConnectionNoticeProps {
  active: Conversation;
}

/**
 * Replaces the composer for a DM the server has flagged
 * `replyRequiresConnection` (PRD-220): a thread an enquiry (housing/flatmate,
 * etc.) opened between two members who aren't accepted connections. The
 * ordinary send path 403s every follow-up from EITHER side after that first
 * enquiry, so this tells the truth instead of letting the composer render as
 * normal and fail silently on send.
 *
 * Three honest states, symmetric for whichever side is looking at the thread:
 *  - the counterpart already asked to connect -> accept/decline right here;
 *  - the caller already asked -> say so, no repeat action;
 *  - neither has asked yet -> offer to send the request.
 * All three keep the member on this screen: `contact()` opens the existing
 * Connect modal as an overlay, and accept/decline call the same mutations the
 * profile hero and connections page use, so this can never drift from what
 * "connected" means elsewhere in the app.
 */
export function ComposerConnectionNotice({
  active,
}: ComposerConnectionNoticeProps) {
  const { t } = useTranslation();
  const slug = active.slug;
  const firstName = active.name.split(" ")[0]!;
  const { hasIncomingRequest, contact } = useMemberContact(slug ?? "");
  const { isPending } = useConnectionsHydrated();
  const { accept, decline, isAnswering } = useIncomingRequestActions(
    slug ?? "",
    firstName,
  );

  // Defensive only: `replyRequiresConnection` is server-derived from a DM's
  // real counterpart, so a DM here always carries a slug.
  if (!slug) return null;

  const pending = isPending(slug);

  return (
    <div className={styles.connectionNotice} role="status" aria-live="polite">
      <FiUserPlus aria-hidden className={styles.connectionNoticeIcon} />
      <div className={styles.connectionNoticeBody}>
        <p className={styles.connectionNoticeText}>
          {hasIncomingRequest
            ? t("messages:conversation.connectionRequiredIncomingNotice", {
                name: firstName,
              })
            : pending
              ? t("messages:conversation.connectionRequiredPendingNotice", {
                  name: firstName,
                })
              : t("messages:conversation.connectionRequiredNotice", {
                  name: firstName,
                })}
        </p>
        {hasIncomingRequest ? (
          <div className={styles.connectionNoticeActions}>
            <Button
              size="sm"
              onClick={() => void accept()}
              disabled={isAnswering}
            >
              {t("messages:conversation.connectionRequiredAcceptCta")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void decline()}
              disabled={isAnswering}
            >
              {t("messages:conversation.connectionRequiredDeclineCta")}
            </Button>
          </div>
        ) : pending ? null : (
          <div className={styles.connectionNoticeActions}>
            <Button
              size="sm"
              onClick={() => contact({ slug, name: active.name })}
            >
              {t("messages:conversation.connectionRequiredSendCta")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
