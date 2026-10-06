import {
  FiEdit3,
  FiEyeOff,
  FiMessageSquare,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Badge, Button, type BadgeTone } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type { MyGroupListing } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/** The pill each moderation state renders as. A takedown is handled above this
 *  map: it happens AFTER publication, so it overrides whatever `status` says.
 *  That covers both kinds: a norm takedown (`hidden`) and one from a report
 *  (`moderationState`). Only the pill merges them; the note below still reads
 *  `status` and `decisionReason`, so a question asked after a report
 *  takedown is never lost. */
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
  const isTakenDown = listing.hidden || Boolean(listing.moderationState);
  if (isTakenDown) {
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
function DecisionNote({
  listing,
  isEditable,
}: {
  listing: MyGroupListing;
  /** False on a room taken down from a report, whose Edit is hidden, so the
   *  hint never points at a control the card does not show. */
  isEditable: boolean;
}) {
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
      {isEditable && (
        <p className={styles.decisionHint}>
          {t(
            listing.status === "question" && !listing.hidden
              ? "economy:groupListing.mine.decision.questionHint"
              : "economy:groupListing.mine.decision.editHint",
          )}
        </p>
      )}
    </div>
  );
}

/**
 * LOC-F13. A room taken down from a report carries no moderator reason on the
 * row, so before this the poster saw a bare "Taken down" pill and an Edit
 * button that could never bring the room back (an edit lifts no report
 * takedown). This says what happened and who can see the room now; the
 * card's action row carries the appeal button where Edit would sit.
 */
function ReportTakedownNote() {
  const { t } = useTranslation();
  return (
    <div className={styles.decision}>
      <p className={styles.decisionHead}>
        <FiEyeOff aria-hidden />
        {t("economy:groupListing.mine.reportTakedown.title")}
      </p>
      <p className={styles.decisionBody}>
        {t("economy:groupListing.mine.reportTakedown.body")}
      </p>
      <p className={styles.decisionHint}>
        {t("economy:groupListing.mine.reportTakedown.appealHint")}
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
  // LOC-F13: an edit lifts no report takedown, so Edit stays hidden while one
  // stands. Withdraw stays: taking the room away is always the poster's call.
  const isReportTakedown = Boolean(listing.moderationState);

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

      {isReportTakedown && <ReportTakedownNote />}
      {hasNote && (
        <DecisionNote listing={listing} isEditable={!isReportTakedown} />
      )}

      <div className={styles.listingManage}>
        {/* LOC-F13: the appeal takes Edit's place on a report takedown. The
            bare appeal route files against the member's most recent
            appealable decision, which is usually this takedown; the appeal
            form lets them say which room they mean. */}
        {isReportTakedown ? (
          <Button
            variant="ghost"
            size="md"
            to={routes.appealSubmit}
            aria-label={t(
              "economy:groupListing.mine.reportTakedown.appealAria",
              {
                title: listing.title,
              },
            )}
          >
            <FiRotateCcw aria-hidden />
            {t("economy:groupListing.mine.reportTakedown.appealButton")}
          </Button>
        ) : (
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
        )}
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
