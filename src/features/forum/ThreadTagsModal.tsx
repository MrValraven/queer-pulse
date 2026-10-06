import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ComposeTagsField } from "./ComposeTagsField";
import { memberTagLimitFor } from "./compose/composeThread.types";
import { SERVER_OWNED_FORUM_TAGS } from "./forumTags.data";
import styles from "./forumModals.module.css";

/**
 * Re-file a thread: replace its tag set (SOC-13).
 *
 * The backend has accepted a `tags` replacement on `PATCH /forum/threads/:slug`
 * since the forum shipped, and the frontend never sent one, so a thread's tags
 * were frozen at the moment it was composed. Open to the thread's author and to
 * moderators: filing a thread under the right topic is what makes the archive
 * findable, and it is janitorial rather than editorial, unlike the title.
 *
 * Reuses `ComposeTagsField` verbatim, so the curated vocabulary, the search and
 * the five-tag cap are the same here as in the composer. A thread can only be
 * re-filed under words that already exist in the list, which is what keeps the
 * archive's filter links pointing at one word per topic.
 */
export function ThreadTagsModal({
  initialTags: storedTags,
  busy,
  onSave,
  onClose,
  threadKind,
  shouldShowAskReviewNote = false,
}: {
  initialTags: string[];
  busy: boolean;
  onSave: (tags: string[]) => void;
  onClose: () => void;
  /** A call keeps four member tags; the server puts `open-call` first. */
  threadKind?: string | null;
  /** The author of a fundraiser: any edit of theirs sends it back to
   *  moderators, so the modal says so before they save. */
  shouldShowAskReviewNote?: boolean;
}) {
  const { t } = useTranslation();
  // The server adds and strips `open-call` itself, so the member edits only
  // their own tags and the cap counts only those.
  const [initialTags] = useState<string[]>(() =>
    storedTags.filter((tag) => !SERVER_OWNED_FORUM_TAGS.includes(tag)),
  );
  const [tags, setTags] = useState<string[]>(initialTags);
  const isUnchanged =
    tags.length === initialTags.length &&
    tags.every((tag, index) => tag === initialTags[index]);

  return (
    <Modal
      title={t("forum:tagsEdit.title")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {t("forum:tagsEdit.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={busy || isUnchanged}
            onClick={() => onSave(tags)}
          >
            {busy ? t("forum:tagsEdit.saving") : t("forum:tagsEdit.save")}
          </Button>
        </>
      }
    >
      {shouldShowAskReviewNote && (
        <p className={styles.sub}>{t("forum:funding.edit.askReviewNote")}</p>
      )}
      <p>{t("forum:tagsEdit.body")}</p>
      <ComposeTagsField
        tags={tags}
        onChange={setTags}
        maxTags={memberTagLimitFor(threadKind)}
      />
    </Modal>
  );
}
