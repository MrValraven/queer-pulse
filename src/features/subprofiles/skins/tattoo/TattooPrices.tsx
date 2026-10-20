import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AMOUNT_FORMAT } from "../therapist/therapistPractical.data";
import { TattooBlock } from "./TattooBlock";
import type { TattooBlockProps, TattooView } from "./tattooView";
import styles from "./TattooInfo.module.css";

/** "Free touch-ups within {months} months", or nothing when the artist
 *  charges for them or gave no window. The aftercare block shows it; the
 *  prices block carries it only while aftercare has no steps to show. */
export function TattooTouchUpLine({ view }: { view: TattooView }) {
  const { t } = useTranslation();
  const { hasFreeTouchUps, touchUpMonths } = view.prices;
  if (!hasFreeTouchUps || touchUpMonths === null) return null;
  return (
    <p className={styles.line}>
      {t("subprofiles:tattoo.prices.touchUps", {
        months: touchUpMonths,
        count: touchUpMonths,
      })}
    </p>
  );
}

/** Minimum, hourly, day rate, deposit and the cancellation text, plus the
 *  touch-up window when the aftercare block is hidden. Amounts carry the
 *  currency sign in the catalog string. */
export function TattooPrices({ view }: TattooBlockProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatAmount = (value: number) => format.number(value, AMOUNT_FORMAT);
  const { prices } = view;
  return (
    <TattooBlock
      blockKey="prices"
      heading={t("subprofiles:tattoo.block.prices.heading")}
      hasContent={view.hasContent.prices}
      emptyBodyKey="subprofiles:tattoo.block.prices.empty"
      emptyActionKey="subprofiles:tattoo.block.prices.action"
    >
      <div className={styles.stack}>
        <ul className={styles.facts}>
          {prices.minimum !== null && (
            <li className={styles.fact}>
              {t("subprofiles:tattoo.prices.minimum", {
                amount: formatAmount(prices.minimum),
              })}
            </li>
          )}
          {prices.hourly !== null && (
            <li className={styles.fact}>
              {t("subprofiles:tattoo.prices.hourly", {
                amount: formatAmount(prices.hourly),
              })}
            </li>
          )}
          {prices.dayRate !== null && (
            <li className={styles.fact}>
              {t("subprofiles:tattoo.prices.dayRate", {
                amount: formatAmount(prices.dayRate),
              })}
            </li>
          )}
          {(prices.depositAmount !== null || prices.depositNote !== "") && (
            <li className={styles.fact}>
              {prices.depositAmount !== null && (
                <>
                  <span>
                    {t("subprofiles:tattoo.prices.deposit", {
                      amount: formatAmount(prices.depositAmount),
                    })}
                  </span>
                  <span className={styles.pill}>
                    {prices.isDepositRefundable
                      ? t("subprofiles:tattoo.prices.refundable")
                      : t("subprofiles:tattoo.prices.nonRefundable")}
                  </span>
                </>
              )}
              {prices.depositNote !== "" && (
                <span className={styles.factNote}>{prices.depositNote}</span>
              )}
            </li>
          )}
        </ul>
        {prices.cancellation !== "" && (
          <div className={styles.group}>
            <h3 className={styles.subheading}>
              {t("subprofiles:tattoo.prices.cancellation")}
            </h3>
            <p className={styles.line}>{prices.cancellation}</p>
          </div>
        )}
        {!view.hasContent.aftercare && <TattooTouchUpLine view={view} />}
      </div>
    </TattooBlock>
  );
}
