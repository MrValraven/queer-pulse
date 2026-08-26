import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { Button, Reveal, SkeletonLine } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SectionError } from "./GovernanceSections";
import { MotionComposeModal } from "./MotionComposeModal";
import { ProposalCard } from "./ProposalCard";
import { useGovernanceProposals } from "./api/useGovernanceProposals";
import type {
  GovernanceProposalDTO,
  GovernanceProposalStatus,
} from "./api/governanceProposals.api";
import styles from "./GovernancePage.module.css";

/** The three shelves, in the order a proposal travels through them. */
const SHELF_STATUSES: Record<
  "gathering" | "voting" | "resolved",
  GovernanceProposalStatus[]
> = {
  gathering: ["gathering", "screening"],
  voting: ["open"],
  resolved: ["passed", "failed", "rejected", "lapsed"],
};

function ProposalShelf({
  headingKey,
  proposals,
}: {
  headingKey: string;
  proposals: GovernanceProposalDTO[];
}) {
  const { t } = useTranslation();
  if (proposals.length === 0) return null;
  return (
    <>
      <div className={styles.proposalResolvedHead}>{t(headingKey)}</div>
      <div className={styles.proposalList}>
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </>
  );
}

function ProposalListSkeleton() {
  return (
    <div className={styles.proposalList}>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className={styles.proposalCard} aria-hidden>
          <SkeletonLine width="40%" height={16} />
          <SkeletonLine width="70%" height={22} style={{ marginTop: 10 }} />
          <SkeletonLine width="90%" height={13} style={{ marginTop: 10 }} />
        </div>
      ))}
    </div>
  );
}

export function ProposalsSection() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { proposals, loading, error, retry } = useGovernanceProposals();
  const [isComposing, setIsComposing] = useState(false);

  const shelfOf = (shelf: keyof typeof SHELF_STATUSES) =>
    proposals.filter((proposal) =>
      SHELF_STATUSES[shelf].includes(proposal.status),
    );

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
      {loggedIn && (
        <div className={styles.proposalComposeRow}>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsComposing(true)}
          >
            <FiEdit3 aria-hidden />
            {t("governance:sections.proposals.compose.cta")}
          </Button>
          <p className={styles.proposalComposeHint}>
            {t("governance:sections.proposals.compose.hint")}
          </p>
        </div>
      )}
      {error ? (
        <SectionError onRetry={retry} />
      ) : loading ? (
        <ProposalListSkeleton />
      ) : proposals.length === 0 ? (
        <p className={styles.proposalEmpty}>
          {t("governance:sections.proposals.empty")}
        </p>
      ) : (
        <>
          <ProposalShelf
            headingKey="governance:sections.proposals.gatheringHeading"
            proposals={shelfOf("gathering")}
          />
          <ProposalShelf
            headingKey="governance:sections.proposals.votingHeading"
            proposals={shelfOf("voting")}
          />
          <ProposalShelf
            headingKey="governance:sections.proposals.resolvedHeading"
            proposals={shelfOf("resolved")}
          />
        </>
      )}
      {isComposing && (
        <MotionComposeModal onClose={() => setIsComposing(false)} />
      )}
    </Reveal>
  );
}
