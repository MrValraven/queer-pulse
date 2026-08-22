import { Link } from "react-router-dom";
import { FiCheck, FiX } from "react-icons/fi";
import {
  Avatar,
  Badge,
  Button,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { BarterProposalStatus, BarterProposalDecision } from "./api/barter.api";
import type { BarterProposalRow } from "./barterProposals.data";
import styles from "./BarterProposalsPage.module.css";

const STATUS_TONE: Record<BarterProposalStatus, BadgeTone> = {
  pending: "amber",
  accepted: "jade",
  declined: "ghost",
};

const STATUS_LABEL_KEY: Record<BarterProposalStatus, string> = {
  pending: "economy:barterProposals.status.pending",
  accepted: "economy:barterProposals.status.accepted",
  declined: "economy:barterProposals.status.declined",
};

/**
 * One proposal, owner-side: who wants to swap, when they asked, what they
 * wrote, and where the proposal stands.
 *
 * The buttons mirror the backend's one-way rule — accept and decline are both
 * final, and a decided proposal offers nothing further. If the server disagrees
 * anyway (a second tab answered it first) the 409 comes back as this card's
 * `error` line rather than a silent no-op.
 */
export function BarterProposalCard({
  proposal,
  isBusy,
  error,
  onDecide,
}: {
  proposal: BarterProposalRow;
  isBusy: boolean;
  /** Per-row failure text, already resolved for the reader's language. */
  error: string | null;
  onDecide: (status: BarterProposalDecision) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isDecided = proposal.status !== "pending";

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <Avatar
          initials={proposal.initials}
          tint={proposal.tint}
          src={proposal.avatarUrl ?? undefined}
          size={44}
        />
        <div className={styles.cardWho}>
          <h3 className={styles.cardName}>
            {proposal.profileSlug ? (
              <Link to={`${routes.members}/${proposal.profileSlug}`}>
                {proposal.name}
              </Link>
            ) : (
              t("economy:barterProposals.proposerRemoved")
            )}
          </h3>
          <p className={styles.cardWhen}>
            {t("economy:barterProposals.proposedOn", {
              date: fmt.date(new Date(proposal.createdAt), {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            })}
          </p>
        </div>
        <Badge tone={STATUS_TONE[proposal.status]}>
          {t(STATUS_LABEL_KEY[proposal.status])}
        </Badge>
      </div>

      <p className={styles.cardMessage}>{proposal.message}</p>

      {error && (
        <p className={styles.cardError} role="alert">
          {error}
        </p>
      )}

      {isDecided ? (
        <p className={styles.cardFinal}>
          {t("economy:barterProposals.decisionFinal")}
        </p>
      ) : (
        <div className={styles.cardActions}>
          <Button
            variant="ghost"
            size="md"
            className={styles.declineBtn}
            disabled={isBusy}
            onClick={() => onDecide("declined")}
          >
            <FiX aria-hidden />
            {t("economy:barterProposals.action.decline")}
          </Button>
          <Button
            variant="jade"
            size="md"
            disabled={isBusy}
            onClick={() => onDecide("accepted")}
          >
            <FiCheck aria-hidden />
            {t("economy:barterProposals.action.accept")}
          </Button>
        </div>
      )}
    </article>
  );
}
