import { Button, Modal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeReplyInsteadModal.module.css";

export interface ComposeReplyInsteadModalProps {
  /** The existing thread's title, exactly as it reads in the forum. */
  threadTitle: string;
  /** The member's own text, shown as it would appear once it is a reply. */
  replyText: string;
  /** Stay on the composer and publish a thread of their own. Also what the
   *  scrim, the X and Escape do. */
  onKeepOwnPost: () => void;
  /** Move the text into the existing thread as a reply. */
  onMoveAsReply: () => void;
}

/**
 * Offered when the composer finds a thread already covering this. The point is
 * the fastest route to an answer, so the member sees their own words in their
 * new home before deciding, and keeping their own post stays a full,
 * unapologetic choice.
 */
export function ComposeReplyInsteadModal({
  threadTitle,
  replyText,
  onKeepOwnPost,
  onMoveAsReply,
}: ComposeReplyInsteadModalProps) {
  const { t } = useTranslation();
  const trimmedReply = replyText.trim();

  return (
    <Modal
      wide
      title={
        <Translation
          i18nKey="forum:composePage.replyInstead.title"
          components={{ em: <em /> }}
        />
      }
      onClose={onKeepOwnPost}
      footer={
        <>
          <span className={styles.footSpacer} />
          <Button variant="ghost" onClick={onKeepOwnPost}>
            {t("forum:composePage.replyInstead.keep")}
          </Button>
          <Button onClick={onMoveAsReply}>
            {t("forum:composePage.replyInstead.move")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        <Translation
          i18nKey="forum:composePage.replyInstead.body"
          components={{ b: <b /> }}
          values={{ title: threadTitle }}
        />
      </p>
      <div className={styles.preview}>
        <span className={styles.previewLabel}>
          {t("forum:composePage.replyInstead.previewLabel")}
        </span>
        <p className={styles.previewText} data-empty={trimmedReply === ""}>
          {trimmedReply === ""
            ? t("forum:composePage.replyInstead.emptyPreview")
            : trimmedReply}
        </p>
      </div>
    </Modal>
  );
}
