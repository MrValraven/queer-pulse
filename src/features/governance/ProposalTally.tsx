import { FiAlertCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GovernanceProposalTallyDTO } from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

/**
 * Turnout against quorum, kept as its own labelled reading rather than being
 * folded into the for/against bar above it. The two say different things: the
 * bar is the share of the votes cast, quorum is whether enough members voted
 * at all. A proposal can clear two-thirds and still fail on turnout, and this
 * block is what makes that legible instead of contradictory.
 */
function QuorumReading({
  quorumRequired,
  totalVotes,
  failedForQuorum,
}: {
  quorumRequired: number;
  totalVotes: number;
  failedForQuorum: boolean;
}) {
  const { t } = useTranslation();
  const isQuorumMet = totalVotes >= quorumRequired;
  const turnoutPercent =
    quorumRequired === 0
      ? 100
      : Math.min(100, Math.round((totalVotes / quorumRequired) * 100));

  const captionKey = failedForQuorum
    ? "governance:sections.proposals.quorum.missed"
    : isQuorumMet
      ? "governance:sections.proposals.quorum.met"
      : "governance:sections.proposals.quorum.pending";

  return (
    <div className={styles.proposalQuorum}>
      <div className={styles.proposalTallyLabel}>
        {t("governance:sections.proposals.quorum.label")}
      </div>
      <div className={styles.proposalQuorumTrack} aria-hidden>
        <div
          className={[
            styles.proposalQuorumFill,
            isQuorumMet ? undefined : styles.proposalQuorumFillShort,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${turnoutPercent}%` }}
        />
      </div>
      <div
        className={[
          styles.proposalQuorumCaption,
          failedForQuorum ? styles.proposalQuorumMissed : undefined,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {failedForQuorum && <FiAlertCircle aria-hidden />}{" "}
        {t(captionKey, { totalVotes, quorumRequired })}
      </div>
    </div>
  );
}

/**
 * Live for/against bar with a marker at the two-thirds line — the exact
 * threshold the page's copy promises ("removed by a two-thirds community
 * vote"), so the passing bar is visible, not just stated. The quorum reading
 * sits below it as a separate figure.
 */
export function ProposalTally({
  tally,
  failedForQuorum = false,
}: {
  tally: GovernanceProposalTallyDTO;
  failedForQuorum?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.proposalTallyWrap}>
      <div className={styles.proposalTallyLabel}>
        {t("governance:sections.proposals.tallyLabel")}
      </div>
      <div className={styles.proposalTrack}>
        <div className={styles.proposalThreshold} aria-hidden />
        <div
          className={styles.proposalFill}
          style={{ width: `${tally.forPercent}%` }}
        />
      </div>
      <div className={styles.proposalTallyCaption}>
        {t("governance:sections.proposals.tallyCaption", {
          forCount: tally.for,
          againstCount: tally.against,
          forPercent: tally.forPercent,
        })}
      </div>
      {tally.quorumRequired !== null && (
        <QuorumReading
          quorumRequired={tally.quorumRequired}
          totalVotes={tally.totalVotes}
          failedForQuorum={failedForQuorum}
        />
      )}
    </div>
  );
}
