import type { IconType } from "react-icons";
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiMinusCircle,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, type AdminTone } from "./ui";
import type {
  GovernanceProposalDTO,
  GovernanceProposalStatus,
} from "../governance/api/governanceProposals.api";
import styles from "./AdminGovernancePage.module.css";

/** Icon and tone per lifecycle stage. Stages still in progress stay neutral;
 *  only a vote that failed reads red. */
const STATUS_LOOK: Record<
  GovernanceProposalStatus,
  { Icon: IconType; tone: AdminTone }
> = {
  gathering: { Icon: FiUsers, tone: "plum" },
  screening: { Icon: FiEye, tone: "plum" },
  open: { Icon: FiClock, tone: "plum" },
  passed: { Icon: FiCheckCircle, tone: "jade" },
  failed: { Icon: FiXCircle, tone: "danger" },
  rejected: { Icon: FiMinusCircle, tone: "ghost" },
  lapsed: { Icon: FiMinusCircle, tone: "ghost" },
};

/** The stages where members have cast ballots, so a tally means something. */
const VOTED_STATUSES = new Set<GovernanceProposalStatus>([
  "open",
  "passed",
  "failed",
]);

function ProposalTimeline({ proposal }: { proposal: GovernanceProposalDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { status } = proposal;

  if (status === "gathering" || status === "lapsed") {
    const closesAt = proposal.gatheringClosesAt ?? proposal.closesAt;
    return (
      <>
        <p className={styles.cardSub}>
          {t("admin:governance.motions.list.cosignatures", {
            count: proposal.cosignatureCount,
          })}
        </p>
        <p className={styles.cardSub}>
          {t("admin:governance.proposals.list.cosignaturesClose", {
            date: fmt.date(new Date(closesAt)),
          })}
        </p>
      </>
    );
  }
  if (status === "screening") return null;
  if (status === "rejected") {
    return proposal.screeningNote ? (
      <p className={styles.cardSub}>
        {t("admin:governance.proposals.list.screeningNote", {
          note: proposal.screeningNote,
        })}
      </p>
    ) : null;
  }
  return (
    <p className={styles.cardSub}>
      {status === "open"
        ? t("admin:governance.proposals.list.closes", {
            date: fmt.date(new Date(proposal.closesAt)),
          })
        : t("admin:governance.proposals.list.closedOn", {
            date: fmt.date(new Date(proposal.closesAt)),
          })}
    </p>
  );
}

/** One proposal in the admin list: its stage, what it asks, and where the
 *  vote or the co-signature drive stands. */
export function AdminGovernanceProposalRow({
  proposal,
}: {
  proposal: GovernanceProposalDTO;
}) {
  const { t } = useTranslation();
  const { tally, status } = proposal;
  const { Icon, tone } = STATUS_LOOK[status];

  return (
    <article className={styles.govListRow}>
      <div className={styles.proposalAdminHead}>
        <h3 className={styles.govListRowTitle}>{proposal.title}</h3>
        <AdminChip tone={tone} className={styles.proposalStatus}>
          <Icon aria-hidden />
          {t(`admin:governance.proposals.list.status.${status}`)}
        </AdminChip>
      </div>
      <p className={styles.cardSub}>
        {t(`admin:governance.proposals.list.type.${proposal.type}`)}
      </p>
      <p className={styles.cardSub}>{proposal.description}</p>
      {VOTED_STATUSES.has(status) && (
        <p className={styles.cardSub}>
          {t("admin:governance.proposals.list.tally", {
            forCount: tally.for,
            againstCount: tally.against,
            forPercent: tally.forPercent,
          })}
        </p>
      )}
      <ProposalTimeline proposal={proposal} />
    </article>
  );
}
