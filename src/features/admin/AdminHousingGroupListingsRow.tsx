import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiHome, FiMapPin, FiUsers } from "react-icons/fi";
import { Badge } from "../../shared/components/ui";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate, formatRelative } from "../../shared/lib/date";
import { routes } from "../../app/routeMap";
import type {
  AdminGroupListingQueueDTO,
  GroupListingStatus,
} from "./api/adminHousingGroupListings.api";
import {
  daysWaiting,
  GROUP_LISTING_STALE_DAYS,
} from "./adminHousingGroupListings.data";
import { GroupListingDecisionBar } from "./AdminHousingGroupListingsDecision";
import {
  GroupListingRiskPill,
  GroupListingRiskReasons,
} from "./AdminHousingGroupListingsRisk";
import { AdminAvatar, AdminChip } from "./ui";
import styles from "./AdminHousingGroupListingsPage.module.css";

const STATUS_BADGE: Record<
  GroupListingStatus,
  { tone: "amber" | "violet" | "jade" | "danger"; labelKey: string }
> = {
  review: { tone: "amber", labelKey: "admin:groupListingQueue.status.review" },
  question: {
    tone: "violet",
    labelKey: "admin:groupListingQueue.status.question",
  },
  live: { tone: "jade", labelKey: "admin:groupListingQueue.status.live" },
  declined: {
    tone: "danger",
    labelKey: "admin:groupListingQueue.status.declined",
  },
};

/** The audit trail, when there is one: who decided, when, and what they said. */
function PriorDecision({ listing }: { listing: AdminGroupListingQueueDTO }) {
  const { t, language } = useTranslation();
  if (!listing.decidedAt) return null;
  return (
    <div className={styles.priorDecision}>
      <h4 className={styles.priorDecisionHead}>
        {t("admin:groupListingQueue.prior.heading")}
      </h4>
      {listing.decisionReason && (
        <p className={styles.priorDecisionBody}>“{listing.decisionReason}”</p>
      )}
      <p className={styles.priorDecisionMeta} title={listing.decidedBy ?? ""}>
        {t("admin:groupListingQueue.prior.meta", {
          date: formatDate(listing.decidedAt, language),
          moderator: listing.decidedBy
            ? listing.decidedBy.slice(0, 8)
            : t("admin:groupListingQueue.prior.unknownStaff"),
        })}
      </p>
    </div>
  );
}

/** Who posted the room, so a decision reaches a person rather than a row. */
function Poster({ listing }: { listing: AdminGroupListingQueueDTO }) {
  const { t } = useTranslation();
  const poster = listing.postedBy;

  if (!poster) {
    return (
      <p className={styles.posterGone}>
        {t("admin:groupListingQueue.row.noPoster")}
      </p>
    );
  }

  const fullName = `${poster.firstName} ${poster.lastName}`.trim();
  return (
    <div className={styles.poster}>
      <AdminAvatar
        initials={initialsOf(poster.firstName, poster.lastName)}
        tone={tintForSlug(poster.slug)}
        size="md"
        src={poster.avatarUrl ?? undefined}
        alt=""
      />
      <div className={styles.posterBody}>
        <p className={styles.posterName}>
          <Link to={`${routes.members}/${poster.slug}`}>{fullName}</Link>
        </p>
        {poster.pronouns && (
          <p className={styles.posterMeta}>{poster.pronouns}</p>
        )}
      </div>
    </div>
  );
}

/**
 * One listing in the review queue: everything a decision needs on one card, so
 * a moderator never has to open another tab to answer "does this room reach
 * the community, and what do I owe the person who wrote it up?".
 *
 * `isFocused` is the J/K keyboard highlight. The card takes programmatic focus
 * when it becomes the focused row, which is also what scrolls it into view.
 */
export function AdminHousingGroupListingRow({
  listing,
  isFocused,
  isPending,
  onFocus,
  onDecide,
}: {
  listing: AdminGroupListingQueueDTO;
  isFocused: boolean;
  isPending: boolean;
  onFocus: () => void;
  onDecide: (next: GroupListingStatus) => void;
}) {
  const { t } = useTranslation();
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

  const badge = STATUS_BADGE[listing.status];
  const waitingDays = daysWaiting(listing.createdAt);
  const isStale =
    waitingDays >= GROUP_LISTING_STALE_DAYS &&
    (listing.status === "review" || listing.status === "question");

  return (
    <li
      ref={cardRef}
      tabIndex={-1}
      onFocus={onFocus}
      className={`${styles.card} ${isFocused ? styles.cardFocused : ""}`}
      aria-labelledby={`group-listing-${listing.id}`}
    >
      <div className={styles.cardTop}>
        <GroupListingRiskPill score={listing.riskScore} />
        <Badge tone={badge.tone}>{t(badge.labelKey)}</Badge>
        {listing.hidden && (
          <Badge tone="danger" dot>
            {t("admin:groupListingQueue.row.hidden")}
          </Badge>
        )}
        <AdminChip tone="plum">
          <FiUsers aria-hidden />{" "}
          {listing.groupName ?? t("admin:groupListingQueue.row.noGroup")}
        </AdminChip>
        <span
          className={`${styles.cardAge} ${isStale ? styles.cardAgeStale : ""}`}
        >
          <FiClock aria-hidden />
          {isStale
            ? t("admin:groupListingQueue.row.waitingDays", {
                count: waitingDays,
              })
            : t("admin:groupListingQueue.row.submitted", {
                age: formatRelative(listing.createdAt, fmt),
              })}
        </span>
      </div>

      <h3 className={styles.cardTitle} id={`group-listing-${listing.id}`}>
        {listing.title}
      </h3>

      <p className={styles.cardFacts}>
        <FiMapPin aria-hidden />
        {listing.neighbourhood}
        {" · "}
        {t("admin:groupListingQueue.row.perMonth", {
          amount: fmt.currency(listing.priceEuros, "EUR", {
            maximumFractionDigits: 0,
          }),
        })}
        {" · "}
        <FiHome aria-hidden />
        {listing.accessibilityInfo}
      </p>

      <p className={styles.cardDescription}>{listing.description}</p>

      <Poster listing={listing} />

      <GroupListingRiskReasons reasons={listing.riskReasons} />

      <PriorDecision listing={listing} />

      <GroupListingDecisionBar
        status={listing.status}
        listingTitle={listing.title}
        isPending={isPending}
        onDecide={onDecide}
      />
    </li>
  );
}
