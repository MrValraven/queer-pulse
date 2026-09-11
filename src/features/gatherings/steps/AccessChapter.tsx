import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  ACCESSIBILITY_NOTE_MAX,
  ACCESSIBILITY_QUESTIONS,
} from "../../marketing/listBusiness/listingAccessibility.data";
import { Field, TextInput } from "../CreateGatheringFields";
import { GATE_ANCHOR } from "../createGathering.data";
import type { GatheringForm } from "../useGatheringForm";
import { AccessibilityAnswersField } from "./AccessibilityAnswersField";

/**
 * Chapter 4, "Can everyone get in?": the six three-valued accessibility
 * questions with a running answered count, then the host's own notes.
 *
 * The questions field carries `GATE_ANCHOR.accessibility`, so the ready
 * panel's "Accessibility answered" row lands on it.
 */
export function AccessChapter({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const questionsLabelId = `${fieldId}-questions`;
  const answeredCountId = `${fieldId}-answered-count`;
  const notesId = `${fieldId}-notes`;
  const answeredCountText = t("gatherings:create.v2.access.answeredCount", {
    answered: form.answeredAccessibilityCount,
    total: ACCESSIBILITY_QUESTIONS.length,
  });
  return (
    <>
      <Field
        label={t("gatherings:create.v2.access.questionsLabel")}
        labelId={questionsLabelId}
        anchorId={GATE_ANCHOR.accessibility}
        count={answeredCountText}
      >
        {/* The label row's count is visual only, so the group carries the
            same words as its description: "2 of 6 answered" is read out when
            focus enters the questions. A hidden element still gives its text
            to the aria-describedby that names it. */}
        <span id={answeredCountId} hidden>
          {answeredCountText}
        </span>
        <AccessibilityAnswersField
          answers={form.accessibilityAnswers}
          onAnswer={form.setAccessibilityAnswer}
          labelledBy={questionsLabelId}
          describedBy={answeredCountId}
        />
      </Field>
      <Field
        label={t("gatherings:create.v2.access.notesLabel")}
        htmlFor={notesId}
        isOptional
      >
        <TextInput
          id={notesId}
          type="text"
          maxLength={ACCESSIBILITY_NOTE_MAX}
          placeholder={t("gatherings:create.step3.notesPlaceholder")}
          value={form.accessNotes}
          onChange={(event) => form.setAccessNotes(event.target.value)}
        />
      </Field>
    </>
  );
}
