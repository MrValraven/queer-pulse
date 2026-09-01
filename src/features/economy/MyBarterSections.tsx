import { FiAlertCircle, FiInbox, FiRepeat } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import {
  Badge,
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { formatDate } from "../../shared/lib/date";
import type { BarterProposalStatus } from "./api/barter.api";
import { BADGE_KEY } from "./barter.data";
import { barterProposalsPath } from "./barterProposals.paths";
import {
  listingLabel,
  type MyBarterListingRow,
  type MySentBarterProposalRow,
} from "./barterProposals.data";
import styles from "./MyBarterPage.module.css";

/** Where a sent proposal stands, and the pill it reads as. */
const PROPOSAL_PILL: Record<
  BarterProposalStatus,
  { labelKey: string; tone: BadgeTone }
> = {
  pending: { labelKey: "economy:myBarter.sent.status.pending", tone: "amber" },
  accepted: { labelKey: "economy:myBarter.sent.status.accepted", tone: "jade" },
  declined: { labelKey: "economy:myBarter.sent.status.declined", tone: "plum" },
};

export function MyBarterHeader() {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <div className={styles.eyebrow}>{t("economy:myBarter.eyebrow")}</div>
      <h1 className={styles.title}>
        <Translation
          i18nKey="economy:myBarter.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.sub}>{t("economy:myBarter.sub")}</p>
      <Link className={styles.backLink} to={routes.barter}>
        {t("economy:myBarter.backToBoard")}
      </Link>
    </header>
  );
}

export function MyBarterSkeleton() {
  return (
    <div className={styles.list} aria-busy="true">
      {Array.from({ length: 2 }).map((_, skeletonIndex) => (
        <div key={skeletonIndex} className={styles.card} aria-hidden>
          <SkeletonLine width={90} height={20} />
          <SkeletonLine width="60%" height={22} style={{ marginTop: 10 }} />
          <SkeletonLine width="40%" height={14} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * One swap you posted, with everything a poster can now do to it: read the
 * proposals it has drawn, correct it, and take it off the board. Before this,
 * the close endpoint had no caller anywhere and there was no edit path at all,
 * so a finished swap stayed up for good.
 */
export function MyBarterListingCard({
  listing,
  isBusy,
  error,
  onClose,
}: {
  listing: MyBarterListingRow;
  isBusy: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isClosed = listing.status === "closed";
  return (
    <FadeIn className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.kind}>{t(BADGE_KEY[listing.mode])}</span>
        <Badge tone={isClosed ? "plum" : "jade"}>
          {t(
            isClosed
              ? "economy:myBarter.posted.status.closed"
              : "economy:myBarter.posted.status.open",
          )}
        </Badge>
      </div>

      <h3 className={styles.cardTitle}>{listingLabel(listing)}</h3>
      <p className={styles.cardMeta}>
        {listing.pendingProposalCount > 0
          ? t("economy:myBarter.posted.waiting", {
              count: listing.pendingProposalCount,
            })
          : t("economy:myBarter.posted.noneWaiting")}
      </p>

      {error && (
        <p className={styles.cardError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.cardActions}>
        <Button size="md" variant="ghost" to={barterProposalsPath(listing.id)}>
          {t("economy:myBarter.posted.actions.proposals")}
        </Button>
        <Button
          size="md"
          variant="ghost"
          to={`${routes.barter}/${listing.id}/edit`}
        >
          {t("economy:myBarter.posted.actions.edit")}
        </Button>
        <Link to={`${routes.barter}/${listing.id}`} className={styles.viewLink}>
          {t("economy:myBarter.posted.actions.view")}
        </Link>
        {!isClosed && (
          <Button
            size="md"
            variant="danger"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isBusy}
          >
            {t("economy:myBarter.posted.actions.close")}
          </Button>
        )}
      </div>
    </FadeIn>
  );
}

/** You have not posted a swap yet. */
export function MyBarterListingsEmpty() {
  const { t } = useTranslation();
  return (
    <EmptyState
      compact
      icon={<FiRepeat />}
      title={t("economy:myBarter.posted.empty.title")}
      description={t("economy:myBarter.posted.empty.description")}
      action={{
        label: t("economy:myBarter.posted.empty.cta"),
        to: routes.barter,
      }}
    />
  );
}

/**
 * One proposal you sent, and what came of it. The proposer previously had no
 * view of their own offers at all: a proposal left for the poster's inbox and
 * never came back, so "did they ever answer?" had nowhere to be asked.
 */
export function MySentProposalCard({
  proposal,
}: {
  proposal: MySentBarterProposalRow;
}) {
  const { t, language } = useTranslation();
  const pill = PROPOSAL_PILL[proposal.status];
  const headline = proposal.listing
    ? proposal.listing.offer || proposal.listing.want
    : t("economy:myBarter.sent.listingGone");

  return (
    <FadeIn className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.kind}>
          {proposal.listing?.name || t("economy:myBarter.sent.unknownPoster")}
        </span>
        <Badge tone={pill.tone}>{t(pill.labelKey)}</Badge>
      </div>

      <h3 className={styles.cardTitle}>{headline}</h3>
      <p className={styles.cardMeta}>
        {t("economy:myBarter.sent.sentOn", {
          date: formatDate(proposal.createdAt, language),
        })}
        {proposal.decidedAt
          ? ` · ${t("economy:myBarter.sent.answeredOn", {
              date: formatDate(proposal.decidedAt, language),
            })}`
          : ""}
      </p>

      {proposal.wasListingEditedAfterProposal && (
        <p className={styles.notice} role="status">
          <FiAlertCircle aria-hidden />
          <span>{t("economy:myBarter.sent.editedAfter")}</span>
        </p>
      )}

      <p className={styles.message}>{proposal.message}</p>

      {proposal.listing && (
        <div className={styles.cardActions}>
          <Link
            to={`${routes.barter}/${proposal.listing.id}`}
            className={styles.viewLink}
          >
            {t("economy:myBarter.sent.actions.view")}
          </Link>
          <Link to={routes.messages} className={styles.viewLink}>
            {t("economy:myBarter.sent.actions.thread")}
          </Link>
        </div>
      )}
    </FadeIn>
  );
}

/** You have not proposed on anyone's swap yet. */
export function MySentProposalsEmpty() {
  const { t } = useTranslation();
  return (
    <EmptyState
      compact
      icon={<FiInbox />}
      title={t("economy:myBarter.sent.empty.title")}
      description={t("economy:myBarter.sent.empty.description")}
      action={{
        label: t("economy:myBarter.sent.empty.cta"),
        to: routes.barter,
      }}
    />
  );
}
