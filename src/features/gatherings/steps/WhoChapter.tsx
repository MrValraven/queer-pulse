import { useId } from "react";
import { SegmentedControl, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import { AudienceScopeField } from "../AudienceScopeField";
import { Field, FieldRow, SwitchRow } from "../CreateGatheringFields";
import { LANGS } from "../createGathering.data";
import {
  optionValueToRsvpCutoff,
  rsvpCutoffToOptionValue,
} from "../gatheringExtras";
import type { GatheringForm } from "../useGatheringForm";
import { CapacityStepperField } from "./CapacityStepperField";
import { CohostPickerField } from "./CohostPickerField";
import { CostKindField } from "./CostKindField";
import { RSVP_CUTOFF_OPTIONS } from "./whoChapter.data";
import styles from "./WhoChapter.module.css";

/**
 * Chapter 3, "Who is it for?": capacity, language, cost, co-hosts, the
 * waitlist and attendee-count switches, when RSVPs close, the community it is
 * posted to and who can see it. Nothing here is required.
 */
export function WhoChapter({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const languageLabelId = `${fieldId}-language`;
  const rsvpCutoffId = `${fieldId}-rsvp-cutoff`;
  const communityId = `${fieldId}-community`;
  const myCommunityOptions = useMyCommunityOptions();
  const languageLabel = t("gatherings:create.step3.langLabel");

  return (
    <>
      <CapacityStepperField form={form} />
      <Field label={languageLabel} labelId={languageLabelId}>
        <SegmentedControl
          className={styles.segment}
          label={languageLabel}
          options={LANGS.map((language) => ({
            value: language.value,
            label: t(language.labelKey),
          }))}
          value={form.lang}
          onChange={form.setLang}
        />
      </Field>
      <CostKindField form={form} />
      <CohostPickerField form={form} />
      <SwitchRow
        variant="compact"
        title={t("gatherings:create.v2.who.waitlistTitle")}
        description={t("gatherings:create.v2.who.waitlistDescription")}
        isChecked={form.allowWaitlist}
        onChange={form.setAllowWaitlist}
      />
      {/* Whether the page says how many people are coming. Defaults off for
          care and support formats: a support circle whose page reads "3 going"
          tells any reader how few people are there. */}
      <SwitchRow
        variant="compact"
        title={t("gatherings:create.step3.attendeeCountLabel")}
        description={t("gatherings:create.step3.attendeeCountHint")}
        isChecked={form.showAttendeeCount}
        onChange={form.setShowAttendeeCount}
      />
      <FieldRow>
        <Field
          label={t("gatherings:create.v2.who.rsvpCutoffLabel")}
          htmlFor={rsvpCutoffId}
        >
          <Select
            id={rsvpCutoffId}
            options={RSVP_CUTOFF_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
            value={rsvpCutoffToOptionValue(form.rsvpCutoff)}
            onChange={(value) => {
              const cutoff = optionValueToRsvpCutoff(value);
              if (cutoff !== undefined) form.setRsvpCutoff(cutoff);
            }}
          />
        </Field>
        {myCommunityOptions.length > 0 && (
          <Field
            label={t("gatherings:create.v2.who.communityLabel")}
            htmlFor={communityId}
            isOptional
          >
            <Select
              id={communityId}
              options={[
                {
                  value: "",
                  label: t("gatherings:create.step3.communityNone"),
                },
                ...myCommunityOptions.map((community) => ({
                  value: community.slug,
                  label: community.name,
                })),
              ]}
              value={form.communitySlug}
              onChange={(value) => form.setCommunitySlug(value ?? "")}
            />
          </Field>
        )}
      </FieldRow>
      <AudienceScopeField
        fieldId={`${fieldId}-audience`}
        value={form.audienceScope}
        onChange={form.setAudienceScope}
        communityAvailable={form.communitySlug !== ""}
        hintPlacement="below"
        className={styles.visibility}
        labelClassName={styles.scopeLabel}
        hintClassName={styles.scopeHint}
        groupClassName={styles.scopeGroup}
        optionClassName={styles.scopeOption}
        checkedClassName={styles.scopeOptionChecked}
        iconClassName={styles.scopeIcon}
      />
    </>
  );
}
