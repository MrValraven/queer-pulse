import { useState } from "react";
import {
  FiCheckCircle,
  FiThumbsDown,
  FiThumbsUp,
  FiXCircle,
} from "react-icons/fi";
import { Button, Reveal, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { SectionError } from "./GovernanceSections";
import {
  useGovernanceProposalVote,
  useGovernanceProposals,
} from "./api/useGovernanceProposals";
import type {
  GovernanceProposalDTO,
  GovernanceProposalStatus,
  GovernanceProposalTallyDTO,
  GovernanceProposalType,
  GovernanceVoteChoice,
} from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

function ProposalTypeBadge({ type }: { type: GovernanceProposalType }) {
  const { t } = useTranslation();
  return (
    <span className={styles.proposalType}>
      {t(`governance:sections.proposals.type.${type}`)}
    </span>
  );
}

function ProposalStatusBadge({ status }: { status: GovernanceProposalStatus }) {
  const { t } = useTranslation();
  if (status === "open") return null;
  const passed = status === "passed";
  const Icon = passed ? FiCheckCircle : FiXCircle;
  return (
    <span
      className={[
        styles.proposalStatus,
        passed ? styles.proposalStatusPassed : styles.proposalStatusFailed,
      ].join(" ")}
    >
      <Icon aria-hidden /> {t(`governance:sections.proposals.status.${status}`)}
    </span>
  );
}

/** Live for/against bar with a marker at the two-thirds line — the exact
 *  threshold the page's copy promises ("removed by a two-thirds community
 *  vote"), so the passing bar is visible, not just stated. */
function ProposalTally({ tally }: { tally: GovernanceProposalTallyDTO }) {
  const { t } = useTranslation();
  return (
    <div className={styles.proposalTallyWrap}>
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
    </div>
  );
}

/** Recomputes the tally as if `choice` had just been added — demo mode's
 *  local, non-persisted optimistic bump (mirrors `PlannedCard`'s `count`
 *  calc in the Roadmap page). Never used in live mode, where the server's
 *  response is the source of truth. */
function bumpTally(
  tally: GovernanceProposalTallyDTO,
  choice: GovernanceVoteChoice,
): GovernanceProposalTallyDTO {
  const forCount = tally.for + (choice === "for" ? 1 : 0);
  const againstCount = tally.against + (choice === "against" ? 1 : 0);
  const total = forCount + againstCount;
  return {
    for: forCount,
    against: againstCount,
    forPercent: total === 0 ? 0 : Math.round((forCount / total) * 100),
  };
}

function ProposalCard({ proposal }: { proposal: GovernanceProposalDTO }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode, vote: castVote } = useGovernanceProposalVote();
  const [localChoice, setLocalChoice] = useState<GovernanceVoteChoice | null>(
    null,
  );

  const myChoice = proposal.myVote ?? localChoice;
  const isOpen = proposal.status === "open";
  const displayTally =
    demoMode && localChoice && !proposal.myVote
      ? bumpTally(proposal.tally, localChoice)
      : proposal.tally;

  function handleVote(choice: GovernanceVoteChoice) {
    if (myChoice) return;
    setLocalChoice(choice);
    if (!demoMode) {
      castVote(
        { proposalId: proposal.id, choice },
        { onError: () => setLocalChoice(null) },
      );
    }
  }

  return (
    <article className={styles.proposalCard}>
      <div className={styles.proposalCardHead}>
        <ProposalTypeBadge type={proposal.type} />
        <ProposalStatusBadge status={proposal.status} />
      </div>
      <h3 className={styles.proposalTitle}>{proposal.title}</h3>
      <p className={styles.proposalDesc}>{proposal.description}</p>
      {proposal.targetMember && (
        <p className={styles.proposalTarget}>
          {t("governance:sections.proposals.targetSeat", {
            name: `${proposal.targetMember.firstName} ${proposal.targetMember.lastName}`.trim(),
          })}
        </p>
      )}
      <ProposalTally tally={displayTally} />
      {isOpen ? (
        <>
          <p className={styles.proposalCloses}>
            {t("governance:sections.proposals.closes", {
              date: fmt.date(new Date(proposal.closesAt)),
            })}
          </p>
          {/* The shared <Button>, not hand-rolled <button>s: the cast vote
              reads as a filled jade/plum pill and the untaken option stays a
              ghost outline, with the design system's focus + disabled states
              instead of a local reimplementation of them. */}
          <div className={styles.proposalVoteRow}>
            <Button
              type="button"
              size="sm"
              variant={myChoice === "for" ? "jade" : "ghost"}
              onClick={() => handleVote("for")}
              disabled={!!myChoice}
              aria-pressed={myChoice === "for"}
            >
              <FiThumbsUp aria-hidden />
              {t("governance:sections.proposals.voteFor")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={myChoice === "against" ? "plum" : "ghost"}
              onClick={() => handleVote("against")}
              disabled={!!myChoice}
              aria-pressed={myChoice === "against"}
            >
              <FiThumbsDown aria-hidden />
              {t("governance:sections.proposals.voteAgainst")}
            </Button>
          </div>
          {myChoice && (
            <p className={styles.proposalVotedNote}>
              {t(
                myChoice === "for"
                  ? "governance:sections.proposals.votedFor"
                  : "governance:sections.proposals.votedAgainst",
              )}
            </p>
          )}
        </>
      ) : (
        <p className={styles.proposalClosed}>
          {t("governance:sections.proposals.closedOn", {
            date: fmt.date(new Date(proposal.closesAt)),
          })}
        </p>
      )}
    </article>
  );
}

export function ProposalsSection() {
  const { t } = useTranslation();
  const { proposals, loading, error, retry } = useGovernanceProposals();
  const open = proposals.filter((proposal) => proposal.status === "open");
  const resolved = proposals.filter((proposal) => proposal.status !== "open");

  return (
    <Reveal as="section" className={styles.section} id="proposals">
      <div className={styles.eye}>
        {t("governance:sections.proposals.eyebrow")}
      </div>
      <h2 className={styles.secH}>
        <Translation
          i18nKey="governance:sections.proposals.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.prose}>
        <p>{t("governance:sections.proposals.intro")}</p>
      </div>
      {error ? (
        <SectionError onRetry={retry} />
      ) : loading ? (
        <div className={styles.proposalList}>
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className={styles.proposalCard} aria-hidden>
              <SkeletonLine width="40%" height={16} />
              <SkeletonLine width="70%" height={22} style={{ marginTop: 10 }} />
              <SkeletonLine width="90%" height={13} style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <p className={styles.proposalEmpty}>
          {t("governance:sections.proposals.empty")}
        </p>
      ) : (
        <>
          {open.length > 0 && (
            <div className={styles.proposalList}>
              {open.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
          {resolved.length > 0 && (
            <>
              <div className={styles.proposalResolvedHead}>
                {t("governance:sections.proposals.resolvedHeading")}
              </div>
              <div className={styles.proposalList}>
                {resolved.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Reveal>
  );
}
