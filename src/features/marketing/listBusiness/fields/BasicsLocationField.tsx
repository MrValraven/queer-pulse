import { FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { listingKindOf } from "../listingMobile.data";
import { ONLINE_CITY_MAX } from "../listingOnline.data";
import type { ListingForm } from "../useListingForm";
import { MobileAreaField } from "./MobileAreaField";
import { NeighbourhoodField } from "./NeighbourhoodField";
import styles from "../ListBusinessPage.module.css";

/**
 * Where the listing is, in Basics: the neighbourhood for a place, "Based in"
 * for an online-only business, "Where you work" for an out-and-about one
 * (its neighbourhood, when it has a meeting point, is asked with the meeting
 * point in the practical step). Each kind keeps the others' values in the
 * draft, so switching back brings them back; `draftToDto` sends only the
 * active kind's.
 */
export function BasicsLocationField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, setCity } = form;
  const kind = listingKindOf(draft);
  if (kind === "mobile") return <MobileAreaField form={form} />;
  if (kind === "place") return <NeighbourhoodField form={form} />;
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
