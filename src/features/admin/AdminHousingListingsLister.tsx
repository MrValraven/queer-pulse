import { Link } from "react-router-dom";
import { FiBriefcase, FiShield } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type { AdminHousingListingDTO } from "./api/adminHousingListings.api";
import { AdminAvatar, AdminChip } from "./ui";
import styles from "./AdminHousingListingsPage.module.css";

/** How assured the platform actually is about who this lister is. */
const VERIFICATION_LABEL_KEY: Record<string, string> = {
  none: "admin:housingListings.lister.verification.none",
  email: "admin:housingListings.lister.verification.email",
  phone: "admin:housingListings.lister.verification.phone",
  id_verified: "admin:housingListings.lister.verification.id",
};

/**
 * Who is offering this home, how assured their account is, and what has been
 * decided about them before.
 *
 * The prior record is counts only, taken from the lister's own listings. It is
 * the single most useful thing the queue can say about a stranger ("you have
 * refused this person twice already", "this would be their third live
 * listing"), and without it on the row nobody checks.
 */
export function AdminHousingListingLister({
  listing,
}: {
  listing: AdminHousingListingDTO;
}) {
  const { t, language } = useTranslation();
  const lister = listing.lister;
  const history = listing.listerHistory;

  if (!lister) {
    return (
      <p className={styles.listerGone}>
        {t("admin:housingListings.lister.erased")}
      </p>
    );
  }

  const fullName = `${lister.firstName} ${lister.lastName}`.trim();

  return (
    <div className={styles.lister}>
      <AdminAvatar
        initials={initialsOf(lister.firstName, lister.lastName)}
        tone={tintForSlug(lister.slug)}
        size="md"
        src={lister.avatarUrl ?? undefined}
        alt=""
      />
      <div className={styles.listerBody}>
        <p className={styles.listerName}>
          <Link to={`${routes.members}/${lister.slug}`}>{fullName}</Link>
        </p>
        <p className={styles.listerMeta}>
          <FiShield aria-hidden />
          {t(
            VERIFICATION_LABEL_KEY[listing.listerVerificationLevel] ??
              "admin:housingListings.lister.verification.none",
          )}
          {lister.memberSince && (
            <>
              {" · "}
              {t("admin:housingListings.lister.memberSince", {
                date: formatDate(lister.memberSince, language),
              })}
            </>
          )}
        </p>
        <div className={styles.listerChips}>
          {listing.listerKind === "agent" && (
            <AdminChip tone="violet">
              <FiBriefcase aria-hidden />
              {t("admin:housingListings.lister.agent")}
            </AdminChip>
          )}
          {history && (
            <>
              <AdminChip tone="ghost">
                {t("admin:housingListings.lister.history.total", {
                  count: history.totalListings,
                })}
              </AdminChip>
              {history.liveListings > 0 && (
                <AdminChip tone="jade">
                  {t("admin:housingListings.lister.history.live", {
                    count: history.liveListings,
                  })}
                </AdminChip>
              )}
              {history.changesRequestedListings > 0 && (
                <AdminChip tone="amber">
                  {t("admin:housingListings.lister.history.changes", {
                    count: history.changesRequestedListings,
                  })}
                </AdminChip>
              )}
              {history.rejectedListings > 0 && (
                <AdminChip tone="danger">
                  {t("admin:housingListings.lister.history.rejected", {
                    count: history.rejectedListings,
                  })}
                </AdminChip>
              )}
              {history.takenDownListings > 0 && (
                <AdminChip tone="danger">
                  {t("admin:housingListings.lister.history.takenDown", {
                    count: history.takenDownListings,
                  })}
                </AdminChip>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
