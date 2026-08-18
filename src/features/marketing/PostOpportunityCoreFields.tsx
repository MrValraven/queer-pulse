import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { OrganizationPickerField } from "./OrganizationPickerField";
import type { Cause, Commit } from "./api/volunteering.api";
import type { PostOpportunityForm } from "./usePostOpportunityForm";
import { CAUSE_OPTIONS, COMMIT_OPTIONS } from "./postVolunteerOpportunity.data";
import styles from "./PostVolunteerOpportunityPage.module.css";

/** Required core fields: who, what, where, and how big the ask is. */
export function PostOpportunityCoreFields({
  form,
}: {
  form: PostOpportunityForm;
}) {
  const { t } = useTranslation();
  const { state, set, errorFor } = form;
  return (
    <>
      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.core.basicsHeading")}
      </div>

      <OrganizationPickerField
        required
        error={errorFor("org")}
        value={{
          partnerSlug: state.partnerSlug,
          communitySlug: state.communitySlug,
        }}
        onChange={(next, meta) => {
          set("partnerSlug", next.partnerSlug);
          set("communitySlug", next.communitySlug);
          set("org", meta.name);
        }}
      />

      <FormField
        label={t("marketing:postOpportunity.core.roleLabel")}
        required
        error={errorFor("role")}
      >
        <input
          type="text"
          value={state.role}
          onChange={(e) => set("role", e.target.value)}
          placeholder={t("marketing:postOpportunity.core.rolePlaceholder")}
        />
      </FormField>

      <div className={styles.row}>
        <FormField
          label={t("marketing:postOpportunity.core.causeLabel")}
          required
        >
          <Select
            options={CAUSE_OPTIONS.map((cause) => ({
              value: cause.value,
              label: t(cause.labelKey),
            }))}
            value={state.cause}
            onChange={(value) => set("cause", value as Cause)}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.core.commitLabel")}
          required
          helper={t(
            COMMIT_OPTIONS.find((c) => c.value === state.commit)?.hintKey ?? "",
          )}
        >
          <Select
            options={COMMIT_OPTIONS.map((commit) => ({
              value: commit.value,
              label: t(commit.labelKey),
            }))}
            value={state.commit}
            onChange={(value) => set("commit", value as Commit)}
          />
        </FormField>
      </div>

      <div className={styles.sectionHead}>
        {t("marketing:postOpportunity.core.timePlaceHeading")}
      </div>

      <div className={styles.row}>
        <FormField
          label={t("marketing:postOpportunity.core.timeLabel")}
          required
          error={errorFor("time")}
        >
          <input
            type="text"
            value={state.time}
            onChange={(e) => set("time", e.target.value)}
            placeholder={t("marketing:postOpportunity.core.timePlaceholder")}
          />
        </FormField>

        <FormField
          label={t("marketing:postOpportunity.core.locationLabel")}
          required
          error={errorFor("location")}
        >
          <input
            type="text"
            value={state.location}
            onChange={(e) => set("location", e.target.value)}
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
      >
        <textarea
          rows={3}
          value={state.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t("marketing:postOpportunity.core.descPlaceholder")}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.core.skillsLabel")}
        helper={t("marketing:postOpportunity.core.skillsHelper")}
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
