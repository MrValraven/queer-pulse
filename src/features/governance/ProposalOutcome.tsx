import { FiInfo } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { ProposalTally } from "./ProposalTally";
import type { GovernanceProposalDTO } from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

/**
 * The resolved half of a proposal card. A motion that never reached a ballot
 * (rejected at screening, or lapsed short of its threshold) shows no tally at
 * all: an empty bar next to a "did not pass" badge would read as a vote that
 * went badly, which is not what happened.
 *
 * A rejection reason is shown to everyone, not only to the member who raised
 * the motion. Publishing why something was refused is the accountability this
 * page exists for, and it is also how the next member learns what to file
 * instead.
 */
export function ProposalOutcome({
  proposal,
}: {
  proposal: GovernanceProposalDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const wasVotedOn =
    proposal.status === "passed" || proposal.status === "failed";
  const closedDate = fmt.date(new Date(proposal.closesAt));

  return (
    <>
      {wasVotedOn && (
        <ProposalTally
          tally={proposal.tally}
          failedForQuorum={proposal.failedForQuorum}
        />
      )}
      {proposal.status === "lapsed" &&
        proposal.cosignatureThreshold !== null && (
          <p className={styles.proposalCosignNote}>
            {t("governance:sections.proposals.outcome.lapsed", {
              count: proposal.cosignatureCount,
              threshold: proposal.cosignatureThreshold,
            })}
          </p>
        )}
      <p className={styles.proposalClosed}>
        {t(
          wasVotedOn
            ? "governance:sections.proposals.closedOn"
            : "governance:sections.proposals.outcome.reviewedOn",
          { date: closedDate },
        )}
      </p>
      {proposal.screeningNote && (
        <div className={styles.proposalScreeningNote}>
          <div className={styles.proposalScreeningNoteLabel}>
            <FiInfo aria-hidden />{" "}
            {t("governance:sections.proposals.outcome.rejectedLabel")}
          </div>
          <p>{proposal.screeningNote}</p>
        </div>
      )}
    </>
  );
}
