import { FiEdit3, FiMessageSquare, FiTrash2 } from "react-icons/fi";
import { Badge, Button, type BadgeTone } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type { MyGroupListing } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/** The pill each moderation state renders as. A takedown is handled above this
 *  map: it happens AFTER publication, so it overrides whatever `status` says. */
const STATUS_PILLS: Record<
  MyGroupListing["status"],
  { labelKey: string; tone: BadgeTone }
> = {
  review: {
    labelKey: "economy:groupListing.mine.status.review",
    tone: "amber",
  },
  question: {
    labelKey: "economy:groupListing.mine.status.question",
    tone: "amber",
  },
  live: { labelKey: "economy:groupListing.mine.status.live", tone: "jade" },
  declined: {
    labelKey: "economy:groupListing.mine.status.declined",
    tone: "danger",
  },
};

function StatusPill({ listing }: { listing: MyGroupListing }) {
  const { t } = useTranslation();
  if (listing.hidden) {
    return (
      <Badge tone="danger">
        {t("economy:groupListing.mine.status.takenDown")}
      </Badge>
    );
  }
  const pill = STATUS_PILLS[listing.status];
  return <Badge tone={pill.tone}>{t(pill.labelKey)}</Badge>;
}

/**
 * What a moderator decided, and why, in their own words.
 *
 * Shown verbatim: it is one person writing to another, so it is never
 * flattened into a canned platform sentence. Without it a poster whose room
 * was refused or has a question against it saw a pill and had no way to learn
 * what to answer or what to fix.
 */
function DecisionNote({ listing }: { listing: MyGroupListing }) {
  const { t } = useTranslation();
  const reason = (
    listing.hidden ? listing.hiddenReason : listing.decisionReason
  )?.trim();
  if (!reason) return null;

  const headingKey = listing.hidden
    ? "economy:groupListing.mine.decision.takenDown"
    : listing.status === "question"
      ? "economy:groupListing.mine.decision.question"
      : "economy:groupListing.mine.decision.declined";

  return (
    <div className={styles.decision}>
      <p className={styles.decisionHead}>
        <FiMessageSquare aria-hidden />
        {t(headingKey)}
      </p>
      <p className={styles.decisionBody}>{reason}</p>
      <p className={styles.decisionHint}>
        {t(
          listing.status === "question" && !listing.hidden
            ? "economy:groupListing.mine.decision.questionHint"
            : "economy:groupListing.mine.decision.editHint",
        )}
      </p>
    </div>
  );
}

/**
 * One room the signed-in member submitted to this group, with the state it is
 * actually in. Ownership is the query that produced the row, so the edit and
 * withdraw controls here act on something the caller demonstrably posted.
 */
export function MyGroupListingCard({
  listing,
  isBusy,
  onEdit,
  onWithdraw,
}: {
  listing: MyGroupListing;
  isBusy: boolean;
  onEdit: () => void;
  onWithdraw: () => void;
}) {
  const { t, language } = useTranslation();
  const hasNote = listing.hidden
    ? Boolean(listing.hiddenReason)
    : listing.status === "question" || listing.status === "declined";

  return (
    <article className={styles.mineCard}>
      <div className={styles.mineTop}>
        <h3 className={styles.listingTitle}>{listing.title}</h3>
        <StatusPill listing={listing} />
      </div>
      <div className={styles.mineMeta}>
        <span>
          {listing.neighbourhood} ·{" "}
          {t("economy:housingGroups.listings.perMonth", {
            price: listing.priceEuros,
          })}
        </span>
        <span>
          {t("economy:groupListing.mine.postedOn", {
            date: formatDate(listing.createdAt, language),
          })}
        </span>
      </div>

      {hasNote && <DecisionNote listing={listing} />}

      <div className={styles.listingManage}>
        <Button
          variant="ghost"
          size="md"
          onClick={onEdit}
          disabled={isBusy}
          aria-label={t("economy:groupListing.manage.editAriaLabel", {
            title: listing.title,
          })}
        >
          <FiEdit3 aria-hidden />
          {t("economy:groupListing.manage.editCta")}
        </Button>
        <Button
          variant="ghost"
          size="md"
          className={styles.listingWithdraw}
          onClick={onWithdraw}
          disabled={isBusy}
          aria-label={t("economy:groupListing.manage.withdrawAriaLabel", {
            title: listing.title,
          })}
        >
          <FiTrash2 aria-hidden />
          {t("economy:groupListing.manage.withdrawCta")}
        </Button>
      </div>
    </article>
  );
}
