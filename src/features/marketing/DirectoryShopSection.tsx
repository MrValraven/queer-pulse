import { FiExternalLink } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace, websiteHref } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";
import styles from "./DirectoryShop.module.css";

/**
 * "In the shop": the few things a business that sells online puts on its page,
 * each with its photo, its name, its price in the owner's own words and, when
 * there is one, a link to the item in the business's own shop.
 *
 * An item without a photo shows the listing's own warm tint, the same one its
 * gallery placeholders wear.
 *
 * Shown in the "What it costs" slot when the listing's pricing mode is the
 * shop. Renders nothing when the business has listed no items.
 */
export function DirectoryShopSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const items = place.shopItems ?? [];
  if (items.length === 0) return null;

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.shop.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>
        {t("marketing:directory.detail.shop.sub", { name: place.name })}
      </p>
      <ul className={styles.grid}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <ImageSlot
              src={item.photo?.image ?? undefined}
              alt={item.photo?.alt ?? ""}
              height={140}
              radius={8}
              tint={place.tint}
              placeholder=""
            />
            <span className={styles.text}>
              <span className={styles.name}>{item.name}</span>
              {item.price.trim() !== "" && (
                <span className={styles.price}>{item.price}</span>
              )}
            </span>
            {item.link && (
              <Button
                variant="ghost"
                className={styles.view}
                href={websiteHref(item.link)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("marketing:directory.detail.shop.view", { item: item.name })}
                <FiExternalLink aria-hidden />
                <span className="visuallyHidden">
                  {" "}
                  {t("marketing:directory.detail.ordering.newTab")}
                </span>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
