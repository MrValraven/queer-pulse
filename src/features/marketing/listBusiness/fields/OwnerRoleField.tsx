import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

/**
 * The role printed beside the name on the public listing ("Founder", "Head
 * chef", "Co-owner").
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

  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.ownerRole}
      label={t(labelKey)}
      helper={helperKey ? t(helperKey) : undefined}
      required
    >
      <input
        type="text"
        maxLength={40}
        placeholder={t("marketing:listBusiness.step4.ownerRolePlaceholder")}
        value={draft.ownerRole}
        onChange={(event) => set({ ownerRole: event.target.value })}
      />
    </FormField>
  );
}
