import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { TherapistCostCalculator } from "./TherapistCostCalculator";
import { TherapistSection } from "./TherapistSection";
import { AvailabilityCell } from "./TherapistPracticalAvailability";
import { AccessCell, TravelCell } from "./TherapistPracticalAccess";
import { SessionsCell } from "./TherapistPracticalCells";
import { FeesCell } from "./TherapistPracticalFees";
import { SmallPrintCell } from "./TherapistPracticalSmallPrint";
import { PracticalEditSlot } from "./TherapistPracticalEdit";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import { RevealBlock } from "./TherapistReveal";
import type { TherapistView } from "./therapistView";
import styles from "./TherapistPractical.module.css";

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

/** The reading column's gap (`.main` in TherapistBody.module.css). */
const MAIN_COLUMN_GAP = 16;

/** "The practical bits": sessions, fees, small print, availability, the
 *  cost calculator, getting there and accessibility. The section grows in
 *  with its first fact and folds away with its last. Getting there and
 *  accessibility span whole grid rows, so each grows by height too; the
 *  grid's 12px row gap above one comes and goes at once. */
export function TherapistPractical({ view }: { view: TherapistView }) {
  const { t } = useTranslation();
  const hasAccess = view.access.length > 0 || view.accessMissing.length > 0;
  return (
    <RevealBlock isShown={hasPracticalFacts(view)} parentGap={MAIN_COLUMN_GAP}>
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
          <RevealBlock isShown={view.travel !== null} className={styles.wide}>
            {view.travel && <TravelCell travel={view.travel} />}
          </RevealBlock>
          <RevealBlock isShown={hasAccess} className={styles.wide}>
            <AccessCell offered={view.access} missing={view.accessMissing} />
          </RevealBlock>
        </div>
      </TherapistSection>
    </RevealBlock>
  );
}
