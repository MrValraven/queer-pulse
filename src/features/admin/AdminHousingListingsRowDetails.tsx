import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type { AdminHousingListingDTO } from "./api/adminHousingListings.api";
import { AdminChip } from "./ui";
import styles from "./AdminHousingListingsPage.module.css";

/**
 * Everything a moderator reads only when a row gives them pause: the listing
 * as written, the access line, the chips, the exact address, the tour link,
 * and any decision already recorded on it.
 *
 * A native `<details>` so it is keyboard-operable and searchable with no extra
 * wiring, and closed by default so a clean row stays one glance.
 *
 * ADDRESS PRIVACY: the street address and the exact point are here because
 * this console is the one surface entitled to them, and reviewing a real home
 * is the reason. They must never reach any other view.
 */
export function AdminHousingListingRowDetails({
  listing,
}: {
  listing: AdminHousingListingDTO;
}) {
  const { t, language } = useTranslation();
  const priorDecision = listing.decision;

  return (
    <details className={styles.details}>
      <summary className={styles.detailsSummary}>
        <FiChevronDown aria-hidden />
        {t("admin:housingListings.details.open")}
      </summary>

      <div className={styles.detailsBody}>
        {listing.blurb && (
          <p className={styles.detailsQuote}>{listing.blurb}</p>
        )}
        {listing.description ? (
          <p className={styles.detailsText}>{listing.description}</p>
        ) : (
          <p className={styles.detailsMuted}>
            {t("admin:housingListings.details.noDescription")}
          </p>
        )}

        <dl className={styles.detailsGrid}>
          <div>
            <dt>{t("admin:housingListings.details.access")}</dt>
            <dd>
              {listing.accessibilityInfo ||
                t("admin:housingListings.details.noAccess")}
            </dd>
          </div>
          <div>
            <dt>{t("admin:housingListings.details.available")}</dt>
            <dd>
              {listing.availableFrom
                ? formatDate(listing.availableFrom, language)
                : t("admin:housingListings.details.availableNow")}
            </dd>
          </div>
          <div>
            <dt>{t("admin:housingListings.details.minStay")}</dt>
            <dd>
              {listing.minStayMonths !== null
                ? t("admin:housingListings.details.minStayMonths", {
                    count: listing.minStayMonths,
                  })
                : t("admin:housingListings.details.minStayNone")}
            </dd>
          </div>
          <div>
            <dt>{t("admin:housingListings.details.address")}</dt>
            <dd>
              {listing.addressLine ||
                t("admin:housingListings.details.noAddress")}
            </dd>
          </div>
        </dl>

        {(listing.features.length > 0 || listing.idealFor.length > 0) && (
          <div className={styles.detailsChips}>
            {listing.features.map((feature) => (
              <AdminChip key={`feature-${feature}`} tone="ghost">
                {feature}
              </AdminChip>
            ))}
            {listing.idealFor.map((idealFor) => (
              <AdminChip key={`ideal-${idealFor}`} tone="violet">
                {idealFor}
              </AdminChip>
            ))}
          </div>
        )}

        {listing.virtualTourUrl && (
          <p className={styles.detailsText}>
            <a
              href={listing.virtualTourUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("admin:housingListings.details.tourLink")}
            </a>
          </p>
        )}

        {priorDecision && (
          <div className={styles.priorDecision}>
            <p className={styles.priorDecisionHead}>
              {t("admin:housingListings.details.priorDecision", {
                date: formatDate(priorDecision.at, language),
              })}
            </p>
            <p className={styles.detailsText}>
              {priorDecision.reason ||
                t("admin:housingListings.details.priorDecisionNoReason")}
            </p>
            {listing.decidedBy && (
              <p className={styles.detailsMuted}>
                {t("admin:housingListings.details.decidedBy", {
                  name: `${listing.decidedBy.firstName} ${listing.decidedBy.lastName}`.trim(),
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
