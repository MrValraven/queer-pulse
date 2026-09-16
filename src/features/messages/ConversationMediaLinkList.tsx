// src/features/messages/ConversationMediaLinkList.tsx
import { useId } from "react";
import { FiAlertTriangle, FiExternalLink, FiLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { activeLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  entryDateLabel,
  entrySenderName,
  messageLinks,
  type ConversationMediaEntry,
  type ConversationMediaLink,
} from "./conversationMediaFilters";
import { isExternalHref } from "./linkify";
import { linkSafetyReasonsLabel } from "./linkSafetyCopy";
import { OpenExternalConfirmDialog } from "./OpenExternalConfirmDialog";
import { useLinkSafetyGuard } from "./useLinkSafetyGuard";
import styles from "./ConversationMediaGallery.module.css";

interface ConversationMediaLinkListProps {
  entries: ConversationMediaEntry[];
  counterpartName: string;
  onShowInChat: (messageId: string) => void;
}

/** The Links shelf: one row per URL shared, newest message first. */
export function ConversationMediaLinkList({
  entries,
  counterpartName,
  onShowInChat,
}: ConversationMediaLinkListProps) {
  const { t } = useTranslation();
  const locale = activeLocale();
  const youLabel = t("messages:viewer.you");
  return (
    <ul className={styles.rows}>
      {entries.flatMap((entry, entryIndex) => {
        const name = entrySenderName(entry.message, counterpartName, youLabel);
        const date = entryDateLabel(entry.at, locale);
        const meta = date
          ? t("messages:mediaGallery.entryMeta", { name, date })
          : name;
        const messageId = entry.message.id;
        return messageLinks(entry.message).map((link) => (
          <ConversationMediaLinkRow
            key={`${messageId ?? entry.message.localId ?? entryIndex}-${link.href}`}
            link={link}
            meta={meta}
            onShowInChat={messageId ? () => onShowInChat(messageId) : undefined}
          />
        ));
      })}
    </ul>
  );
}

interface ConversationMediaLinkRowProps {
  link: ConversationMediaLink;
  meta: string;
  /** Absent for a message with no server id (demo), which cannot be jumped to. */
  onShowInChat?: () => void;
}

/**
 * The link gets the same safety treatment a linkified bubble gives it: a new
 * tab with `noopener noreferrer`, the full href as its title, the shortened
 * label that never truncates the host, and the "opens an external site" hint
 * when it leaves QueerPulse.
 */
function ConversationMediaLinkRow({
  link,
  meta,
  onShowInChat,
}: ConversationMediaLinkRowProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const isExternal = isExternalHref(link.href);
  // PRD-371: same suspicious-link check and confirm step as an inline chat
  // link (`linkify.tsx`) — the Links shelf is just another rendering of the
  // same href.
  const {
    isSuspicious,
    reasons,
    displayHost,
    isConfirmOpen,
    handleAnchorClick,
    openAnyway,
    cancel,
  } = useLinkSafetyGuard(link.href);
  return (
    <li className={styles.row}>
      <a
        className={styles.rowLink}
        href={link.href}
        title={link.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAnchorClick}
      >
        <span className={styles.rowIcon} aria-hidden="true">
          <FiLink />
        </span>
        <span className={styles.rowText}>
          <span id={titleId} className={styles.rowTitle}>
            {link.label}
            {isSuspicious ? (
              <span
                className={styles.externalIcon}
                role="img"
                aria-label={linkSafetyReasonsLabel(reasons, t)}
              >
                <FiAlertTriangle aria-hidden="true" />
              </span>
            ) : (
              isExternal && (
                <>
                  <span className={styles.externalIcon}>
                    <FiExternalLink aria-hidden="true" />
                  </span>
                  <span className="visuallyHidden">
                    {t("messages:link.opensExternally")}
                  </span>
                </>
              )
            )}
          </span>
          <span className={styles.rowMeta}>{meta}</span>
        </span>
      </a>
      {onShowInChat && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.rowAction}
          aria-describedby={titleId}
          onClick={onShowInChat}
        >
          {t("messages:mediaGallery.showInChat")}
        </Button>
      )}
      {isSuspicious && (
        <OpenExternalConfirmDialog
          open={isConfirmOpen}
          onClose={cancel}
          onConfirm={openAnyway}
          title={t("messages:link.confirmTitle")}
        >
          <p>{t("messages:link.confirmDestination", { host: displayHost })}</p>
          <p>{linkSafetyReasonsLabel(reasons, t)}</p>
        </OpenExternalConfirmDialog>
      )}
    </li>
  );
}
