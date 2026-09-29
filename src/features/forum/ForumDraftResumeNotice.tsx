import { useForumThreadDraftPreview } from "./useForumThreadDraftPreview";
import { DraftCardRibbon } from "./draftCard/DraftCardRibbon";
import styles from "./ForumDraftResumeNotice.module.css";

/**
 * "You have an unfinished post": the forum's own sight of a saved draft
 * (PRD-165).
 *
 * Before this, a draft was visible ONLY on `/account/drafts`, so a member who
 * closed the composer had no reason to believe their words had survived, and
 * nothing on the forum said otherwise. Continue writing opens `/forum/new`,
 * which restores the whole draft field by field.
 *
 * There is no discard control on purpose. Emptying the composer already deletes
 * the draft (see `useForumComposerDraft`), which is a path the member can see
 * the consequences of; a one-click discard here would throw away unsent writing
 * with nothing to undo it.
 *
 * Renders nothing when there is no draft, so the forum stays exactly as it was
 * for everyone else. The card itself is the ribbon in `draftCard/`.
 */
export function ForumDraftResumeNotice() {
  const { details } = useForumThreadDraftPreview();

  if (!details) return null;

  return (
    <div className={styles.host}>
      <DraftCardRibbon details={details} />
    </div>
  );
}
