import { FiArrowRight } from "react-icons/fi";
import {
  needsYouNow,
  isLate,
  dueInfo,
  stripEm,
  firstName,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

/** The urgent "Needs you now" strip — late pieces + things in your court. */
export function EditorNeedsStrip({
  pieces,
  me,
  onOpen,
  onChase,
}: {
  pieces: Piece[];
  me: Editor;
  onOpen: (piece: Piece) => void;
  onChase: (piece: Piece) => void;
}) {
  const urgent = needsYouNow(pieces, me);

  if (!urgent.length) {
    return (
      <section className={styles.needs}>
        <div className={styles.needsClear}>
          You’re all clear, {me}. Nothing late and nothing waiting in your
          court. <span>Nice.</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.needs}>
      <div className={styles.needsHead}>
        Needs you now · <em>{urgent.length}</em>
      </div>
      <div className={styles.needsCards}>
        {urgent.map((p) => {
          const late = isLate(p);
          const di = dueInfo(p.due);
          const isChase = late && p.blocked === "writer";
          const reason = late
            ? p.blocked === "writer"
              ? "Writer hasn’t filed"
              : `Overdue at ${p.stage}`
            : `Sitting in your court · ${p.stage}`;
          const action = isChase
            ? `Chase ${firstName(p.author)}`
            : late
              ? "Open"
              : "Pick up";
          return (
            <button
              key={p.id}
              type="button"
              className={cx(
                styles.needsCard,
                late ? styles.late : styles.court,
              )}
              onClick={() => (isChase ? onChase(p) : onOpen(p))}
            >
              <span className={styles.needsTag}>
                {late ? di.label : "Your court"}
              </span>
              <span className={styles.needsTitle}>{stripEm(p.title)}</span>
              <span className={styles.needsReason}>{reason}</span>
              <span className={styles.needsCta}>
                {action} <FiArrowRight aria-hidden />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
