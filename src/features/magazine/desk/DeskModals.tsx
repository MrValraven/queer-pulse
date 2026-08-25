import { Modal, Button } from "../../../shared/components/ui";
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
        {SHORTCUTS.map(([key, label]) => (
          <div key={key} style={{ display: "contents" }}>
            <span className={styles.kbd}>{key}</span>
            <span className={styles.kbdDesc}>{label}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/**
 * Dispatches the desk's five overlays (commission / pass / chase / handoff /
 * shortcuts) by `modal.kind`. Renders nothing while `modal` is `null`. Every
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
    case "shortcuts":
      return <ShortcutsModal onClose={onClose} />;
    default:
      return null;
  }
}
