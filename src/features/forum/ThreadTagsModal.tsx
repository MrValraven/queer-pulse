import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ComposeTagsField } from "./ComposeTagsField";

/**
 * Re-file a thread: replace its tag set (SOC-13).
 *
 * The backend has accepted a `tags` replacement on `PATCH /forum/threads/:slug`
 * since the forum shipped, and the frontend never sent one, so a thread's tags
 * were frozen at the moment it was composed. Open to the thread's author and to
 * moderators: filing a thread under the right topic is what makes the archive
 * findable, and it is janitorial rather than editorial, unlike the title.
 *
 * Reuses `ComposeTagsField` verbatim, so the chip entry, the normalisation and
 * the five-tag cap are the same here as in the composer.
 */
export function ThreadTagsModal({
  initialTags,
  busy,
  onSave,
  onClose,
}: {
  initialTags: string[];
  busy: boolean;
  onSave: (tags: string[]) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
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
      <p>{t("forum:tagsEdit.body")}</p>
      <ComposeTagsField tags={tags} onChange={setTags} />
    </Modal>
  );
}
