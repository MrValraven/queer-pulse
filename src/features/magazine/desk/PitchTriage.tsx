import { useRef, useState, type ReactNode } from "react";
import { Modal } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Pitch } from "../data/desk.data";
import { PitchTriageBody } from "./PitchTriageBody";
import { PitchTriageDone, PitchTriageLoading } from "./PitchTriageDone";
import { PitchTriageBulkRow, PitchTriageShortcuts } from "./PitchTriageFooter";
import type { PitchTriageMode } from "./PitchTriageModeSwitch";
import { usePitchTriageAnswers } from "./usePitchTriageAnswers";
import { usePitchTriageFocus } from "./usePitchTriageFocus";
import { usePitchTriageKeys } from "./usePitchTriageKeys";
import { usePitchTriageQueue } from "./usePitchTriageQueue";
import styles from "./PitchTriage.module.css";

export interface PitchTriageProps {
  isOpen: boolean;
  onClose: () => void;
  pitches: Pitch[];
  /** True while the pitch list is still loading (`usePitches().isLoading`). */
  isLoading?: boolean;
  /** Open on this pitch instead of the first one, also once a loading list
   *  arrives. */
  initialPitchId?: string | null;
  /** Ids fading out after a decision (from `usePitchTriageActions`). */
  leavingPitchIds: string[];
  /** Opens the commission flow prefilled from the pitch. */
  onCommission: (pitch: Pitch) => void;
  onMaybe: (pitchId: string) => void;
  /** Opens the pass flow, where the editor writes the writer a note. */
  onPass: (pitch: Pitch) => void;
  selectedPitchIds: string[];
  onToggleSelect: (pitchId: string) => void;
  onBulkMaybe: () => void;
  onBulkPass: () => void;
  onClearSelection: () => void;
  /** How long the writer has waited, shown muted when the view model has it. */
  pitchAgeLabel?: (pitch: Pitch) => string | null;
  /**
   * Stop-gap for demo mode: pitches answered in a dialog stacked on the
   * overlay (a pass note sent, a commission made). Demo mode keeps serving the
   * same pitches, so the overlay moves on from these ids itself. The page adds
   * an id only after that submit succeeds, so a failed request keeps the
   * pitch in view. Can go once demo answers drop pitches from the demo list.
   */
  answeredPitchIds?: string[];
}

/**
 * Commissioning as a focused pass over the inbox: one pitch at a time with
 * y / n / arrow keys, or the whole inbox as a checklist to answer in bulk.
 * Writers deserve a timely answer, and an editor clears a queue faster with
 * one decision in view than with the inbox sharing the page with the desk.
 * Mounted only while open, so each opening starts from a fresh queue.
 */
export function PitchTriage(props: PitchTriageProps) {
  if (!props.isOpen) return null;
  return <PitchTriageDialog {...props} />;
}

function PitchTriageDialog({
  onClose,
  pitches,
  isLoading = false,
  initialPitchId,
  leavingPitchIds,
  selectedPitchIds,
  onToggleSelect,
  onClearSelection,
  pitchAgeLabel,
  answeredPitchIds,
  onCommission,
  onMaybe,
  onPass,
  onBulkMaybe,
  onBulkPass,
}: PitchTriageProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [mode, setMode] = useState<PitchTriageMode>("card");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);
  const triage = usePitchTriageQueue({
    pitches,
    leavingPitchIds,
    answeredPitchIds,
    initialPitchId,
  });
  const { currentPitch, queue } = triage;
  const answers = usePitchTriageAnswers({
    leavingPitchIds,
    selectedPitchIds,
    markAnswered: triage.markAnswered,
    onCommission,
    onMaybe,
    onPass,
    onBulkMaybe,
    onBulkPass,
  });
  // With nothing in the queue the body is a skeleton while loading, "all
  // answered" once this opening had pitches, else a plain empty line.
  const isQueueEmpty = queue.length === 0;
  const endState = triage.hasHadPitches ? "answered" : "empty";
  const isDone = isQueueEmpty && !isLoading;

  usePitchTriageKeys({
    isEnabled: mode === "card" && currentPitch !== null,
    scopeRef,
    onMaybe: () => answers.answerMaybe(currentPitch),
    onPass: () => answers.answerPass(currentPitch),
    onPrevious: triage.goToPrevious,
    onNext: triage.goToNext,
  });

  usePitchTriageFocus({
    headingRef,
    focusKey: isDone ? endState : (currentPitch?.id ?? null),
    isEnabled: mode === "card" || isDone,
  });

  const progressLabel =
    mode === "card"
      ? t("magazine:desk.triage.progress", {
          current: format.number(triage.currentIndex + 1),
          total: format.number(queue.length),
        })
      : t("magazine:desk.triage.waiting", { count: queue.length });

  let footer: ReactNode = null;
  if (!isQueueEmpty && mode === "card") footer = <PitchTriageShortcuts />;
  if (!isQueueEmpty && mode === "list") {
    footer = (
      <PitchTriageBulkRow
        selectedCount={selectedPitchIds.length}
        onBulkMaybe={answers.answerSelectionMaybe}
        onBulkPass={answers.answerSelectionPass}
        onClearSelection={onClearSelection}
      />
    );
  }

  let body: ReactNode;
  if (isDone) {
    body = (
      <PitchTriageDone
        variant={endState}
        headingRef={headingRef}
        onClose={onClose}
      />
    );
  } else if (isQueueEmpty) {
    body = <PitchTriageLoading />;
  } else {
    body = (
      <PitchTriageBody
        mode={mode}
        onModeChange={setMode}
        triage={triage}
        answers={answers}
        headingRef={headingRef}
        leavingPitchIds={leavingPitchIds}
        selectedPitchIds={selectedPitchIds}
        onToggleSelect={onToggleSelect}
        pitchAgeLabel={pitchAgeLabel}
      />
    );
  }

  return (
    <Modal
      title={t("magazine:desk.triage.title")}
      sub={
        isQueueEmpty ? undefined : (
          <span className={styles.progress}>{progressLabel}</span>
        )
      }
      wide
      onClose={onClose}
      footer={footer}
      initialFocusRef={headingRef}
    >
      <div ref={scopeRef} className={styles.triage}>
        {body}
      </div>
    </Modal>
  );
}
