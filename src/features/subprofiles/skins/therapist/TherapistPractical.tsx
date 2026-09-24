import type { IconType } from "react-icons";
import {
  FiCheck,
  FiHeart,
  FiLogIn,
  FiMap,
  FiMapPin,
  FiNavigation,
  FiWind,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { TherapistTravel } from "../../api/subprofiles.api";
import { TherapistCostCalculator } from "./TherapistCostCalculator";
import { TherapistSection } from "./TherapistSection";
import { AvailabilityCell } from "./TherapistPracticalAvailability";
import {
  PracticalCell,
  SessionsCell,
  SmallPrintCell,
} from "./TherapistPracticalCells";
import { FeesCell } from "./TherapistPracticalFees";
import { PracticalEditLink, PracticalEditSlot } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import type { TherapistView } from "./therapistView";
import styles from "./TherapistPractical.module.css";

/** Feather has no metro, bus or bike glyph: a navigation arrow stands for
 *  the metro, a folded map for bus routes, open air for the bike. */
const TRAVEL_ICONS: Record<keyof TherapistTravel, IconType> = {
  metro: FiNavigation,
  bus: FiMap,
  bike: FiWind,
  entrance: FiLogIn,
};

const TRAVEL_ORDER: (keyof TherapistTravel)[] = [
  "metro",
  "bus",
  "bike",
  "entrance",
];

function TravelCell({ travel }: { travel: TherapistTravel }) {
  const { t } = useTranslation();
  const filled = TRAVEL_ORDER.filter((mode) => travel[mode] !== "");
  return (
    <PracticalCell
      icon={FiMapPin}
      title={t("subprofiles:therapist.practical.travel.title")}
      isWide
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.travel} />
      <ul className={styles.travel}>
        {filled.map((mode) => {
          const Icon = TRAVEL_ICONS[mode];
          return (
            <li key={mode}>
              <Icon className={styles.travelIcon} aria-hidden="true" />
              <span>
                <span className="visuallyHidden">
                  {t(`subprofiles:therapist.practical.travel.${mode}`)}{" "}
                </span>
                {travel[mode]}
              </span>
            </li>
          );
        })}
      </ul>
    </PracticalCell>
  );
}

function AccessCell({
  offered,
  missing,
}: {
  offered: string[];
  missing: string[];
}) {
  const { t } = useTranslation();
  return (
    <PracticalCell
      icon={FiHeart}
      title={t("subprofiles:therapist.practical.access.title")}
      isWide
    >
      <PracticalEditLink target={THERAPIST_EDIT_TARGETS.access} />
      <ul className={styles.access}>
        {offered.map((item, index) => (
          <li key={`offered-${index}`}>
            <FiCheck className={styles.accessIcon} aria-hidden="true" />
            <span>
              <span className="visuallyHidden">
                {t("subprofiles:therapist.practical.access.offered")}{" "}
              </span>
              {item}
            </span>
          </li>
        ))}
        {missing.map((item, index) => (
          <li key={`missing-${index}`} className={styles.accessMissing}>
            <FiX className={styles.accessIcon} aria-hidden="true" />
            <span>
              <span className="visuallyHidden">
                {t("subprofiles:therapist.practical.access.missing")}{" "}
              </span>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </PracticalCell>
  );
}

/** True when any practical fact at all was shared. */
function hasPracticalFacts(view: TherapistView): boolean {
  // `paymentMethods` is a list, so it counts only when it holds a choice.
  const hasFeeText = view.fees
    ? Object.values(view.fees).some((value) =>
        Array.isArray(value) ? value.length > 0 : value !== "",
      )
    : false;
  return (
    hasFeeText ||
    view.standardFee !== null ||
    view.feeSchedule.length > 0 ||
    view.reimbursement.length > 0 ||
    view.hasInPerson ||
    view.online !== "" ||
    view.availabilityHeadline !== "" ||
    view.hours.length > 0 ||
    view.openSlots.length > 0 ||
    view.waiting !== null ||
    view.travel !== null ||
    view.access.length > 0 ||
    view.accessMissing.length > 0
  );
}

/** "The practical bits": sessions, fees, small print, availability, the
 *  cost calculator, getting there and accessibility. */
export function TherapistPractical({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  if (!hasPracticalFacts(view)) return null;
  const hasAccess = view.access.length > 0 || view.accessMissing.length > 0;
  return (
    <TherapistSection
      id="therapist-practical"
      label={t("subprofiles:therapist.practical.label")}
      heading={t("subprofiles:therapist.practical.heading")}
    >
      <div className={styles.grid}>
        <PracticalEditSlot target={THERAPIST_EDIT_TARGETS.sessions}>
          <SessionsCell view={view} />
        </PracticalEditSlot>
        <FeesCell view={view} />
        <PracticalEditSlot target={THERAPIST_EDIT_TARGETS.smallPrint}>
          <SmallPrintCell view={view} />
        </PracticalEditSlot>
        <AvailabilityCell view={view} />
        <TherapistCostCalculator view={view} />
        {view.travel && <TravelCell travel={view.travel} />}
        {hasAccess && (
          <AccessCell offered={view.access} missing={view.accessMissing} />
        )}
      </div>
    </TherapistSection>
  );
}
