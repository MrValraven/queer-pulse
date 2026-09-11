import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextInput } from "../CreateGatheringFields";
import { ContentNoteChips } from "../fields/ContentNoteChips";
import { RsvpQuestionSwitches } from "../fields/RsvpQuestionSwitches";
import {
  MAX_CUSTOM_RSVP_QUESTION_LENGTH,
  MAX_HOUSE_RULES_LENGTH,
} from "../gatheringExtras";
import type { GatheringForm } from "../useGatheringForm";

/**
 * Chapter 5, "Taking care." (optional): house rules, content notes, which
 * questions the RSVP details form asks, and the host's own question.
 *
 * The chips and the switches are the shared fields the edit-details modal
 * uses too. Access needs is always asked (ruling R8), so its row is locked on
 * and the form's `access` flag is left alone.
 */
export function CareChapter({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const houseRulesId = `${fieldId}-house-rules`;
  const contentNotesLabelId = `${fieldId}-content-notes`;
  const askOnRsvpLabelId = `${fieldId}-ask-on-rsvp`;
  const customQuestionId = `${fieldId}-custom-question`;
  return (
    <>
      <Field
        label={t("gatherings:create.v2.care.houseRulesLabel")}
        htmlFor={houseRulesId}
        isOptional
        count={`${form.houseRules.length}/${MAX_HOUSE_RULES_LENGTH}`}
      >
        <TextInput
          id={houseRulesId}
          type="text"
          maxLength={MAX_HOUSE_RULES_LENGTH}
          placeholder={t("gatherings:create.v2.care.houseRulesPlaceholder")}
          value={form.houseRules}
          onChange={(event) => form.setHouseRules(event.target.value)}
        />
      </Field>
      <Field
        label={t("gatherings:create.v2.care.contentNotesLabel")}
        labelId={contentNotesLabelId}
        isOptional
      >
        <ContentNoteChips
          selectedNotes={form.contentNotes}
          onToggle={form.toggleContentNote}
          labelledBy={contentNotesLabelId}
        />
      </Field>
      <Field
        label={t("gatherings:create.v2.care.askOnRsvpLabel")}
        labelId={askOnRsvpLabelId}
        isOptional
      >
        <RsvpQuestionSwitches
          questions={form.rsvpQuestions}
          onToggle={form.toggleRsvpQuestion}
          labelledBy={askOnRsvpLabelId}
        />
      </Field>
      <Field
        label={t("gatherings:create.v2.care.customQuestionLabel")}
        htmlFor={customQuestionId}
        isOptional
        count={`${form.customRsvpQuestion.length}/${MAX_CUSTOM_RSVP_QUESTION_LENGTH}`}
      >
        <TextInput
          id={customQuestionId}
          type="text"
          maxLength={MAX_CUSTOM_RSVP_QUESTION_LENGTH}
          placeholder={t("gatherings:create.v2.care.customQuestionPlaceholder")}
          value={form.customRsvpQuestion}
          onChange={(event) => form.setCustomRsvpQuestion(event.target.value)}
        />
      </Field>
    </>
  );
}
