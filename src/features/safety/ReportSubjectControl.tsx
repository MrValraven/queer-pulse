import { useState } from "react";
import { ReportListingModal } from "../economy/ReportListingModal";
import { type ReportSubjectType } from "./reportReasons";
import styles from "./ReportSubjectControl.module.css";

interface Props {
  subjectType: ReportSubjectType;
  subjectId: string;
  subjectName: string;
  /** Already-localized trigger label, e.g. "Report this company". */
  label: string;
  /** Already-localized aria-label, e.g. "Report {name}". */
  ariaLabel: string;
}

/**
 * A subtle "Report this…" text affordance that opens the generic
 * `ReportListingModal` for ANY report subject (`company` / `job` /
 * `subprofile`, and reusable for future ones). A parameterized generalization
 * of `marketing/DirectoryReportControl` so the three economy/persona surfaces
 * don't each re-implement the same open-a-modal button: callers pass the
 * subject identity plus their own namespace's localized `label`/`ariaLabel`,
 * keeping the copy in each surface's catalog while the behaviour lives here.
 *
 * Not auth-gated, and that is now TRUE rather than intended. `POST /reports` is
 * public: `ReportsController` used to sit behind `ActiveMemberGuard`, so every
 * one of these buttons opened a modal a signed-out visitor could fill in and
 * never file, ending on the generic "couldn't submit" toast with no hint that
 * signing in would have fixed it. The guard is gone (PRD-280), so this control
 * and the housing triggers it mirrors (`HousingListingPage` / `LandlordPage` /
 * `FlatmateCard`) and `DirectoryReportControl`, none of which check
 * `useAuth()`, all keep working for a visitor who never signed in.
 *
 * A signed-out filing reaches the moderator with no name and no prior-report
 * record behind it, which is the trade the standalone form spells out. What it
 * never does is fail.
 */
export function ReportSubjectControl({
  subjectType,
  subjectId,
  subjectName,
  label,
  ariaLabel,
}: Props) {
  const [reporting, setReporting] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setReporting(true)}
        aria-label={ariaLabel}
      >
        {label}
      </button>

      {reporting && (
        <ReportListingModal
          subjectType={subjectType}
          subjectId={subjectId}
          subjectName={subjectName}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}
