import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DietaryIcon } from "./DirectoryMenuDietaryIcon";
import type { ListingMenuItem } from "./listBusiness/listingMenu.data";
import type { ListingMenuCurrency } from "./listBusiness/listingMenuPrice.data";
import { menuItemPriceDisplay } from "./listBusiness/menuItemPriceDisplay.data";
import styles from "./DirectoryMenu.module.css";

/**
 * One priced line of the public menu: name, dietary chips and description on
 * the start side, the price on the end side. An item with a glass and a bottle
 * price shows both on one line divided by a slash, and one of them alone says
 * which it is.
 */
export function DirectoryMenuItemRow({
  item,
  currency,
}: {
  item: ListingMenuItem;
  currency: ListingMenuCurrency;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const display = menuItemPriceDisplay(item, currency, fmt);
  return (
    <li className={styles.row}>
      <span className={styles.body}>
        <span className={styles.name}>{item.name}</span>
        {item.dietary.length > 0 && (
          <span className={styles.chips}>
            {item.dietary.map((label) => (
              <span key={label} className={styles.chip}>
                <DietaryIcon label={label} />
                {t(`marketing:listBusiness.menu.dietary.${label}`)}
              </span>
            ))}
          </span>
        )}
        {item.description !== "" && (
          <span className={styles.description}>{item.description}</span>
        )}
      </span>
      {display.kind === "single" && (
        <span className={styles.price}>{display.text}</span>
      )}
      {display.kind === "glassBottle" && (
        <span
          className={`${styles.price} ${styles.priceSplit}`}
          role="img"
          aria-label={t(
            "marketing:directory.detail.menu.priceGlassAndBottleAria",
            { glass: display.glass, bottle: display.bottle },
          )}
        >
          {display.glass}
          <span className={styles.priceDivider} aria-hidden>
            {" / "}
          </span>
          {display.bottle}
        </span>
      )}
      {display.kind === "glassOnly" && (
        <span className={styles.price}>
          {t("marketing:directory.detail.menu.priceGlassOnly", {
            price: display.glass,
          })}
        </span>
      )}
      {display.kind === "bottleOnly" && (
        <span className={styles.price}>
          {t("marketing:directory.detail.menu.priceBottleOnly", {
            price: display.bottle,
          })}
        </span>
      )}
    </li>
  );
}
