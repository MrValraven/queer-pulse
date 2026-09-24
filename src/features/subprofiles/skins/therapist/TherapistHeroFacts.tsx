import type { ReactNode } from "react";
import { FiCreditCard, FiGlobe, FiMapPin, FiShield } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import type { TFunction } from "../../../../shared/i18n/types";
import type { TherapistView } from "./therapistView";
import { STATUS_LABEL_KEYS } from "./therapistHero.data";
import { parseAmount } from "./therapistView.helpers";
import { TherapistEditLink } from "./TherapistEditLink";
import {
  THERAPIST_EDIT_TARGETS,
  type TherapistEditTarget,
} from "./therapistEditLinks.data";
import { LANGUAGE_OPTIONS, pickDisplayText } from "./therapistPickOptions";
import styles from "./TherapistHero.module.css";

/** What members see about capacity: "Accepting new clients", "Waitlist ·
 *  About 6 weeks", "Not taking new clients". Shared by the hero pill and the
 *  phone action bar. */
export function TherapistStatusText({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  if (view.status !== "wait") return <>{t(STATUS_LABEL_KEYS[view.status])}</>;
  return (
    <>
      {view.waitNote
        ? t("subprofiles:therapist.hero.status.wait", { note: view.waitNote })
        : t("subprofiles:therapist.hero.status.waitPlain")}
    </>
  );
}

/** The hero's status pill, tinted by status. */
export function TherapistStatusPill({ view }: { view: TherapistView }) {
  return (
    <span className={styles.status} data-status={view.status}>
      <TherapistStatusText view={view} />
    </span>
  );
}

/** The lowest price in the fee schedule, or null when no row has a number. */
function lowestSchedulePrice(rows: { value: string }[]): number | null {
  const prices = rows
    .map((row) => parseAmount(row.value))
    .filter((price): price is number => price !== null);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/** The hero's fee line. The standard fee leads when there is one; without
 *  it, the schedule's lowest price leads and the sliding range follows. An
 *  empty string means nothing was shared. */
function feesText(
  view: TherapistView,
  t: TFunction,
  amount: (value: number) => string,
): string {
  const range = view.slidingRange
    ? { min: amount(view.slidingRange[0]), max: amount(view.slidingRange[1]) }
    : null;
  if (view.standardFee !== null) {
    const standard = amount(view.standardFee);
    return range
      ? t("subprofiles:therapist.hero.facts.feesSliding", {
          standard,
          ...range,
        })
      : t("subprofiles:therapist.hero.facts.feesStandard", { standard });
  }
  const scheduleLowest = lowestSchedulePrice(view.feeSchedule);
  // A range with only a minimum comes back as [min, min]; "sliding 40–40€"
  // says nothing, so it reads as a starting price instead.
  const isPointRange =
    view.slidingRange !== null && view.slidingRange[0] === view.slidingRange[1];
  const lowest =
    isPointRange && view.slidingRange
      ? Math.min(scheduleLowest ?? Infinity, view.slidingRange[0])
      : scheduleLowest;
  if (range && !isPointRange) {
    return lowest === null
      ? t("subprofiles:therapist.hero.facts.feesSlidingOnly", range)
      : t("subprofiles:therapist.hero.facts.feesFromSliding", {
          lowest: amount(lowest),
          ...range,
        });
  }
  if (lowest !== null) {
    return t("subprofiles:therapist.hero.facts.feesFrom", {
      amount: amount(lowest),
    });
  }
  // A schedule with no number in any row: show the first row as typed.
  return view.feeSchedule[0]?.value.trim() ?? "";
}

interface FactProps {
  icon: ReactNode;
  label: string;
  value: string;
  /** Shows `value` in the muted "not shared" style. */
  isMissing?: boolean;
  /** Where the owner edits this fact: a pencil at the label's end. */
  editTarget: TherapistEditTarget;
}

function Fact({
  icon,
  label,
  value,
  isMissing = false,
  editTarget,
}: FactProps) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>
        <span className={styles.factIcon} aria-hidden="true">
          {icon}
        </span>
        {label}
        <TherapistEditLink
          target={editTarget}
          isCompact
          className={styles.factEdit}
        />
      </dt>
      <dd
        className={
          isMissing ? `${styles.factValue} ${styles.factNa}` : styles.factValue
        }
      >
        {value}
      </dd>
    </div>
  );
}

/** The hero's facts row: languages, where, fees, insurance. A fact the
 *  therapist has not given reads "Not shared yet" or "Unknown". */
export function TherapistHeroFacts({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const amount = (value: number) =>
    format.number(value, { maximumFractionDigits: 2 });
  const notShared = t("subprofiles:therapist.hero.facts.notShared");

  const languages = view.languages
    .map((entry) => pickDisplayText(LANGUAGE_OPTIONS, entry, t))
    .join(", ");
  const fees = feesText(view, t, amount);
  const insurance = view.fees?.receipts.trim() ?? "";

  return (
    <dl className={styles.facts}>
      <Fact
        icon={<FiGlobe />}
        label={t("subprofiles:therapist.hero.facts.languages")}
        value={languages || notShared}
        isMissing={!languages}
        editTarget={THERAPIST_EDIT_TARGETS.languages}
      />
      <Fact
        icon={<FiMapPin />}
        label={t("subprofiles:therapist.hero.facts.where")}
        value={view.where || notShared}
        isMissing={!view.where}
        editTarget={THERAPIST_EDIT_TARGETS.where}
      />
      <Fact
        icon={<FiCreditCard />}
        label={t("subprofiles:therapist.hero.facts.fees")}
        value={fees || notShared}
        isMissing={!fees}
        editTarget={THERAPIST_EDIT_TARGETS.fees}
      />
      <Fact
        icon={<FiShield />}
        label={t("subprofiles:therapist.hero.facts.insurance")}
        value={insurance || t("subprofiles:therapist.hero.facts.unknown")}
        isMissing={!insurance}
        editTarget={THERAPIST_EDIT_TARGETS.insurance}
      />
    </dl>
  );
}
