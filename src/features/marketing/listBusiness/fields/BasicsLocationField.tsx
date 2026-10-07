import { FormField, Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR, hoodLabel, NEIGHBOURHOODS } from "../listBusiness.data";
import { ONLINE_CITY_MAX } from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import styles from "../ListBusinessPage.module.css";

/**
 * Where the listing is, in Basics: the neighbourhood for a place, "Based in"
 * for an online-only business. Each kind keeps the other's value in the
 * draft, so switching back brings it back; `draftToDto` sends only the
 * active one. "Based in" is optional; the card reads "Online · {city}", or
 * "Online" while it is empty.
 */
export function BasicsLocationField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, set, setCity } = form;
  if (draft.online) {
    return (
      <FormField
        className={styles.lbField}
        id={ANCHOR.city}
        label={t("marketing:listBusiness.step1.cityLabel")}
        helper={t("marketing:listBusiness.step1.cityHelper")}
      >
        <input
          type="text"
          maxLength={ONLINE_CITY_MAX}
          placeholder={t("marketing:listBusiness.step1.cityPlaceholder")}
          value={draft.city ?? ""}
          onChange={(event) => setCity(event.target.value)}
        />
      </FormField>
    );
  }
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
