import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsGroup, EditDetailsSection } from "./EditDetailsSection";
import { RsvpQuestionSwitches } from "./fields/RsvpQuestionSwitches";
import {
  MAX_CUSTOM_RSVP_QUESTION_LENGTH,
  optionValueToRsvpCutoff,
  rsvpCutoffToOptionValue,
  type RsvpQuestionKey,
} from "./gatheringExtras";
import { RSVP_CUTOFF_OPTIONS } from "./steps/whoChapter.data";

/**
 * "RSVPs" in the edit-details modal: when they close, which questions the
 * RSVP details form asks, and the host's own question.
 *
 * "When it ends" is a cutoff of `null`, which the patch sends as an explicit
 * `null`; "When it starts" is the `at-start` cutoff. Access needs stay asked (ruling R8): the switch is locked
 * on and the draft keeps `access: true` through every toggle.
 */
export function EditDetailsRsvp({
  draft,
  onChange,
}: {
  draft: GatheringDetailsDraft;
  /** Merged into the draft by the modal. */
  onChange: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  const cutoffLabel = t("gatherings:create.v2.who.rsvpCutoffLabel");

  const toggleQuestion = (key: RsvpQuestionKey) =>
    onChange({
      rsvpQuestions: {
        ...draft.rsvpQuestions,
        [key]: !draft.rsvpQuestions[key],
        access: true,
      },
    });

  return (
    <EditDetailsSection title={t("gatherings:manage.editModal.section.rsvp")}>
      <FormField label={cutoffLabel}>
        <Select
          label={cutoffLabel}
          options={RSVP_CUTOFF_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          value={rsvpCutoffToOptionValue(draft.rsvpCutoff)}
          onChange={(value) => {
            const cutoff = optionValueToRsvpCutoff(value);
            if (cutoff !== undefined) onChange({ rsvpCutoff: cutoff });
          }}
        />
      </FormField>
      <EditDetailsGroup label={t("gatherings:create.v2.care.askOnRsvpLabel")}>
        {({ labelId }) => (
          <RsvpQuestionSwitches
            questions={draft.rsvpQuestions}
            onToggle={toggleQuestion}
            labelledBy={labelId}
          />
        )}
      </EditDetailsGroup>
      <FormField label={t("gatherings:create.v2.care.customQuestionLabel")}>
        <input
          type="text"
          maxLength={MAX_CUSTOM_RSVP_QUESTION_LENGTH}
          placeholder={t("gatherings:create.v2.care.customQuestionPlaceholder")}
          value={draft.customRsvpQuestion}
          onChange={(event) =>
            onChange({ customRsvpQuestion: event.target.value })
          }
        />
      </FormField>
    </EditDetailsSection>
  );
}
