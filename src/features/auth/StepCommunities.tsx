import { useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { Button, SkeletonCard } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunities } from "../communities/api/useCommunities";
import { useJoinCommunity } from "../communities/api/useCommunityMutations";
import type { Community } from "../homepage/data/types";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

const SUGGESTION_LIMIT = 4;

/** One suggested community with its own real join mutation (one hook per card
 *  keeps rules-of-hooks intact across a variable-length grid). */
function CommunityJoinCard({ community }: { community: Community }) {
  const { t } = useTranslation();
  const slug = community.slug ?? "";
  const joinCommunity = useJoinCommunity(slug);
  // Seed from the card's own role (live discover cards carry `myRole`); demo
  // cards leave it unset, so they start un-joined and flip on click.
  const [status, setStatus] = useState<"idle" | "joined" | "requested">(
    community.myRole ? "joined" : "idle",
  );
  const isMember = status !== "idle";

  async function handleJoin() {
    if (isMember) return;
    setStatus("joined");
    try {
      const result = await joinCommunity.mutateAsync({});
      if (result?.outcome === "requested") setStatus("requested");
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div
      className={[styles.commCard, isMember && styles.commJoined]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.ccName}>{community.name}</div>
      <div className={styles.ccCount}>{community.count}</div>
      <div className={styles.ccDesc}>{community.description}</div>
      <button
        type="button"
        className={[styles.ccJoin, isMember && styles.ccJoinActive]
          .filter(Boolean)
          .join(" ")}
        onClick={() => void handleJoin()}
        disabled={joinCommunity.isPending}
      >
        {status === "requested" ? (
          <>
            <FiCheck /> {t("auth:onboarding.stepCommunities.requested")}
          </>
        ) : status === "joined" ? (
          <>
            <FiCheck /> {t("auth:onboarding.stepCommunities.joined")}
          </>
        ) : (
          t("auth:onboarding.stepCommunities.join")
        )}
      </button>
    </div>
  );
}

export function StepCommunities({ onNext, onBack, stepLabel }: StepProps) {
  const { t } = useTranslation();
  const { items, isLoading } = useCommunities({ filter: "discover" });
  const suggestions = items
    .filter((community) => Boolean(community.slug))
    .slice(0, SUGGESTION_LIMIT);

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepCommunities.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.p} style={{ marginBottom: 20 }}>
        {t("auth:onboarding.stepCommunities.body")}
      </div>
      {isLoading ? (
        <div className={styles.communityGrid}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : suggestions.length === 0 ? (
        <div className={styles.p}>
          {t("auth:onboarding.stepCommunities.empty")}
        </div>
      ) : (
        <div className={styles.communityGrid}>
          {suggestions.map((community) => (
            <CommunityJoinCard key={community.slug} community={community} />
          ))}
        </div>
      )}
      <div className={styles.nav}>
        <Button onClick={onNext}>
          {t("auth:onboarding.stepCommunities.continue")}
        </Button>
        <SkipLink
          onSkip={onNext}
          label={t("auth:onboarding.stepCommunities.skip")}
        />
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepCommunities.back")}
        </button>
      </div>
    </>
  );
}
