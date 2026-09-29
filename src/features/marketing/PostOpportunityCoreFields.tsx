import {
  ChipSelect,
  FormField,
  RadioCardGroup,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { OrganizationField } from "./OrganizationField";
import type { Cause, Commit } from "./api/volunteering.api";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import { CAUSES, MAX_CAUSES } from "./causes.data";
import {
  CAUSE_PICKER_CONTROL_ID,
  COMMIT_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_ROLE_LENGTH,
  MAX_SKILL_LENGTH,
  MAX_SKILLS_COUNT,
  MAX_TIME_LENGTH,
  requiredFieldControlId,
} from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Required core fields: who, what, where, and how big the ask is. */
export function PostOpportunityCoreFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const { state, set, errorFor } = form;
  // Appends rather than sorts: `causes[0]` is the cause the poster led with,
  // and it is what the card prints first and takes its tint from.
  const toggleCause = (value: Cause) =>
    set(
      "causes",
      state.causes.includes(value)
        ? state.causes.filter((cause) => cause !== value)
        : [...state.causes, value],
    );
  const leadCause = CAUSES.find((cause) => cause.value === state.causes[0]);
  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.core.basicsHeading")}
      </div>

      <OrganizationField form={form} />

      <FormField
        label={t("marketing:postOpportunity.core.roleLabel")}
        required
        error={errorFor("role")}
        labelAside={`${state.role.length}/${MAX_ROLE_LENGTH}`}
      >
        <input
          id={requiredFieldControlId("role")}
          type="text"
          value={state.role}
          onChange={(e) => set("role", e.target.value)}
          maxLength={MAX_ROLE_LENGTH}
          placeholder={t("marketing:postOpportunity.core.rolePlaceholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.core.causeLabel")}
        required
        labelAside={`${state.causes.length}/${MAX_CAUSES}`}
        helper={
          leadCause
            ? t("marketing:postOpportunity.core.causeHelperLead", {
                max: MAX_CAUSES,
                cause: t(leadCause.labelKey),
              })
            : t("marketing:postOpportunity.core.causeHelper", {
                max: MAX_CAUSES,
              })
        }
      >
        {/* Chips rather than a dropdown: an opportunity may claim up to
            three causes, and a picker that shows the whole taxonomy at once
            is also what stops a poster settling for the first roughly-right
            option in a list of thirteen. Full width so the chips wrap into
            a few dense rows instead of one tall column. */}
        <ChipSelect
          id={CAUSE_PICKER_CONTROL_ID}
          label={t("marketing:postOpportunity.core.causeLabel")}
          options={CAUSES.map((cause) => ({
            value: cause.value,
            label: t(cause.labelKey),
          }))}
          selected={new Set<string>(state.causes)}
          maxSelected={MAX_CAUSES}
          onToggle={(value) => toggleCause(value as Cause)}
        />
      </FormField>

      <CommitLevelField form={form} />

      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.core.timePlaceHeading")}
      </div>

      <div className={styles.row}>
        <FormField
          label={t("marketing:postOpportunity.core.timeLabel")}
          required
          error={errorFor("time")}
          labelAside={`${state.time.length}/${MAX_TIME_LENGTH}`}
        >
          <input
            id={requiredFieldControlId("time")}
            type="text"
            value={state.time}
            onChange={(e) => set("time", e.target.value)}
            maxLength={MAX_TIME_LENGTH}
            placeholder={t("marketing:postOpportunity.core.timePlaceholder")}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.core.locationLabel")}
          required
          error={errorFor("location")}
          labelAside={`${state.location.length}/${MAX_LOCATION_LENGTH}`}
        >
          <input
            id={requiredFieldControlId("location")}
            type="text"
            value={state.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={MAX_LOCATION_LENGTH}
            placeholder={t(
              "marketing:postOpportunity.core.locationPlaceholder",
            )}
          />
        </FormField>
      </div>

      <FormField
        label={t("marketing:postOpportunity.core.spotsLabel")}
        required
        error={errorFor("spotsTotal")}
        helper={t("marketing:postOpportunity.core.spotsHelper")}
      >
        <input
          id={requiredFieldControlId("spotsTotal")}
          type="number"
          min={1}
          value={state.spotsTotal}
          onChange={(e) => set("spotsTotal", e.target.value)}
          placeholder={t("marketing:postOpportunity.core.spotsPlaceholder")}
        />
      </FormField>

      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.core.pitchHeading")}
      </div>

      <FormField
        label={t("marketing:postOpportunity.core.descLabel")}
        required
        error={errorFor("description")}
        helper={t("marketing:postOpportunity.core.descHelper")}
        labelAside={`${state.description.length}/${MAX_DESCRIPTION_LENGTH}`}
      >
        <textarea
          id={requiredFieldControlId("description")}
          className={styles.textarea}
          rows={3}
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder={t("marketing:postOpportunity.core.descPlaceholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.core.skillsLabel")}
        helper={t("marketing:postOpportunity.core.skillsHelper", {
          maxCount: MAX_SKILLS_COUNT,
          maxLength: MAX_SKILL_LENGTH,
        })}
      >
        <input
          type="text"
          value={state.skills}
          onChange={(e) => set("skills", e.target.value)}
          placeholder={t("marketing:postOpportunity.core.skillsPlaceholder")}
        />
      </FormField>
    </>
  );
}

/** Commitment level as two side-by-side cards, each carrying its own hint. */
function CommitLevelField({ form }: { form: PostOpportunityForm }) {
  const { t } = useTranslation();
  const { state, set } = form;
  return (
    <FormField label={t("marketing:postOpportunity.core.commitLabel")} required>
      {/* Two tiers, so both sit on screen with their meaning attached
        instead of hiding one hint behind a dropdown. */}
      <RadioCardGroup<Commit>
        className={styles.commitChoices}
        optionClassName={styles.commitChoice}
        checkedClassName={styles.commitChoiceOn}
        ariaLabel={t("marketing:postOpportunity.core.commitLabel")}
        value={state.commit}
        onChange={(value) => set("commit", value)}
        options={COMMIT_OPTIONS.map((commit) => ({
          id: commit.value,
          render: (
            <>
              <span className={styles.commitChoiceLabel}>
                {t(commit.labelKey)}
              </span>
              <span className={styles.commitChoiceHint}>
                {t(commit.hintKey)}
              </span>
            </>
          ),
        }))}
      />
    </FormField>
  );
}
