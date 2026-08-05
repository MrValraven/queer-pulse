import { useState } from "react";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { Button, SkeletonCard } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunities } from "../communities/api/useCommunities";
import {
  useJoinCommunity,
  useLeaveCommunity,
} from "../communities/api/useCommunityMutations";
import type { Community } from "../homepage/data/types";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

const SUGGESTION_LIMIT = 4;

/** Onboarding only suggests communities you can join in one tap — the "public"
 *  tier. Request/invite/private communities gate entry (a join here would sit
 *  pending or be refused), so they don't belong in this quick pick-and-join
 *  step. Treat a missing tier as open only when the card isn't otherwise flagged
 *  private, so both the live card DTO (always carries `accessTier`) and the demo
 *  registry (tags only the gated one) filter correctly. */
function isOpenlyJoinable(community: Community): boolean {
  if (community.privateBadge || community.dashed) return false;
  return community.accessTier === undefined || community.accessTier === "public";
}

/** One suggested community with its own join + leave mutations (one hook set per
 *  card keeps rules-of-hooks intact across a variable-length grid). The button
 *  toggles: tap to join, tap again to leave. */
function CommunityJoinCard({ community }: { community: Community }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const slug = community.slug ?? "";
  const joinCommunity = useJoinCommunity(slug);
  const leaveCommunity = useLeaveCommunity(slug);
  // Seed from the card's own role (live discover cards carry `myRole`); demo
  // cards leave it unset, so they start un-joined and flip on click.
  const [status, setStatus] = useState<"idle" | "joined" | "requested">(
    community.myRole ? "joined" : "idle",
  );
  const isMember = status !== "idle";
  const isPending = joinCommunity.isPending || leaveCommunity.isPending;

  async function handleToggle() {
    if (isPending) return;
    if (status === "joined") {
      // Leave. Self-leave passes the caller's own member slug; demo mode's
      // mutation is a no-op (empty slug is harmless), live mode always has a
      // profile slug on the session. Roll back to joined if the call fails.
      setStatus("idle");
      try {
        await leaveCommunity.mutateAsync({ memberSlug: user?.profile.slug ?? "" });
      } catch {
        setStatus("joined");
      }
    } else if (status === "idle") {
      setStatus("joined");
      try {
        const result = await joinCommunity.mutateAsync({});
        if (result?.outcome === "requested") setStatus("requested");
      } catch {
        setStatus("idle");
      }
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
        onClick={() => void handleToggle()}
        disabled={isPending}
        aria-pressed={isMember}
        title={
          status === "joined"
            ? t("auth:onboarding.stepCommunities.leave")
            : undefined
        }
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
    .filter(isOpenlyJoinable)
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
