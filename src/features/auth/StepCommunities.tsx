import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Button, SkeletonCard } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunities } from "../communities/api/useCommunities";
import type { Community } from "../homepage/data/types";
import { OnboardingCommunityCard } from "./OnboardingCommunityCard";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

const SUGGESTION_LIMIT = 4;

/** Onboarding only suggests "public" tier communities. One with house rules
 *  opens the join wizard from its card, so the member can read and agree to
 *  them; the rest join in one tap. Request/invite/private communities gate
 *  entry (a join here would sit pending or be refused), so they don't belong
 *  in this quick pick-and-join step. Treat a missing tier as open only when the card isn't otherwise flagged
 *  private, so both the live card DTO (always carries `accessTier`) and the demo
 *  registry (tags only the gated one) filter correctly. */
function isOpenlyJoinable(community: Community): boolean {
  if (community.privateBadge || community.dashed) return false;
  return (
    community.accessTier === undefined || community.accessTier === "public"
  );
}

export function StepCommunities({ onNext, onBack, stepLabel }: StepProps) {
  const { t } = useTranslation();
  const { items, isLoading } = useCommunities({ filter: "discover" });
  const liveSuggestions = items
    .filter((community) => Boolean(community.slug))
    .filter(isOpenlyJoinable)
    .slice(0, SUGGESTION_LIMIT);
  // Held from the first non-empty answer on. A join or leave invalidates every
  // `["communities"]` query, and the refetched page can reorder or drop a card
  // (a community founded meanwhile, a tier that changed) while it is still
  // showing its outcome. Set during render, the React pattern for keeping a
  // value from an earlier render, so the frozen list paints in the same pass.
  const [frozenSuggestions, setFrozenSuggestions] = useState<
    Community[] | null
  >(null);
  if (frozenSuggestions === null && liveSuggestions.length > 0) {
    setFrozenSuggestions(liveSuggestions);
  }
  const suggestions = frozenSuggestions ?? liveSuggestions;

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepCommunities.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={`${styles.p} ${styles.pTight}`}>
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
            <OnboardingCommunityCard
              key={community.slug}
              community={community}
            />
          ))}
        </div>
      )}
      <div className={styles.nav}>
        <div className={styles.navRow}>
          <button type="button" className={styles.back} onClick={onBack}>
            <FiArrowLeft aria-hidden />{" "}
            {t("auth:onboarding.stepCommunities.back")}
          </button>
          <Button onClick={onNext}>
            {t("auth:onboarding.stepCommunities.continue")}
          </Button>
        </div>
        <SkipLink
          onSkip={onNext}
          label={t("auth:onboarding.stepCommunities.skip")}
        />
      </div>
    </>
  );
}
