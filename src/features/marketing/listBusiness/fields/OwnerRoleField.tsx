import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR, OWNER_ROLE_LABEL_KEYS } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

/**
 * The role printed beside the name on the public listing ("Founder", "Head
 * chef", "Co-owner"), picked from `OWNER_ROLE_LABEL_KEYS`.
 *
 * Its own file because it belongs to the BUSINESS rather than to the owner as
 * a person, which makes it the one field of the "About you" block a co-manager
 * still sees and still edits. Both the owner's full block and the co-manager's
 * short one render this same component, so the two cannot drift.
 *
 * The label is overridable for exactly that reason: to the owner it is "your
 * role", and to a co-manager it is the role printed beside somebody else's
 * name, which is a different sentence for the same field.
 */
export function OwnerRoleField({
  form,
  labelKey = "marketing:listBusiness.step4.ownerRoleLabel",
  helperKey,
}: {
  form: ListingForm;
  labelKey?: string;
  helperKey?: string;
}) {
  const { t } = useTranslation();
  const { draft, set } = form;

  const roleLabels = OWNER_ROLE_LABEL_KEYS.map((key) => t(key));
  // A value saved as free text before the dropdown existed, or in the other
  // language, stays on the list so reopening the listing keeps it.
  const isSavedValueOffList =
    draft.ownerRole !== "" && !roleLabels.includes(draft.ownerRole);
  const options = (
    isSavedValueOffList ? [draft.ownerRole, ...roleLabels] : roleLabels
  ).map((label) => ({ value: label, label }));

  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.ownerRole}
      label={t(labelKey)}
      helper={helperKey ? t(helperKey) : undefined}
      required
    >
      <Select
        options={options}
        searchable={false}
        placeholder={t("marketing:listBusiness.step4.ownerRolePlaceholder")}
        value={draft.ownerRole || null}
        onChange={(value) => set({ ownerRole: value ?? "" })}
      />
    </FormField>
  );
}
