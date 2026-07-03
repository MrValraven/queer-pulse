import { useState } from "react";
import { Modal, Button } from "../../shared/components/ui";
import {
  EDITORS,
  dueInfo,
  stripEm,
  firstName,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const SHORTCUTS: [string, string][] = [
  ["j / k", "Move between pieces"],
  ["o", "Open focused piece"],
  ["c", "Nudge writer of focused piece"],
  ["y / n / m", "Accept / decline / maybe top pitch"],
  ["/", "Search"],
  ["?", "This help"],
];

function chaseBody(piece: Piece): string {
  const name = firstName(piece.author);
  const title = stripEm(piece.title);
  if (piece.newVoice) {
    return `Hi ${name} — no pressure at all, just checking in on “${title}”. How's it feeling? Happy to hop on a call or push the date if that would help. We're really glad to have you in this issue.`;
  }
  const due = piece.due === "ready" ? "—" : dueInfo(piece.due).label;
  return `Hi ${name} — gentle nudge on “${title}”, currently at ${piece.stage} and due ${due}. Let me know if anything's getting in the way, and we'll sort it together.`;
}

/** Nudge/chase-a-writer composer. Softer tone for first-time contributors. */
export function ChaseModal({
  piece,
  onClose,
  onSend,
}: {
  piece: Piece;
  onClose: () => void;
  onSend: (piece: Piece) => void;
}) {
  return (
    <Modal
      eyebrow={`Nudge · ${piece.newVoice ? "first-time contributor" : "contributor"}`}
      title={`Message ${piece.author}`}
      onClose={onClose}
      footer={
        <div className={styles.mActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSend(piece);
              onClose();
            }}
          >
            Send nudge
          </Button>
        </div>
      }
    >
      {piece.newVoice && (
        <div className={styles.mHint}>
          Softer tone — this is one of their first pieces with us.
        </div>
      )}
      <textarea
        className={styles.mText}
        rows={6}
        defaultValue={chaseBody(piece)}
        aria-label="Message to contributor"
      />
      <div className={styles.mRow}>
        <label className={styles.mCheck}>
          <input type="checkbox" defaultChecked /> Offer a deadline extension
        </label>
      </div>
    </Modal>
  );
}

/** Hand a piece to the co-editor with a note. */
export function HandoffModal({
  piece,
  onClose,
  onHandoff,
}: {
  piece: Piece;
  onClose: () => void;
  onHandoff: (editor: Editor) => void;
}) {
  const others = EDITORS.filter((e) => e !== piece.editor);
  const [to, setTo] = useState<Editor>(others[0] ?? "Marta");
  const note =
    piece.blocked === "writer"
      ? `@${to} handing this over — it's at ${piece.stage}, still waiting on the writer. Shout if you want context.`
      : `@${to} handing this over — it's at ${piece.stage}, ready for your eyes. Shout if you want context.`;

  return (
    <Modal
      eyebrow="Hand off"
      title={`Pass “${stripEm(piece.title)}”`}
      onClose={onClose}
      footer={
        <div className={styles.mActions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onHandoff(to);
              onClose();
            }}
          >
            Hand off
          </Button>
        </div>
      }
    >
      <label className={styles.mLabel} htmlFor="handoff-to">
        Hand to
      </label>
      <select
        id="handoff-to"
        className={styles.mSelect}
        value={to}
        onChange={(e) => setTo(e.target.value as Editor)}
      >
        {others.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <label className={styles.mLabel} htmlFor="handoff-note">
        Note
      </label>
      <textarea
        id="handoff-note"
        className={styles.mText}
        rows={4}
        defaultValue={note}
        key={to}
      />
    </Modal>
  );
}

/** Keyboard-shortcut reference. */
export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      eyebrow="Keyboard"
      title="Shortcuts"
      onClose={onClose}
      footer={
        <div className={styles.mActions}>
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      }
    >
      <div className={styles.kbGrid}>
        {SHORTCUTS.map(([k, desc]) => (
          <div key={k} style={{ display: "contents" }}>
            <div className={styles.kbK}>{k}</div>
            <div className={styles.kbD}>{desc}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
