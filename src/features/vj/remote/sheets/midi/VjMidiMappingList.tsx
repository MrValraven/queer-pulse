import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiTrash2 } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  IconButton,
} from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useQuizshowDarkDialog } from "../../../../quizshow/builder/useQuizshowDarkDialog";
import type { VjMidiMapping } from "../../midi/vjMidiMappings";
import { vjMidiControlLabel, vjMidiTargetLabel } from "./vjMidiLabels";
import styles from "./VjMidiSheet.module.css";

export interface VjMidiMappingListProps {
  mappings: readonly VjMidiMapping[];
  onRemove: (controlKey: string) => void;
  onRemoveAll: () => void;
}

/** Asks before every mapping on this device goes; Cancel takes the focus first. */
function VjMidiRemoveAllDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const darkDialogRef = useQuizshowDarkDialog();
  return (
    <ConfirmDialog
      open
      tone="destructive"
      initialFocus="cancel"
      title={t("vj:midi.removeAllTitle")}
      confirmLabel={t("vj:midi.removeAll")}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <p ref={darkDialogRef} className={styles.hint}>
        {t("vj:midi.savedOnDevice")}
      </p>
    </ConfirmDialog>
  );
}

/** One mapping: the controller's key or knob over the target it drives, and Remove mapping. */
function VjMidiMappingRow({
  mapping,
  onRemove,
}: {
  mapping: VjMidiMapping;
  onRemove: (controlKey: string) => void;
}) {
  const { t } = useTranslation();
  const targetLabel = vjMidiTargetLabel(mapping.target, t);
  return (
    <div className={styles.rowSpacer}>
      <div className={styles.mappingRow} data-vj-midi-mapping="">
        <div className={styles.mappingText}>
          <span className={styles.mappingTarget}>{targetLabel}</span>
          <span className={styles.mappingControl}>
            {vjMidiControlLabel(mapping.controlKey, t)}
          </span>
        </div>
        <IconButton
          tone="dark"
          aria-label={t("vj:midi.removeMapping", { target: targetLabel })}
          onClick={() => onRemove(mapping.controlKey)}
        >
          <FiTrash2 aria-hidden fill="none" />
        </IconButton>
      </div>
    </div>
  );
}

/**
 * The mappings saved on this device. Rows grow in and fold away as they are
 * learned and removed; Remove all mappings asks first.
 */
export function VjMidiMappingList({
  mappings,
  onRemove,
  onRemoveAll,
}: VjMidiMappingListProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const hasMappings = mappings.length > 0;

  const confirmRemoveAll = () => {
    onRemoveAll();
    setIsConfirmOpen(false);
  };

  return (
    <section
      className={styles.section}
      aria-labelledby={titleId}
      data-vj-midi-mappings=""
    >
      <h4 id={titleId} className={styles.sectionTitle}>
        {t("vj:midi.mappings")}
      </h4>
      <Collapse isOpen={!hasMappings}>
        <p className={styles.hint}>{t("vj:midi.mappingsEmpty")}</p>
      </Collapse>
      <ul className={styles.list} aria-labelledby={titleId}>
        <AnimatePresence initial={false}>
          {mappings.map((mapping) => (
            <CollapseListItem key={mapping.controlKey}>
              <VjMidiMappingRow mapping={mapping} onRemove={onRemove} />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={hasMappings}>
        <div className={styles.removeAll}>
          <Button
            variant="stage-ghost"
            className={styles.wideButton}
            onClick={() => setIsConfirmOpen(true)}
          >
            {t("vj:midi.removeAll")}
          </Button>
        </div>
      </Collapse>
      <p className={styles.hint}>{t("vj:midi.savedOnDevice")}</p>
      <AnimatePresence>
        {isConfirmOpen && (
          <VjMidiRemoveAllDialog
            onConfirm={confirmRemoveAll}
            onClose={() => setIsConfirmOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
