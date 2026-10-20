import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import { useRovingRadioGroup } from "../../../shared/hooks/useRovingRadioGroup";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowScopeKind } from "../quizshowScope";
import {
  QUIZSHOW_LIMITS,
  type QuizshowContentLabel,
  type QuizshowLanguageMode,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { changeRoundKind, type QuizshowDraftRound } from "./quizshowDraft";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import { QuizshowRoundSettingsFields } from "./QuizshowRoundSettingsFields";
import styles from "./QuizshowRounds.module.css";

const ROUND_KINDS: readonly QuizshowRoundKind[] = [
  "quiz",
  "lie_detector",
  "caption_this",
  "drag_name",
];

const CONTENT_LABELS: readonly QuizshowContentLabel[] = [
  "none",
  "spicy",
  "sensitive",
  "adults",
];

interface ContentLabelPickerProps {
  value: QuizshowContentLabel;
  isAdultsEvent: boolean;
  onChange: (label: QuizshowContentLabel) => void;
}

function ContentLabelPicker({
  value,
  isAdultsEvent,
  onChange,
}: ContentLabelPickerProps) {
  const { t } = useTranslation();
  const scopeKind = useQuizshowScopeKind();
  const labelId = useId();
  const lockedId = useId();
  const select = (label: QuizshowContentLabel) => {
    if (label === "adults" && !isAdultsEvent) return;
    onChange(label);
  };
  const { getRadioProps } = useRovingRadioGroup<HTMLButtonElement>({
    optionCount: CONTENT_LABELS.length,
    checkedIndex: CONTENT_LABELS.indexOf(value),
    onSelect: (index) => {
      const label = CONTENT_LABELS[index];
      if (label) select(label);
    },
  });
  return (
    <div className={styles.fieldGroup}>
      <span id={labelId} className={styles.groupLabel}>
        {t("quizshow:rounds.contentLabel.label")}
      </span>
      <p className={styles.hint}>{t("quizshow:rounds.contentLabel.hint")}</p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={styles.optionGrid}
      >
        {CONTENT_LABELS.map((label, labelIndex) => {
          const isLocked = label === "adults" && !isAdultsEvent;
          return (
            <button
              key={label}
              {...getRadioProps(labelIndex)}
              type="button"
              role="radio"
              aria-checked={value === label}
              aria-disabled={isLocked || undefined}
              aria-describedby={isLocked ? lockedId : undefined}
              className={styles.choice}
              onClick={() => select(label)}
            >
              {t(`quizshow:contentLabel.${label}`)}
            </button>
          );
        })}
      </div>
      <Collapse isOpen={!isAdultsEvent}>
        <p id={lockedId} className={styles.hint}>
          {t(
            scopeKind === "game"
              ? "quizshow:rounds.contentLabel.adultsLockedGame"
              : "quizshow:rounds.contentLabel.adultsLocked",
          )}
        </p>
      </Collapse>
    </div>
  );
}

interface QuizshowRoundEditorProps {
  round: QuizshowDraftRound;
  roundIndex: number;
  isAdultsEvent: boolean;
  /** The quiz's languages; both languages when omitted. */
  languages?: QuizshowLanguageMode;
  onChange: (
    patch: Partial<
      Pick<QuizshowDraftRound, "title" | "contentLabel" | "settings">
    >,
  ) => void;
  onChangeKind: (kind: QuizshowRoundKind) => void;
}

function wouldDropQuestions(
  round: QuizshowDraftRound,
  kind: QuizshowRoundKind,
): boolean {
  const keptKeys = new Set(
    changeRoundKind(round, kind).questions.map(({ draftKey }) => draftKey),
  );
  return round.questions.some(({ draftKey }) => !keptKeys.has(draftKey));
}

export function QuizshowRoundEditor({
  round,
  roundIndex,
  isAdultsEvent,
  languages = "both",
  onChange,
  onChangeKind,
}: QuizshowRoundEditorProps) {
  const { t } = useTranslation();
  const kindLabelId = useId();
  const [pendingKind, setPendingKind] = useState<QuizshowRoundKind | null>(
    null,
  );
  const handlePickKind = (kind: QuizshowRoundKind) => {
    if (kind === round.kind) return;
    if (wouldDropQuestions(round, kind)) {
      setPendingKind(kind);
      return;
    }
    onChangeKind(kind);
  };
  return (
    <div className={styles.fields} data-round-index={roundIndex}>
      <QuizshowBilingualInput
        label={t("quizshow:rounds.title.label")}
        value={round.title}
        languages={languages}
        maxLength={QUIZSHOW_LIMITS.roundTitleMax}
        onChange={(title) => onChange({ title })}
      />
      <div className={styles.fieldGroup}>
        <span id={kindLabelId} className={styles.groupLabel}>
          {t("quizshow:rounds.kind.label")}
        </span>
        <RadioCardGroup
          value={round.kind}
          ariaLabel={t("quizshow:rounds.kind.label")}
          ariaLabelledBy={kindLabelId}
          className={styles.optionGrid}
          optionClassName={styles.kindOption}
          checkedClassName={styles.kindChecked}
          onChange={handlePickKind}
          options={ROUND_KINDS.map((kind) => ({
            id: kind,
            render: (
              <>
                <span className={styles.kindName}>
                  {t(`quizshow:kind.${kind}.name`)}
                </span>
                <span className={styles.kindHint}>
                  {t(`quizshow:kind.${kind}.hint`)}
                </span>
              </>
            ),
          }))}
        />
      </div>
      <ContentLabelPicker
        value={round.contentLabel}
        isAdultsEvent={isAdultsEvent}
        onChange={(contentLabel) => onChange({ contentLabel })}
      />
      <QuizshowRoundSettingsFields
        kind={round.kind}
        settings={round.settings}
        onChange={(settings) => onChange({ settings })}
      />
      <AnimatePresence>
        {pendingKind !== null && (
          <ConfirmDialog
            open
            tone="destructive"
            title={t("quizshow:rounds.kindChangeTitle")}
            description={t("quizshow:rounds.kindChangeBody")}
            confirmLabel={t("quizshow:rounds.kindChangeCta")}
            cancelLabel={t("quizshow:common.cancel")}
            onClose={() => setPendingKind(null)}
            onConfirm={() => {
              if (pendingKind) onChangeKind(pendingKind);
              setPendingKind(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
