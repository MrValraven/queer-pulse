import { Modal, Button, ConfirmDialog } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CommissionModal, type CommissionPayload } from "./CommissionModal";
import type { DeskTrack } from "./DeskTrackTabs";
import { PassModal, type PassPayload } from "./PassModal";
import { ChaseModal } from "./ChaseModal";
import { HandoffModal } from "./HandoffModal";
import { SHORTCUTS } from "./deskModals.data";
import styles from "./DeskModals.module.css";

/** Every overlay the desk can raise, keyed by `kind`. `null` renders nothing. */
export type DeskModal =
  | {
      kind: "commission";
      pitch?: { title: string; byline: string; note: string };
      sectionName?: string;
    }
  | { kind: "pass"; pitch: { title: string } }
  // `id` travels here (unlike the other variants, which only carry display
  // copy) because `ChaseModal` needs it to open the real `PieceThread`.
  | { kind: "chase"; piece: { id: string; title: string; byline: string } }
  | { kind: "handoff"; piece: { title: string } }
  // Routed through the desk's single overlay slot rather than owned by the
  // row: `useDeskKeyboard` is disabled while `modal !== null`, so j/k/o cannot
  // move the desk underneath an open confirmation.
  | { kind: "deletePiece"; piece: { title: string } }
  | { kind: "shortcuts" }
  | null;

export interface DeskModalsProps {
  modal: DeskModal;
  editors: { id: string; name: string }[];
  sections: { name: string }[];
  /** Track pre-selected in the commission modal, matching the active desk tab. */
  commissionTrack: DeskTrack;
  /** Whether a current issue exists — disables the commission's Issue choice. */
  hasCurrentIssue: boolean;
  /** The current issue's display number, for the commission's Issue choice label. */
  issueNumber: string;
  onClose: () => void;
  onCommission: (payload: CommissionPayload) => void;
  onPass: (payload: PassPayload) => void;
  onHandoff: (editorId: string) => void;
  onConfirmDeletePiece: () => void;
  /** True while the delete request is in flight — disables both buttons. */
  isDeletingPiece: boolean;
}

/** Keyboard-shortcut reference. Small enough to keep inline here. */
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("magazine:desk.modals.shortcuts.title")}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="primary" onClick={onClose}>
            {t("magazine:desk.modals.shortcuts.gotIt")}
          </Button>
        </div>
      }
    >
      <div className={styles.kbdList}>
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.keys} style={{ display: "contents" }}>
            <span className={styles.kbd}>{shortcut.keys}</span>
            <span className={styles.kbdDesc}>{t(shortcut.labelKey)}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/**
 * Delete confirmation for one desk piece. Spells out what leaves with the
 * piece (the draft, its versions, its reader comments) and that the pitch it
 * was commissioned from returns to the inbox, because the backend does both
 * and an editor should know before confirming rather than after.
 */
function DeletePieceDialog({
  title,
  loading,
  onClose,
  onConfirm,
}: {
  title: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("magazine:desk.deletePiece.title", { title })}
      description={t("magazine:desk.deletePiece.description")}
      confirmLabel={t("magazine:desk.deletePiece.confirm")}
    />
  );
}

/**
 * Dispatches the desk's six overlays (commission / pass / chase / handoff /
 * delete / shortcuts) by `modal.kind`. Renders nothing while `modal` is `null`. Every
 * modal closes on Escape and scrim click via the shared `Modal` primitive.
 */
export function DeskModals({
  modal,
  editors,
  sections,
  commissionTrack,
  hasCurrentIssue,
  issueNumber,
  onClose,
  onCommission,
  onPass,
  onHandoff,
  onConfirmDeletePiece,
  isDeletingPiece,
}: DeskModalsProps) {
  if (!modal) return null;

  switch (modal.kind) {
    case "commission":
      return (
        <CommissionModal
          pitch={modal.pitch}
          sectionName={modal.sectionName}
          sections={sections}
          defaultTrack={commissionTrack}
          hasCurrentIssue={hasCurrentIssue}
          issueNumber={issueNumber}
          onClose={onClose}
          onCommission={onCommission}
        />
      );
    case "pass":
      return (
        <PassModal pitch={modal.pitch} onClose={onClose} onPass={onPass} />
      );
    case "chase":
      return <ChaseModal piece={modal.piece} onClose={onClose} />;
    case "handoff":
      return (
        <HandoffModal
          piece={modal.piece}
          editors={editors}
          onClose={onClose}
          onHandoff={onHandoff}
        />
      );
    case "deletePiece":
      return (
        <DeletePieceDialog
          title={modal.piece.title}
          loading={isDeletingPiece}
          onClose={onClose}
          onConfirm={onConfirmDeletePiece}
        />
      );
    case "shortcuts":
      return <ShortcutsModal onClose={onClose} />;
    default:
      return null;
  }
}
