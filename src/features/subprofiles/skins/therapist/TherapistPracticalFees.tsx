import { FiCheck, FiCreditCard } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AMOUNT_FORMAT, MAX_SLIDING_PILLS } from "./therapistPractical.data";
import { PracticalCell, PracticalRow } from "./TherapistPracticalCells";
import { PracticalEditLink } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import type { TherapistView } from "./therapistView";
import { parseAmount } from "./therapistView.helpers";
import styles from "./TherapistPractical.module.css";

/** Lowest amount among owner-typed prices ("€60", "90€"); null when none
 *  holds a number. */
function lowestAmount(prices: string[]): number | null {
  const amounts = prices
    .map((price) => parseAmount(price))
    .filter((amount): amount is number => amount !== null);
  return amounts.length > 0 ? Math.min(...amounts) : null;
}

/** One pill per sliding-scale place; the taken ones are filled. */
function SlidingPlaces({ places, open }: { places: number; open: number }) {
  const { t } = useTranslation();
  const openCount = Math.min(Math.max(0, open), places);
  // Past the cap, the open places keep their pills and the taken ones shrink.
  const shownCount = Math.min(places, MAX_SLIDING_PILLS);
  const takenShown = shownCount - Math.min(openCount, shownCount);
  const pills = Array.from(
    { length: shownCount },
    (_unused, index) => index < takenShown,
  );
  return (
    <>
      <div className={styles.places} aria-hidden="true">
        {pills.map((isTaken, index) => (
          <span
            key={index}
            className={isTaken ? styles.placeTaken : styles.place}
          />
        ))}
      </div>
      <p className={styles.hint}>
        {openCount === 0
          ? t("subprofiles:therapist.practical.fees.placesFull")
          : t("subprofiles:therapist.practical.fees.placesOpen", {
              count: openCount,
              open: openCount,
              places,
            })}
      </p>
    </>
  );
}

export function FeesCell({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const formatAmount = (value: number) => format.number(value, AMOUNT_FORMAT);
  const { standardFee, slidingRange, slidingPlaces, slidingOpen, fees } = view;
  // Without a standard fee, the Sessions cell beside this one already lists
  // the price of each session length: point there, led by the lowest.
  const hasScheduleOnly = standardFee === null && view.feeSchedule.length > 0;
  const lowestScheduled = hasScheduleOnly
    ? lowestAmount(view.feeSchedule.map((line) => line.value))
    : null;
  const hasFees = standardFee !== null || slidingRange !== null;
  const rules = fees?.slidingRules ?? "";
  const firstContact = fees?.firstContact ?? "";
  return (
    <PracticalCell
      icon={FiCreditCard}
      title={t("subprofiles:therapist.practical.fees.title")}
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.feesCell} />
      {!hasFees && !hasScheduleOnly && (
        <p className={styles.missing}>
          {t("subprofiles:therapist.practical.fees.missing")}
        </p>
      )}
      {standardFee !== null && (
        <p className={styles.big}>
          {t("subprofiles:therapist.practical.amount", {
            amount: formatAmount(standardFee),
          })}
          <small>{t("subprofiles:therapist.practical.fees.perSession")}</small>
        </p>
      )}
      {lowestScheduled !== null && (
        <p className={styles.big}>
          {t("subprofiles:therapist.practical.fees.from", {
            amount: formatAmount(lowestScheduled),
          })}
          <small>{t("subprofiles:therapist.practical.fees.perSession")}</small>
        </p>
      )}
      {hasScheduleOnly && (
        <p className={styles.hint}>
          {t("subprofiles:therapist.practical.fees.scheduleHint")}
        </p>
      )}
      {slidingRange && (
        <dl className={styles.rows}>
          <PracticalRow
            label={t("subprofiles:therapist.practical.fees.sliding")}
            value={
              // A minimum with no maximum arrives as [min, min]: one amount.
              slidingRange[0] === slidingRange[1]
                ? t("subprofiles:therapist.practical.amount", {
                    amount: formatAmount(slidingRange[0]),
                  })
                : t("subprofiles:therapist.practical.range", {
                    low: formatAmount(slidingRange[0]),
                    high: formatAmount(slidingRange[1]),
                  })
            }
          />
        </dl>
      )}
      {slidingPlaces !== null && slidingPlaces > 0 && slidingOpen !== null && (
        <SlidingPlaces places={slidingPlaces} open={slidingOpen} />
      )}
      {rules && (
        <p className={styles.hint}>
          <b>{t("subprofiles:therapist.practical.fees.rulesLabel")}</b> {rules}
        </p>
      )}
      {firstContact && (
        <p className={styles.ok}>
          <FiCheck className={styles.okIcon} aria-hidden="true" />
          {firstContact}
        </p>
      )}
    </PracticalCell>
  );
}
