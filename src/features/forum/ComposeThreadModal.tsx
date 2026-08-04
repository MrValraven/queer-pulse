import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFocusOnMount, useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATS } from "./forum.data";
import { ComposeTagsField } from "./ComposeTagsField";
import styles from "./ComposeThreadModal.module.css";

export interface NewThreadInput {
  title: string;
  body: string;
  cat: string;
  tags: string[];
}

interface ComposeThreadModalProps {
  onClose: () => void;
  onPublish: (thread: NewThreadInput) => void;
  /** Seeds the title field — used by the first-post prompt's starter chips. */
  initialTitle?: string;
}

// Selectable categories — exclude the synthetic "all" bucket.
const POST_CATS = CATS.filter((c) => c.id !== "all");

/** Compose dialog that prepends a new thread, ending in a plum-panel confirmation. */
export function ComposeThreadModal({
  onClose,
  onPublish,
  initialTitle = "",
}: ComposeThreadModalProps) {
  useScrollLock();
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState("");
  const [cat, setCat] = useState(POST_CATS[0]!.id);
  const [tags, setTags] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const titleRef = useFocusOnMount<HTMLInputElement>();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canPublish = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={
          published ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
      >
        {published ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="compose-title" className={styles.confirmTitle}>
              <Translation
                i18nKey="forum:compose.confirmTitle"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.confirmBody}>
              {t("forum:compose.confirmBody")}
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                {t("forum:compose.done")}
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canPublish) return;
              onPublish({ title: title.trim(), body: body.trim(), cat, tags });
              setPublished(true);
            }}
          >
            <h2 id="compose-title" className={styles.dialogTitle}>
              {t("forum:compose.title")}
            </h2>
            <p className={styles.dialogSub}>{t("forum:compose.sub")}</p>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {t("forum:compose.titleFieldLabel")}
              </span>
              <input
                ref={titleRef}
                className={styles.input}
                type="text"
                autoComplete="off"
                enterKeyHint="next"
                placeholder={t("forum:compose.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {t("forum:compose.categoryFieldLabel")}
              </span>
              <select
                className={styles.input}
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                {POST_CATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t(c.nameKey)}
                  </option>
                ))}
              </select>
            </label>

            <ComposeTagsField tags={tags} onChange={setTags} />

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {t("forum:compose.postFieldLabel")}
              </span>
              <textarea
                className={styles.textarea}
                placeholder={t("forum:compose.postPlaceholder")}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
            </label>

            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                {t("forum:compose.cancel")}
              </Button>
              <Button variant="primary" type="submit" disabled={!canPublish}>
                {t("forum:compose.publishCta")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
