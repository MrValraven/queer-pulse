import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Cause, Commit } from "./api/volunteering.api";
import { OrganizationPickerField } from "./OrganizationPickerField";
import {
  CAUSE_OPTIONS,
  COMMIT_OPTIONS,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOCATION_LENGTH,
  MAX_ORGANIZATION_LENGTH,
  MAX_ROLE_LENGTH,
  MAX_TIME_LENGTH,
} from "./postVolunteerOpportunity.data";
import type { OpportunityEditDraft } from "./volunteerOpportunities.types";
import styles from "./VolunteerOpportunityModals.module.css";

/** The editable core fields, shared between `EditOpportunityModal`'s form and
 *  (structurally) the create form's `PostOpportunityCoreFields` — kept as a
 *  separate component purely to keep `EditOpportunityModal` under the
 *  200-line component limit; the field set is intentionally narrower than
 *  create's (no rich why/tasks/commitments/team body). */
export function EditOpportunityFields({
  draft,
  set,
  submitted,
}: {
  draft: OpportunityEditDraft;
  set: <K extends keyof OpportunityEditDraft>(
    key: K,
    value: OpportunityEditDraft[K],
  ) => void;
  submitted: boolean;
}) {
  const { t } = useTranslation();
  const spotsNumber = Number.parseInt(draft.spotsTotal, 10);
  const spotsValid = Number.isFinite(spotsNumber) && spotsNumber > 0;

  return (
    <div className={styles.fields}>
      <FormField
        label={t("marketing:postOpportunity.core.orgLabel")}
        required
        error={submitted && !draft.org.trim() ? "This field is required." : null}
      >
        <input
          type="text"
          value={draft.org}
          onChange={(e) => set("org", e.target.value)}
          maxLength={MAX_ORGANIZATION_LENGTH}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.core.roleLabel")}
        required
        error={submitted && !draft.role.trim() ? "This field is required." : null}
      >
        <input
          type="text"
          value={draft.role}
          onChange={(e) => set("role", e.target.value)}
          maxLength={MAX_ROLE_LENGTH}
        />
      </FormField>

      <div className={styles.row}>
        <FormField label={t("marketing:postOpportunity.core.causeLabel")}>
          <Select
            options={CAUSE_OPTIONS.map((cause) => ({
              value: cause.value,
              label: t(cause.labelKey),
            }))}
            value={draft.cause}
            onChange={(value) => set("cause", value as Cause)}
          />
        </FormField>
        <FormField label={t("marketing:postOpportunity.core.commitLabel")}>
          <Select
            options={COMMIT_OPTIONS.map((commit) => ({
              value: commit.value,
              label: t(commit.labelKey),
            }))}
            value={draft.commit}
            onChange={(value) => set("commit", value as Commit)}
          />
        </FormField>
      </div>

      <div className={styles.row}>
        <FormField
          label={t("marketing:postOpportunity.core.timeLabel")}
          required
          error={submitted && !draft.time.trim() ? "This field is required." : null}
        >
          <input
            type="text"
            value={draft.time}
            onChange={(e) => set("time", e.target.value)}
            maxLength={MAX_TIME_LENGTH}
          />
        </FormField>
        <FormField
          label={t("marketing:postOpportunity.core.locationLabel")}
          required
          error={
            submitted && !draft.location.trim() ? "This field is required." : null
          }
        >
          <input
            type="text"
            value={draft.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={MAX_LOCATION_LENGTH}
          />
        </FormField>
      </div>

      <FormField
        label={t("marketing:postOpportunity.core.spotsLabel")}
        required
        error={
          submitted && draft.spotsTotal.trim() && !spotsValid
            ? "Enter a number of spots greater than zero."
            : null
        }
      >
        <input
          type="number"
          min={1}
          value={draft.spotsTotal}
          onChange={(e) => set("spotsTotal", e.target.value)}
        />
      </FormField>

      <FormField
        label={t("marketing:postOpportunity.core.descLabel")}
        required
        error={
          submitted && !draft.description.trim() ? "This field is required." : null
        }
      >
        <textarea
          rows={3}
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
      </FormField>

      <FormField label={t("marketing:postOpportunity.core.skillsLabel")}>
        <input
          type="text"
          value={draft.skills}
          onChange={(e) => set("skills", e.target.value)}
        />
      </FormField>

      <OrganizationPickerField
        value={{
          partnerSlug: draft.partnerSlug,
          communitySlug: draft.communitySlug,
        }}
        onChange={(next) => {
          set("partnerSlug", next.partnerSlug);
          set("communitySlug", next.communitySlug);
        }}
      />
    </div>
  );
}
