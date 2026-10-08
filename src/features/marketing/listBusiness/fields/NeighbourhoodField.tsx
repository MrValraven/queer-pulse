import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR, hoodLabel, NEIGHBOURHOODS } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

/** The neighbourhood: a place's, in Basics, or an out-and-about listing's
 *  meeting point, in the practical step. One field, one anchor. */
export function NeighbourhoodField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.hood}
      label={t("marketing:listBusiness.step1.hoodLabel")}
      required
    >
      <Select
        placeholder={t("marketing:listBusiness.step1.hoodPlaceholder")}
        options={NEIGHBOURHOODS.map((hood) => ({
          value: hood,
          label: hoodLabel(t, hood),
        }))}
        value={draft.hood || null}
        onChange={(value) => set({ hood: value ?? "" })}
      />
    </FormField>
  );
}
