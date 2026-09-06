import { useId, useState } from "react";
import { Button, Modal, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATS } from "./forum.data";
import styles from "./forumModals.module.css";

// The categories a thread can actually live in. The synthetic "all" bucket is
// the sidebar's "everything" filter, and the backend reserves that word, so it
// is never a destination. Same exclusion the composer makes.
const POST_CATS = CATS.filter((category) => category.id !== "all");

/**
 * Re-file a thread: move it to another category (PRD-163).
 *
 * A thread's category was fixed at the moment it was composed, and members
 * browse the forum BY category from the sidebar, so a trans-health question
 * left under "General" was invisible to the people filtering for it. The move
 * is open to the thread's author for its first 24 hours and to a moderator at
 * any time; `canMoveThreadCategory` decides whether this ever opens, so nobody
 * is offered an action the server is about to refuse.
 *
 * There is no category enum on the backend: `category` is free text there, and
 * this list is the frontend's own (`CATS`). Sending an id from it is what keeps
 * the sidebar tallies and the badge in step.
 */
export function MoveCategoryModal({
  initialCategory,
  busy,
  onSave,
  onClose,
}: {
  initialCategory: string;
  busy: boolean;
  onSave: (category: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [category, setCategory] = useState(initialCategory);
  const labelId = useId();

  return (
    <Modal
      title={t("forum:moveCategory.title")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {t("forum:moveCategory.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={busy || category === initialCategory}
            onClick={() => onSave(category)}
          >
            {busy
              ? t("forum:moveCategory.saving")
              : t("forum:moveCategory.save")}
          </Button>
        </>
      }
    >
      <p className={styles.sub}>{t("forum:moveCategory.body")}</p>
      <div className={styles.field}>
        {/* `Select` is a button + listbox, so a wrapping native <label> would
            not name it. `labelledBy` points at the visible label instead. */}
        <span className={styles.fieldLabel} id={labelId}>
          {t("forum:moveCategory.fieldLabel")}
        </span>
        <Select
          labelledBy={labelId}
          value={category}
          onChange={(value) => setCategory(value ?? category)}
          options={POST_CATS.map((option) => ({
            value: option.id,
            label: t(option.nameKey),
          }))}
        />
      </div>
    </Modal>
  );
}
