import { Button, Modal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./ComposeConfirmCloseModal.module.css";

export interface ComposeConfirmCloseModalProps {
  /**
   * What the draft holds, said back to the member: the title, or the opening
   * words of the body when there is no title yet. Empty is fine and switches
   * to a copy that names nothing.
   */
  draftSummary?: string;
  /** Throw the draft away and leave. The only destructive action here. */
  onDiscard: () => void;
  /** Stay on the composer. Also what the scrim, the X and Escape do. */
  onKeepWriting: () => void;
  /** Keep the draft on the server and leave. */
  onKeepDraft: () => void;
}

/**
 * Shown when a member leaves the composer with unsaved words in it. Written as
 * reassurance: the draft is already safe, and the question is only which of
 * three perfectly fine things happens next.
 */
export function ComposeConfirmCloseModal({
  draftSummary = "",
  onDiscard,
  onKeepWriting,
  onKeepDraft,
}: ComposeConfirmCloseModalProps) {
  const { t } = useTranslation();
  const trimmedSummary = draftSummary.trim();

  return (
    <Modal
      title={t("forum:composePage.confirmClose.title")}
      onClose={onKeepWriting}
      footer={
        <>
          <Button variant="danger" onClick={onDiscard}>
            {t("forum:composePage.confirmClose.discard")}
          </Button>
          <span className={styles.footSpacer} />
          <Button variant="ghost" onClick={onKeepWriting}>
            {t("forum:composePage.confirmClose.keepWriting")}
          </Button>
          <Button onClick={onKeepDraft}>
            {t("forum:composePage.confirmClose.keepDraft")}
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        {trimmedSummary ? (
          <Translation
            i18nKey="forum:composePage.confirmClose.body"
            components={{ b: <b /> }}
            values={{ summary: trimmedSummary }}
          />
        ) : (
          t("forum:composePage.confirmClose.bodyUntitled")
        )}
      </p>
    </Modal>
  );
}
