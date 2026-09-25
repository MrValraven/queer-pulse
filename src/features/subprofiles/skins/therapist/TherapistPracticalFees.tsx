import { FiCheck, FiCreditCard } from "react-icons/fi";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { AMOUNT_FORMAT, MAX_SLIDING_PILLS } from "./therapistPractical.data";
import {
  CELL_GAP,
  PracticalCell,
  PracticalRow,
} from "./TherapistPracticalCells";
import { PracticalEditLink } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import type { TherapistView } from "./therapistView";
import { parseAmount } from "./therapistView.helpers";
import { RevealBlock } from "./TherapistReveal";
import styles from "./TherapistPractical.module.css";

/** Lowest amount among owner-typed prices ("€60", "90€"); null when none
 *  holds a number. */
function lowestAmount(prices: string[]): number | null {
  const amounts = prices
    .map((price) => parseAmount(price))
    .filter((amount): amount is number => amount !== null);
  return amounts.length > 0 ? Math.min(...amounts) : null;
}

/** One pill per sliding-scale place; the taken ones are filled. Shown once
 *  both counts are set. The pills and the line under them are two of the
 *  cell's blocks, each in its own RevealBlock so the cell's gap still falls
 *  between them. */
function SlidingPlaces({
  places: placesValue,
  open,
}: {
  places: number | null;
  open: number | null;
}) {
  const { t } = useTranslation();
  const places = placesValue ?? 0;
  const isShown = places > 0 && open !== null;
  const openCount = Math.min(Math.max(0, open ?? 0), places);
  // Past the cap, the open places keep their pills and the taken ones shrink.
  const shownCount = Math.min(places, MAX_SLIDING_PILLS);
  const takenShown = shownCount - Math.min(openCount, shownCount);
  const pills = Array.from(
    { length: shownCount },
    (_unused, index) => index < takenShown,
  );
  return (
    <>
      <RevealBlock isShown={isShown} parentGap={CELL_GAP}>
        <div className={styles.places} aria-hidden="true">
          {pills.map((isTaken, index) => (
            <span
              key={index}
              className={isTaken ? styles.placeTaken : styles.place}
            />
          ))}
        </div>
      </RevealBlock>
      <RevealBlock isShown={isShown} parentGap={CELL_GAP}>
        <p className={styles.hint}>
          {openCount === 0
            ? t("subprofiles:therapist.practical.fees.placesFull")
            : t("subprofiles:therapist.practical.fees.placesOpen", {
                count: openCount,
                open: openCount,
                places,
              })}
        </p>
      </RevealBlock>
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
      <RevealBlock isShown={!hasFees && !hasScheduleOnly} parentGap={CELL_GAP}>
        <p className={styles.missing}>
          {t("subprofiles:therapist.practical.fees.missing")}
        </p>
      </RevealBlock>
      <RevealBlock isShown={standardFee !== null} parentGap={CELL_GAP}>
        {standardFee !== null && (
          <p className={styles.big}>
            {t("subprofiles:therapist.practical.amount", {
              amount: formatAmount(standardFee),
            })}
            <small>
              {t("subprofiles:therapist.practical.fees.perSession")}
            </small>
          </p>
        )}
      </RevealBlock>
      <RevealBlock isShown={lowestScheduled !== null} parentGap={CELL_GAP}>
        {lowestScheduled !== null && (
          <p className={styles.big}>
            {t("subprofiles:therapist.practical.fees.from", {
              amount: formatAmount(lowestScheduled),
            })}
            <small>
              {t("subprofiles:therapist.practical.fees.perSession")}
            </small>
          </p>
        )}
      </RevealBlock>
      <RevealBlock isShown={hasScheduleOnly} parentGap={CELL_GAP}>
        <p className={styles.hint}>
          {t("subprofiles:therapist.practical.fees.scheduleHint")}
        </p>
      </RevealBlock>
      <RevealBlock isShown={slidingRange !== null} parentGap={CELL_GAP}>
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
      </RevealBlock>
      <SlidingPlaces places={slidingPlaces} open={slidingOpen} />
      <RevealBlock isShown={rules !== ""} parentGap={CELL_GAP}>
        <p className={styles.hint}>
          <b>{t("subprofiles:therapist.practical.fees.rulesLabel")}</b> {rules}
        </p>
      </RevealBlock>
      <RevealBlock isShown={firstContact !== ""} parentGap={CELL_GAP}>
        <p className={styles.ok}>
          <FiCheck className={styles.okIcon} aria-hidden="true" />
          {firstContact}
        </p>
      </RevealBlock>
    </PracticalCell>
  );
}
