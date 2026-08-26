import type { IconType } from "react-icons";
import {
  FiCheckCircle,
  FiClock,
  FiEye,
  FiSlash,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  GovernanceProposalStatus,
  GovernanceProposalType,
} from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

export function ProposalTypeBadge({ type }: { type: GovernanceProposalType }) {
  const { t } = useTranslation();
  return (
    <span className={styles.proposalType}>
      {t(`governance:sections.proposals.type.${type}`)}
    </span>
  );
}

/**
 * Each lifecycle state gets its own icon and tint, so a motion still
 * gathering names is never read as a vote that failed. `open` stays
 * unbadged: the live vote row underneath already says voting is on.
 */
const STATUS_STYLE: Record<
  Exclude<GovernanceProposalStatus, "open">,
  { icon: IconType; className: string | undefined }
> = {
  gathering: { icon: FiUsers, className: styles.proposalStatusGathering },
  screening: { icon: FiEye, className: styles.proposalStatusScreening },
  passed: { icon: FiCheckCircle, className: styles.proposalStatusPassed },
  failed: { icon: FiXCircle, className: styles.proposalStatusFailed },
  rejected: { icon: FiSlash, className: styles.proposalStatusRejected },
  lapsed: { icon: FiClock, className: styles.proposalStatusLapsed },
};

export function ProposalStatusBadge({
  status,
}: {
  status: GovernanceProposalStatus;
}) {
  const { t } = useTranslation();
  if (status === "open") return null;
  const { icon: Icon, className } = STATUS_STYLE[status];
  return (
    <span
      className={[styles.proposalStatus, className].filter(Boolean).join(" ")}
    >
      <Icon aria-hidden /> {t(`governance:sections.proposals.status.${status}`)}
    </span>
  );
}
