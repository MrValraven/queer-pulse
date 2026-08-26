import { useEffect, useRef } from "react";
import {
  FiCalendar,
  FiExternalLink,
  FiHome,
  FiImage,
  FiMapPin,
} from "react-icons/fi";
import { Badge } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type {
  AdminHousingListingDTO,
  HousingListingDecisionAction,
} from "./api/adminHousingListings.api";
import { AdminHousingListingDecisionBar } from "./AdminHousingListingsDecision";
import { AdminHousingListingLister } from "./AdminHousingListingsLister";
import { AdminHousingListingRowDetails } from "./AdminHousingListingsRowDetails";
import { RiskScorePill, RiskSignalList } from "./AdminHousingListingsRisk";
import { STATUS_BADGE } from "./adminHousingListingsStatus";
import styles from "./AdminHousingListingsPage.module.css";

/**
 * One listing in the review queue: everything a decision needs, on one card,
 * so a moderator never has to open five tabs to answer "does this reach the
 * community?".
 *
 * `isFocused` is the J/K keyboard highlight, a different concept from any
 * selection. The card takes programmatic focus when it becomes the focused
 * row, which is also what scrolls it into view.
 */
export function AdminHousingListingRow({
  listing,
  isFocused,
  isPending,
  onFocus,
  onDecide,
}: {
  listing: AdminHousingListingDTO;
  isFocused: boolean;
  isPending: boolean;
  onFocus: () => void;
  onDecide: (action: HousingListingDecisionAction) => void;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const cardRef = useRef<HTMLLIElement>(null);

  // Focus follows the J/K highlight, which is also what scrolls the row into
  // view. Skipped when focus already sits inside this card, so tabbing to one
  // of its own decision buttons does not get yanked back to the card itself.
  useEffect(() => {
    const card = cardRef.current;
    if (!isFocused || !card) return;
    if (card.contains(document.activeElement)) return;
    card.focus();
  }, [isFocused]);

  const statusBadge = STATUS_BADGE[listing.status];
  const rent = fmt.currency(listing.rentEuros, "EUR", {
    maximumFractionDigits: 0,
  });

  return (
    <li
      ref={cardRef}
      tabIndex={-1}
      onFocus={onFocus}
      className={`${styles.card} ${isFocused ? styles.cardFocused : ""}`}
      aria-labelledby={`housing-row-${listing.ref}`}
    >
      <div className={styles.cardTop}>
        <RiskScorePill score={listing.riskScore} />
        <Badge tone={statusBadge.tone}>{t(statusBadge.labelKey)}</Badge>
        <span className={styles.cardRef}>{listing.ref}</span>
        <span className={styles.cardSubmitted}>
          <FiCalendar aria-hidden />
          {t("admin:housingListings.row.submitted", {
            date: formatDate(listing.createdAt, language),
          })}
        </span>
      </div>

      <h3 className={styles.cardTitle} id={`housing-row-${listing.ref}`}>
        {listing.title}
      </h3>
      <p className={styles.cardFacts}>
        <FiHome aria-hidden />
        {t(`economy:listSpace.type.${listing.type}`)}
        {" · "}
        <FiMapPin aria-hidden />
        {listing.area || listing.city}
        {" · "}
        {t("admin:housingListings.row.rent", { amount: rent })}
        {listing.bedrooms !== null && (
          <>
            {" · "}
            {t("admin:housingListings.row.bedrooms", {
              count: listing.bedrooms,
            })}
          </>
        )}
        {" · "}
        {t(
          listing.billsIncluded
            ? "admin:housingListings.row.billsIncluded"
            : "admin:housingListings.row.billsExcluded",
        )}
      </p>

      <AdminHousingListingLister listing={listing} />

      <RiskSignalList reasons={listing.riskReasons} score={listing.riskScore} />

      {listing.gallery.length > 0 ? (
        <ul className={styles.photoRow}>
          {listing.gallery.map((photoUrl, photoIndex) => (
            <li key={photoUrl}>
              <a
                href={photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.photoLink}
              >
                <img
                  className={styles.photo}
                  src={photoUrl}
                  alt={t("admin:housingListings.row.photoAlt", {
                    position: photoIndex + 1,
                    title: listing.title,
                  })}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <span className={styles.photoOpen} aria-hidden>
                  <FiExternalLink />
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noPhotos}>
          <FiImage aria-hidden />
          {t("admin:housingListings.row.noPhotos")}
        </p>
      )}

      <AdminHousingListingRowDetails listing={listing} />

      <AdminHousingListingDecisionBar
        listing={listing}
        isPending={isPending}
        onDecide={onDecide}
      />
    </li>
  );
}
