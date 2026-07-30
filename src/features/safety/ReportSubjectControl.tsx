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
 * Deliberately NOT auth-gated — it mirrors the existing housing report
 * triggers (`HousingListingPage` / `LandlordPage` / `FlatmateCard`) and
 * `DirectoryReportControl`, none of which check `useAuth()`: filing a report
 * is open to anyone, signed in or not.
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
