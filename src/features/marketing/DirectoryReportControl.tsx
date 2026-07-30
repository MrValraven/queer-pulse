import { useState } from "react";
import { ReportListingModal } from "../economy/ReportListingModal";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import styles from "./DirectoryReportControl.module.css";

interface Props {
  place: DirectoryPlace;
}

/**
 * "Report this listing" — a subtle footer affordance on the business detail
 * page's aside, reusing the same `ReportListingModal` already mounted on
 * `HousingListingPage` / `LandlordPage` / `FlatmateCard` (economy feature),
 * now parameterized with `subjectType="business"` — the directory's own report
 * subject, kept distinct from economy housing `listing` reports so moderators
 * can tell a business-directory report apart from a rental listing (both reason
 * sets live in `safety/reportReasons.ts`). `subjectId` is the place's `slug`:
 * the same key saved items and directory routing use, so a moderator can
 * resolve it straight back to `/local/directory/:slug`.
 *
 * Deliberately NOT auth-gated: none of the three existing housing report
 * triggers (`HousingListingPage`, `LandlordPage`, `FlatmateCard`) check
 * `useAuth()` before rendering their report button — the report itself is
 * open to anyone, logged in or not — so this mirrors that unconditionally
 * rather than inventing a new gate.
 */
export function DirectoryReportControl({ place }: Props) {
  const { t } = useTranslation();
  const [reporting, setReporting] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setReporting(true)}
        aria-label={t("marketing:directory.detail.reportAriaLabel", {
          name: place.name,
        })}
      >
        {t("marketing:directory.detail.reportCta")}
      </button>

      {reporting && (
        <ReportListingModal
          subjectType="business"
          subjectId={place.slug}
          subjectName={place.name}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}
