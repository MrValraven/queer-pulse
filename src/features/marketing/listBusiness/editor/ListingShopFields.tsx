import { FiPlus } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import { MAX_LISTING_SHOP_ITEMS } from "../listingShop.data";
import type { ListingForm } from "../useListingForm";
import { ListingShopItemFields } from "./ListingShopItemFields";
import styles from "./ListingServices.module.css";
import shopStyles from "./ListingShop.module.css";

/**
 * "In the shop": up to six things the business sells online, each with a
 * name, a price in its own words, and an optional link and photo. The photo
 * goes through the listing photo uploader, like the gallery. Optional
 * throughout; a started item says which part is missing.
 */
export function ListingShopFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const items = form.draft.shopItems ?? [];
  const isAtCeiling = items.length >= MAX_LISTING_SHOP_ITEMS;

  return (
    <div id={ANCHOR.services}>
      <p className={styles.intro}>{t("marketing:listBusiness.shop.intro")}</p>

      {items.length === 0 ? (
        <p className={styles.empty}>{t("marketing:listBusiness.shop.empty")}</p>
      ) : (
        <div className={[styles.rows, shopStyles.list].join(" ")}>
          {items.map((item, index) => (
            <ListingShopItemFields
              key={item.id}
              form={form}
              item={item}
              position={index + 1}
              total={items.length}
            />
          ))}
        </div>
      )}

      <div className={styles.addRow}>
        <Button
          variant="ghost"
          onClick={form.addShopItem}
          disabled={isAtCeiling}
        >
          <FiPlus aria-hidden /> {t("marketing:listBusiness.shop.addCta")}
        </Button>
        <span className={styles.addHint}>
          {isAtCeiling
            ? t("marketing:listBusiness.shop.ceilingHint", {
                count: MAX_LISTING_SHOP_ITEMS,
              })
            : t("marketing:listBusiness.shop.addHint")}
        </span>
      </div>
    </div>
  );
}
