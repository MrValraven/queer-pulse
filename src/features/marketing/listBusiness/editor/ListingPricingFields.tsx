import { SegmentedControl } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { pricingModeOf, type ListingPricingMode } from "../listingMenu.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuFields } from "./ListingMenuFields";
import { ListingServicesFields } from "./ListingServicesFields";
import styles from "./ListingMenu.module.css";

/**
 * Services or a menu: which priced list the public page shows. Switching
 * never deletes the other list, and the hint under the switch says so.
 */
export function ListingPricingFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const pricingMode = pricingModeOf(form.draft);

  return (
    <>
      <div className={styles.modeRow}>
        <SegmentedControl
          label={t("marketing:listBusiness.pricing.modeLabel")}
          options={[
            {
              value: "services",
              label: t("marketing:listBusiness.pricing.mode.services"),
            },
            {
              value: "menu",
              label: t("marketing:listBusiness.pricing.mode.menu"),
            },
          ]}
          value={pricingMode}
          onChange={(value) => form.setPricingMode(value as ListingPricingMode)}
        />
        <p className={styles.modeHint}>
          {t("marketing:listBusiness.pricing.keptHint")}
        </p>
      </div>
      {pricingMode === "menu" ? (
        <ListingMenuFields form={form} />
      ) : (
        <ListingServicesFields form={form} />
      )}
    </>
  );
}
