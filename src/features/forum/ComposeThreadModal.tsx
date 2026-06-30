import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { CATS } from "./forum.data";
import styles from "./ComposeThreadModal.module.css";

export interface NewThreadInput {
  title: string;
  body: string;
  cat: string;
}

interface ComposeThreadModalProps {
  onClose: () => void;
  onPublish: (thread: NewThreadInput) => void;
}

// Selectable categories — exclude the synthetic "all" bucket.
const POST_CATS = CATS.filter((c) => c.id !== "all");

/** Compose dialog that prepends a new thread, ending in a plum-panel confirmation. */
export function ComposeThreadModal({
  onClose,
  onPublish,
}: ComposeThreadModalProps) {
  useScrollLock();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [cat, setCat] = useState(POST_CATS[0]!.id);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canPublish = title.trim().length > 0 && body.trim().length > 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={
          published ? `${styles.dialog} ${styles.dialogConfirm}` : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
        onClick={(e) => e.stopPropagation()}
      >
        {published ? (
          <div className={styles.confirm}>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="compose-title" className={styles.confirmTitle}>
              Posted to <em>the commons</em>
            </h2>
            <p className={styles.confirmBody}>
              Your thread is live at the top of the forum. Members can reply,
              upvote, and help.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canPublish) return;
              onPublish({ title: title.trim(), body: body.trim(), cat });
              setPublished(true);
            }}
          >
            <h2 id="compose-title" className={styles.dialogTitle}>
              New post
            </h2>
            <p className={styles.dialogSub}>
              Ask a question, share a guide, or float a proposal. Be kind, be
              useful.
            </p>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Title</span>
              <input
                className={styles.input}
                type="text"
                placeholder="A clear, specific title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Category</span>
              <select
                className={styles.input}
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                {POST_CATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Post</span>
              <textarea
                className={styles.textarea}
                placeholder="Write your post…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
              />
            </label>

            <div className={styles.dialogActions}>
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={!canPublish}>
                Publish post
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
