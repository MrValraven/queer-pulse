import { useState } from "react";
import { Modal, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  EDITORS,
  dueInfo,
  stripEm,
  firstName,
  STAGE_LABEL_KEY,
  type Piece,
  type Editor,
} from "./editorDashboard.data";
import styles from "./EditorDashboardPage.module.css";

const SHORTCUTS: [string, string][] = [
  ["j / k", "magazine:editor.modals.shortcuts.moveBetweenPieces"],
  ["o", "magazine:editor.modals.shortcuts.openFocusedPiece"],
  ["c", "magazine:editor.modals.shortcuts.nudgeWriter"],
  ["y / n / m", "magazine:editor.modals.shortcuts.acceptDeclineMaybe"],
  ["/", "magazine:editor.modals.shortcuts.search"],
  ["?", "magazine:editor.modals.shortcuts.thisHelp"],
];

function chaseBody(piece: Piece, t: TFunction): string {
  const name = firstName(piece.author);
  const title = stripEm(piece.title);
  if (piece.newVoice) {
    return t("magazine:editor.modals.chase.bodyNewVoice", { name, title });
  }
  const due = piece.due === "ready" ? "—" : dueInfo(piece.due, t).label;
  return t("magazine:editor.modals.chase.bodyReturning", {
    name,
    title,
    stage: t(STAGE_LABEL_KEY[piece.stage]),
    due,
  });
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
  const { t } = useTranslation();
  return (
    <Modal
      eyebrow={t(
        piece.newVoice
          ? "magazine:editor.modals.chase.eyebrowFirstTime"
          : "magazine:editor.modals.chase.eyebrow",
      )}
      title={t("magazine:editor.modals.chase.title", { name: piece.author })}
      onClose={onClose}
      footer={
        <div className={styles.mActions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:editor.modals.chase.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSend(piece);
              onClose();
            }}
          >
            {t("magazine:editor.modals.chase.send")}
          </Button>
        </div>
      }
    >
      {piece.newVoice && (
        <div className={styles.mHint}>
          {t("magazine:editor.modals.chase.softHint")}
        </div>
      )}
      <textarea
        className={styles.mText}
        rows={6}
        defaultValue={chaseBody(piece, t)}
        aria-label={t("magazine:editor.modals.chase.messageAria")}
      />
      <div className={styles.mRow}>
        <label className={styles.mCheck}>
          <input type="checkbox" defaultChecked />{" "}
          {t("magazine:editor.modals.chase.offerExtension")}
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
  const { t } = useTranslation();
  const others = EDITORS.filter((e) => e !== piece.editor);
  const [to, setTo] = useState<Editor>(others[0] ?? "Marta");
  const stageLabel = t(STAGE_LABEL_KEY[piece.stage]);
  const note = t(
    piece.blocked === "writer"
      ? "magazine:editor.modals.handoff.noteWriterWaiting"
      : "magazine:editor.modals.handoff.noteReady",
    { editor: to, stage: stageLabel },
  );

  return (
    <Modal
      eyebrow={t("magazine:editor.modals.handoff.eyebrow")}
      title={t("magazine:editor.modals.handoff.title", {
        title: stripEm(piece.title),
      })}
      onClose={onClose}
      footer={
        <div className={styles.mActions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:editor.modals.handoff.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onHandoff(to);
              onClose();
            }}
          >
            {t("magazine:editor.modals.handoff.cta")}
          </Button>
        </div>
      }
    >
      <label className={styles.mLabel} htmlFor="handoff-to">
        {t("magazine:editor.modals.handoff.handTo")}
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
        {t("magazine:editor.modals.handoff.noteLabel")}
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
  const { t } = useTranslation();
  return (
    <Modal
      eyebrow={t("magazine:editor.modals.shortcuts.eyebrow")}
      title={t("magazine:editor.modals.shortcuts.title")}
      onClose={onClose}
      footer={
        <div className={styles.mActions}>
          <Button variant="primary" onClick={onClose}>
            {t("magazine:editor.modals.shortcuts.gotIt")}
          </Button>
        </div>
      }
    >
      <div className={styles.kbGrid}>
        {SHORTCUTS.map(([k, descKey]) => (
          <div key={k} style={{ display: "contents" }}>
            <div className={styles.kbK}>{k}</div>
            <div className={styles.kbD}>{t(descKey)}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
