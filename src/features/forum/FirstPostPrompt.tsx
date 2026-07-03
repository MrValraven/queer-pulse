import { FiX } from "react-icons/fi";
import { TbPencilPlus } from "react-icons/tb";
import { Button } from "../../shared/components/ui";
import { FIRST_POST_STARTERS } from "./firstPostPrompt.data";
import styles from "./FirstPostPrompt.module.css";

/**
 * A warm, dismissible invitation shown at the top of the thread list to members
 * who haven't posted yet. Not a success surface — an offer, so it lives on a
 * soft coral card rather than the plum panel.
 */
export function FirstPostPrompt({
  onWrite,
  onPickStarter,
  onDismiss,
}: {
  onWrite: () => void;
  onPickStarter: (text: string) => void;
  onDismiss: () => void;
}) {
  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.dismiss}
        onClick={onDismiss}
        aria-label="Dismiss"
      >
        <FiX />
      </button>

      <span className={styles.icon} aria-hidden="true">
        <TbPencilPlus />
      </span>

      <div className={styles.copy}>
        <span className={styles.eyebrow}>You haven't posted yet</span>
        <h2 className={styles.title}>
          Everyone was <em>new</em> once.
        </h2>
        <p className={styles.body}>
          The forum is only as good as what people bring to it. You don't need
          something big — a question, a recommendation, something you noticed.
          It all counts. Here are a few things people often find useful to
          share:
        </p>

        <div className={styles.starters}>
          {FIRST_POST_STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.starter}
              onClick={() => onPickStarter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className={styles.actions}>
          <Button onClick={onWrite}>Write your first post</Button>
          <Button variant="ghost" onClick={onDismiss}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
