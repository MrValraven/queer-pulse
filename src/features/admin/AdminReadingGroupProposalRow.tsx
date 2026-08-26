import { Link } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { communityPath } from "../../app/routeMap";
import { AdminChip, type AdminTone } from "./ui";
import type {
  AdminReadingGroupProposalDTO,
  ReadingGroupFormat,
  ReadingGroupProposalDecision,
  ReadingGroupProposalStatus,
} from "./api/adminReadingGroupProposals.api";
import styles from "./AdminSubmissionList.module.css";

const FORMAT_TONE: Record<ReadingGroupFormat, AdminTone> = {
  "In-person": "jade",
  Online: "violet",
  Either: "plum",
};

const STATUS_TONE: Record<ReadingGroupProposalStatus, AdminTone> = {
  pending: "amber",
  approved: "jade",
  declined: "danger",
  archived: "ghost",
};

// Each action button, and the status its proposal lands in — used to disable
// the button that matches the current status (no-op re-decision).
const ACTIONS: {
  decision: ReadingGroupProposalDecision;
  status: ReadingGroupProposalStatus;
}[] = [
  { decision: "approve", status: "approved" },
  { decision: "decline", status: "declined" },
  { decision: "archive", status: "archived" },
];

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * One proposal in the oversight queue.
 *
 * Approving creates the community the member proposed, owned by them, so an
 * approved row carries a link straight to it: the reviewer can see the outcome
 * of their own decision rather than trusting that a status word meant
 * something. A decided row also shows the note that went back to the proposer.
 */
export function AdminReadingGroupProposalRow({
  proposal,
  onDecide,
  pending,
}: {
  proposal: AdminReadingGroupProposalDTO;
  onDecide: (decision: ReadingGroupProposalDecision) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const memberName =
    proposal.member?.name ??
    t("admin:adminReadingGroupProposals.unknownMember");

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{proposal.book}</span>
          <AdminChip tone={FORMAT_TONE[proposal.format]} dot>
            {t(`admin:adminReadingGroupProposals.format.${proposal.format}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminReadingGroupProposals.row.by", { name: memberName })}
          {" · "}
          {t("admin:adminReadingGroupProposals.row.maxPeople", {
            count: proposal.maxPeople,
          })}
        </div>
        {proposal.why && <div className={styles.rowNote}>“{proposal.why}”</div>}
        {proposal.decisionNote && (
          <div className={styles.rowNote}>
            {t("admin:adminReadingGroupProposals.row.decisionNote", {
              note: proposal.decisionNote,
            })}
          </div>
        )}
        <div className={styles.rowDates}>
          {t("admin:adminReadingGroupProposals.row.sent", {
            date: shortDate(fmt, proposal.createdAt),
          })}
          {proposal.decidedAt && (
            <>
              {" · "}
              {t("admin:adminReadingGroupProposals.row.decided", {
                date: shortDate(fmt, proposal.decidedAt),
              })}
            </>
          )}
        </div>
        {proposal.createdCommunitySlug && (
          <div className={styles.rowDates}>
            <Link to={communityPath(proposal.createdCommunitySlug)}>
              {t("admin:adminReadingGroupProposals.row.openCommunity")}
              <FiExternalLink aria-hidden />
            </Link>
          </div>
        )}
      </div>
      <div className={styles.rowActions}>
        <AdminChip tone={STATUS_TONE[proposal.status]} dot>
          {t(`admin:adminReadingGroupProposals.status.${proposal.status}`)}
        </AdminChip>
        <div className={styles.rowActionButtons}>
          {ACTIONS.map(({ decision, status }) => (
            <Button
              key={decision}
              variant="ghost"
              size="sm"
              disabled={pending || proposal.status === status}
              onClick={() => onDecide(decision)}
            >
              {t(`admin:adminReadingGroupProposals.action.${decision}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
