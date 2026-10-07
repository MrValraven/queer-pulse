import { SegmentedControl } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingPricingMode } from "../listingMenu.data";
import { effectivePricingMode, pricingModeChoices } from "../listingShop.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuFields } from "./ListingMenuFields";
import { ListingServicesFields } from "./ListingServicesFields";
import { ListingShopFields } from "./ListingShopFields";
import styles from "./ListingMenu.module.css";

/**
 * Services, a menu or the shop: which priced list the public page shows. An
 * online-only listing is offered Services and In the shop; a place Services
 * and Menu; a place that also sells online all three. Switching never deletes
 * another list, and the hint under the switch says so.
 *
 * The active list is the one a save sends (`effectivePricingMode`): a stored
 * "shop" on a place that no longer sells online shows its category's list,
 * the same one the missing-fields rules check, and the stale shop is not
 * offered as a choice.
 */
export function ListingPricingFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const pricingMode = effectivePricingMode(form.draft);
  const choices = pricingModeChoices({ ...form.draft, pricingMode });

  return (
    <>
      <div id={ANCHOR.pricingMode} className={styles.modeRow}>
        <SegmentedControl
          label={t("marketing:listBusiness.pricing.modeLabel")}
          options={choices.map((mode) => ({
            value: mode,
            label: t(`marketing:listBusiness.pricing.mode.${mode}`),
          }))}
          value={pricingMode}
          onChange={(value) => form.setPricingMode(value as ListingPricingMode)}
        />
        <p className={styles.modeHint}>
          {t("marketing:listBusiness.pricing.keptHint")}
        </p>
      </div>
      {pricingMode === "menu" ? (
        <ListingMenuFields form={form} />
      ) : pricingMode === "shop" ? (
        <ListingShopFields form={form} />
      ) : (
        <ListingServicesFields form={form} />
      )}
    </>
  );
}
