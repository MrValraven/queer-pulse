import { FiEdit3 } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useForumThreadDraftPreview } from "./useForumThreadDraftPreview";
import styles from "./ForumDraftResumeNotice.module.css";

/**
 * "You have an unfinished post" — the forum's own sight of a saved draft
 * (PRD-165).
 *
 * Before this, a draft was visible ONLY on `/account/drafts`, so a member who
 * closed the composer had no reason to believe their words had survived, and
 * nothing on the forum said otherwise. Resume reopens the composer with the
 * whole draft in it.
 *
 * There is no discard control on purpose. Emptying the composer already deletes
 * the draft (see `useForumComposerDraft`), which is a path the member can see
 * the consequences of; a one-click discard here would throw away unsent writing
 * with nothing to undo it.
 *
 * Renders nothing when there is no draft, so the forum stays exactly as it was
 * for everyone else.
 */
export function ForumDraftResumeNotice({ onResume }: { onResume: () => void }) {
  const { t } = useTranslation();
  const { hasDraft, label } = useForumThreadDraftPreview();

  if (!hasDraft) return null;

  return (
    <div className={styles.notice} role="status">
      <FiEdit3 className={styles.icon} aria-hidden />
      <div className={styles.text}>
        <p className={styles.title}>{t("forum:draftNotice.title")}</p>
        {label && <p className={styles.preview}>{label}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={styles.action}
        onClick={onResume}
      >
        {t("forum:draftNotice.resumeCta")}
      </Button>
    </div>
  );
}
