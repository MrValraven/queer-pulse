import type { RefObject } from "react";
import type { Pitch } from "../data/desk.data";
import { PitchTriageCard } from "./PitchTriageCard";
import { PitchTriageList } from "./PitchTriageList";
import {
  PitchTriageModeSwitch,
  type PitchTriageMode,
} from "./PitchTriageModeSwitch";
import type { usePitchTriageAnswers } from "./usePitchTriageAnswers";
import type { usePitchTriageQueue } from "./usePitchTriageQueue";

export interface PitchTriageBodyProps {
  mode: PitchTriageMode;
  onModeChange: (mode: PitchTriageMode) => void;
  triage: ReturnType<typeof usePitchTriageQueue>;
  answers: ReturnType<typeof usePitchTriageAnswers>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  leavingPitchIds: string[];
  selectedPitchIds: string[];
  onToggleSelect: (pitchId: string) => void;
  pitchAgeLabel?: (pitch: Pitch) => string | null;
}

/**
 * The overlay's body while pitches wait: the view switch, then either the
 * current pitch or the checklist. Both read the same queue and answers, so a
 * pitch answered in one view is gone from the other.
 */
export function PitchTriageBody({
  mode,
  onModeChange,
  triage,
  answers,
  headingRef,
  leavingPitchIds,
  selectedPitchIds,
  onToggleSelect,
  pitchAgeLabel,
}: PitchTriageBodyProps) {
  const { currentPitch } = triage;
  return (
    <>
      <PitchTriageModeSwitch mode={mode} onModeChange={onModeChange} />
      {mode === "card" && currentPitch ? (
        <PitchTriageCard
          pitch={currentPitch}
          headingRef={headingRef}
          isLeaving={answers.isLeaving(currentPitch)}
          hasPrevious={triage.hasPrevious}
          hasNext={triage.hasNext}
          onPrevious={triage.goToPrevious}
          onNext={triage.goToNext}
          onCommission={answers.answerCommission}
          onMaybe={answers.answerMaybe}
          onPass={answers.answerPass}
          pitchAgeLabel={pitchAgeLabel}
        />
      ) : null}
      {mode === "list" ? (
        <PitchTriageList
          pitches={triage.queue}
          leavingPitchIds={leavingPitchIds}
          selectedPitchIds={selectedPitchIds}
          onToggleSelect={onToggleSelect}
          onCommission={answers.answerCommission}
          onMaybe={answers.answerMaybe}
          onPass={answers.answerPass}
          pitchAgeLabel={pitchAgeLabel}
        />
      ) : null}
    </>
  );
}
