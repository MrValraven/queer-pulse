import { FiExternalLink } from "react-icons/fi";
import { ImageSlot } from "../../../../shared/components/ui";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AMOUNT_FORMAT } from "../therapist/therapistPractical.data";
import { shopDomain } from "./editor/tattooItemDraft";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps } from "./tattooView";
import { tattooAmountText } from "./tattooView.helpers";
import styles from "./TattooOut.module.css";

/** Prints, flash sheets and merch the artist sells from their own store. */
export function TattooShop({ view, mode }: TattooBlockProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatAmount = (value: number) => format.number(value, AMOUNT_FORMAT);
  const isLinkInert = mode === "preview";
  return (
    <TattooBlock
      blockKey="shop"
      heading={t("subprofiles:tattoo.block.shop.heading")}
      hasContent={view.hasContent.shop}
      emptyBodyKey="subprofiles:tattoo.block.shop.empty"
      emptyActionKey="subprofiles:tattoo.block.shop.action"
    >
      <ul className={styles.cards}>
        {view.itemsBySection.shop.map((item) => {
          const domain = shopDomain(item.url);
          const productType = item.structured?.shop?.type ?? "other";
          const price = item.structured?.shop?.price ?? "";
          const buyLabel = t("subprofiles:tattoo.shop.buyOn", {
            domain: domain ?? "",
          });
          return (
            <li key={item.id} className={styles.card}>
              {item.imageUrl !== "" && (
                <ImageSlot
                  src={item.imageUrl}
                  alt=""
                  height={160}
                  radius={10}
                />
              )}
              <div className={styles.cardBody}>
                <h3 className={styles.rowTitle}>{item.title}</h3>
                <p className={styles.meta}>
                  {t(`subprofiles:tattoo.shop.type.${productType}`)}
                </p>
                {price !== "" && (
                  <p className={styles.price}>
                    {t("subprofiles:tattoo.flash.price", {
                      amount: tattooAmountText(price, formatAmount),
                    })}
                  </p>
                )}
              </div>
              {domain !== null &&
                (isLinkInert ? (
                  <span className={styles.buyButton}>
                    {buyLabel}
                    <FiExternalLink aria-hidden className={styles.buyIcon} />
                  </span>
                ) : (
                  <a
                    className={styles.buyButton}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {buyLabel}
                    <FiExternalLink aria-hidden className={styles.buyIcon} />
                  </a>
                ))}
            </li>
          );
        })}
      </ul>
    </TattooBlock>
  );
}
