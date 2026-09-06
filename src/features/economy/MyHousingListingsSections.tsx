import {
  FiAlertCircle,
  FiClock,
  FiHome,
  FiMessageSquare,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import {
  Badge,
  Button,
  EmptyState,
  FadeIn,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatDate } from "../../shared/lib/date";
import { FILTERS } from "./housing.data";
import type { MyHousingListingRow } from "./myHousingListings.data";
import styles from "./MyHousingListingsPage.module.css";

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * PRD-244: how close to `expiresAt` a live listing starts reading as expiring.
 *
 * Mirrors the backend's `LISTING_EXPIRY_WARNING_LEAD_DAYS` (7) so the card and
 * the bell agree: an owner should never open this page to a flat date on the
 * same day a notification told them the listing is about to lapse, and never
 * see an urgent line for a listing nothing has warned them about.
 */
const EXPIRING_SOON_DAYS = 7;

/**
 * Whole days until `iso`, rounded UP so a listing eleven hours from lapsing
 * reads as "1 day" rather than "0 days". Null for an unparseable timestamp, so
 * a bad value falls back to the flat date instead of printing "NaN".
 */
function wholeDaysUntil(iso: string): number | null {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  return Math.ceil((target - Date.now()) / DAY_IN_MILLISECONDS);
}

/** Every non-live moderation state, with the pill it renders as. A listing
 * that is refused, pulled, or waiting on the lister is the fact that matters
 * most to its owner, so these win over "expired" (approval refreshes the
 * window anyway) and are the states the decision note below explains. */
const MODERATION_PILLS: Partial<
  Record<MyHousingListingRow["status"], { labelKey: string; tone: BadgeTone }>
> = {
  review: {
    labelKey: "economy:myHousingListings.status.review",
    tone: "amber",
  },
  question: {
    labelKey: "economy:myHousingListings.status.question",
    tone: "amber",
  },
  rejected: {
    labelKey: "economy:myHousingListings.status.rejected",
    tone: "danger",
  },
  taken_down: {
    labelKey: "economy:myHousingListings.status.takenDown",
    tone: "danger",
  },
};

/** Status pill shown on a row. "Filled" wins outright (the owner said they
 * found someone), then the moderation state, then the TTL. */
function StatusPill({ listing }: { listing: MyHousingListingRow }) {
  const { t } = useTranslation();
  let labelKey = "economy:myHousingListings.status.live";
  let tone: BadgeTone = "jade";
  const moderationPill = MODERATION_PILLS[listing.status];
  if (listing.filledAt !== null) {
    labelKey = "economy:myHousingListings.status.filled";
    tone = "plum";
  } else if (moderationPill) {
    labelKey = moderationPill.labelKey;
    tone = moderationPill.tone;
  } else if (listing.expired) {
    labelKey = "economy:myHousingListings.status.expired";
    tone = "danger";
  }
  return <Badge tone={tone}>{t(labelKey)}</Badge>;
}

/**
 * What a moderator decided, and why, in the moderator's own words.
 *
 * Without this a lister whose home was sent back for changes, refused, or
 * pulled saw only a pill and had no way to learn what to fix. The reason is
 * shown verbatim: it is one person writing to another, so it is never
 * flattened into a canned platform sentence.
 */
function DecisionNote({ listing }: { listing: MyHousingListingRow }) {
  const { t } = useTranslation();
  const reason = listing.decision?.reason?.trim();
  const headingKey =
    listing.status === "question"
      ? "economy:myHousingListings.decision.question"
      : listing.status === "rejected"
        ? "economy:myHousingListings.decision.rejected"
        : "economy:myHousingListings.decision.takenDown";
  if (!reason) return null;

  return (
    <div className={styles.decision}>
      <p className={styles.decisionHead}>
        <FiMessageSquare aria-hidden />
        {t(headingKey)}
      </p>
      <p className={styles.decisionBody}>{reason}</p>
      {listing.status === "question" && (
        <p className={styles.decisionHint}>
          {t("economy:myHousingListings.decision.questionHint")}
        </p>
      )}
    </div>
  );
}

export function MyHousingListingCard({
  listing,
  onEdit,
  onMarkFilled,
  onMarkAvailable,
  onExtend,
  onDelete,
  busy,
}: {
  listing: MyHousingListingRow;
  onEdit: () => void;
  onMarkFilled: () => void;
  onMarkAvailable: () => void;
  onExtend: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const hidden = listing.filledAt !== null || listing.expired;
  // PRD-244. Every other expiry signal on this card is a post-mortem: the
  // danger pill and the expired hint both only appear once the home has
  // already dropped out of public browse. This is the one signal that arrives
  // while the owner can still press Extend, and it mirrors exactly what the
  // backend warning sweep notifies on: a listing that is live, not filled, and
  // inside the lead window. A listing waiting on a moderator gets the flat
  // date, because the decision note above it is the fact that matters and
  // approval refreshes the window anyway.
  const daysToExpiry = wholeDaysUntil(listing.expiresAt);
  const isExpiringSoon =
    !hidden &&
    listing.status === "live" &&
    daysToExpiry !== null &&
    daysToExpiry > 0 &&
    daysToExpiry <= EXPIRING_SOON_DAYS;
  const typeLabel = t(
    FILTERS.find((filterOption) => filterOption.value === listing.type)
      ?.labelKey ?? "economy:housing.filter.all",
  );

  return (
    <FadeIn className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.type}>{typeLabel}</span>
        <StatusPill listing={listing} />
      </div>
      <h3 className={styles.cardTitle}>{listing.title}</h3>
      <div className={styles.cardMeta}>
        <span>
          {listing.area || listing.city} ·{" "}
          {t("economy:housing.fact.rentPerMonth", {
            amount: fmt.currency(listing.rentEuros, "EUR", {
              maximumFractionDigits: 0,
            }),
          })}
        </span>
        <span>
          {t("economy:myHousingListings.postedOn", {
            date: formatDate(listing.createdAt, language),
          })}
        </span>
      </div>
      {(listing.status === "question" ||
        listing.status === "rejected" ||
        listing.status === "taken_down") && <DecisionNote listing={listing} />}

      {hidden ? (
        <p className={styles.cardHint}>
          {t(
            listing.expired
              ? "economy:myHousingListings.expiredHint"
              : "economy:myHousingListings.filledHint",
          )}
        </p>
      ) : isExpiringSoon ? (
        <p className={styles.cardHintExpiring}>
          <FiClock aria-hidden />
          {t("economy:myHousingListings.expiringInDays", {
            count: daysToExpiry ?? 0,
          })}
        </p>
      ) : (
        <p className={styles.cardHint}>
          {t("economy:myHousingListings.expiresOn", {
            date: formatDate(listing.expiresAt, language),
          })}
        </p>
      )}

      <div className={styles.cardActions}>
        <Button size="md" variant="ghost" onClick={onEdit} disabled={busy}>
          {t("economy:myHousingListings.actions.edit")}
        </Button>
        <Button size="md" variant="ghost" onClick={onExtend} disabled={busy}>
          {t("economy:myHousingListings.actions.extend")}
        </Button>
        {hidden ? (
          <Button
            size="md"
            variant="ghost"
            onClick={onMarkAvailable}
            disabled={busy}
          >
            {t("economy:myHousingListings.actions.markAvailable")}
          </Button>
        ) : (
          <Button
            size="md"
            variant="ghost"
            onClick={onMarkFilled}
            disabled={busy}
          >
            {t("economy:myHousingListings.actions.markFilled")}
          </Button>
        )}
        <Link
          to={`${routes.housing}/${listing.slug}`}
          className={styles.viewLink}
        >
          {t("economy:myHousingListings.actions.view")}
        </Link>
        <Button
          size="md"
          variant="danger"
          className={styles.deleteBtn}
          onClick={onDelete}
          disabled={busy}
        >
          {t("economy:myHousingListings.actions.delete")}
        </Button>
      </div>
    </FadeIn>
  );
}

export function MyHousingListingsEmpty({
  onListSpace,
}: {
  onListSpace: () => void;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiHome />}
      title={t("economy:myHousingListings.empty.title")}
      description={t("economy:myHousingListings.empty.description")}
      action={{
        label: t("economy:myHousingListings.empty.cta"),
        onClick: onListSpace,
      }}
    />
  );
}

export function MyHousingListingsError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiAlertCircle />}
      title={t("economy:myHousingListings.error.title")}
      description={t("economy:myHousingListings.error.body")}
      action={{
        label: t("economy:myHousingListings.error.retry"),
        onClick: onRetry,
      }}
    />
  );
}
