import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { communityPath, routes } from "../../app/routeMap";
import { Button, Reveal, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunities } from "../communities/api/useCommunities";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import type { Community } from "../../shared/types/domain";
import type { ArrivingTone } from "./arrivingPage.data";
import { TONE_CLASS } from "./arrivingTone";
import { MarketingSection } from "./MarketingSection";
import styles from "./ArrivingPage.module.css";

const SHOWN_COUNT = 3;

/**
 * The curated tags that describe a room a newcomer can walk into: easy to join
 * cold, meets in person, rooted in the city. Tags are OR'd server-side, and the
 * demo branch of `useCommunities` mirrors the same filter over its registry.
 */
const NEWCOMER_TAGS = [
  "beginner-friendly",
  "in-person-meetups",
  "local-city-based",
];

/** Community type → the chip tint it wears here. */
const TYPE_TONE: Record<string, ArrivingTone> = {
  social: "jade",
  arts: "coral",
  activism: "violet",
  support: "violet",
  sports: "jade",
  professional: "neutral",
};

/** A community with a resolved slug, so the card can link somewhere real. */
type LinkableCommunity = Community & { slug: string };

function CommunityCards({ communities }: { communities: LinkableCommunity[] }) {
  return (
    <div className={styles.commQuick}>
      {communities.map((community, index) => (
        <Reveal
          as={Link}
          to={communityPath(community.slug)}
          className={styles.cqCard}
          key={community.slug}
          delay={index * 55}
        >
          <span
            className={`${styles.cqType} ${
              TONE_CLASS[TYPE_TONE[community.type] ?? "neutral"]
            }`}
          >
            {community.typeLabel}
          </span>
          <span className={styles.cqName}>{community.name}</span>
          <span className={styles.cqReason}>{community.description}</span>
        </Reveal>
      ))}
    </div>
  );
}

function CommunityCardsLoading() {
  const { t } = useTranslation();
  return (
    <div
      className={styles.commQuick}
      role="status"
      aria-label={t("marketing:arriving.commQuick.loading")}
    >
      {[0, 1, 2].map((placeholderIndex) => (
        <div className={styles.cqCard} key={placeholderIndex}>
          <SkeletonLine width={70} height={18} />
          <SkeletonLine width="70%" height={20} />
          <SkeletonLine width="90%" height={14} />
        </div>
      ))}
    </div>
  );
}

/**
 * "Where to start" — real communities, linked to their real slugs.
 *
 * The three cards used to be hardcoded names, all three linking to the
 * `/communities` index. They now come from the same `useCommunities` source the
 * discover grid uses, which branches demo/live inside the hook, and each card
 * opens that community's own page.
 */
export function ArrivingCommunitiesSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  // `GET /communities` is a members-only read, so a logged-out visitor is told
  // where these live rather than shown an empty grid built out of a 401.
  const canReadCommunities = demoMode || loggedIn;
  const { items, isLoading } = useCommunities(
    { tags: NEWCOMER_TAGS },
    { enabled: canReadCommunities },
  );
  const shown = items
    .filter((community): community is LinkableCommunity =>
      Boolean(community.slug),
    )
    .slice(0, SHOWN_COUNT);
  const isBusy = (!demoMode && checking) || (canReadCommunities && isLoading);

  return (
    <MarketingSection
      eyebrow={t("marketing:arriving.commQuick.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.commQuick.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.commQuick.intro")}
    >
      {isBusy && <CommunityCardsLoading />}
      {!isBusy && !canReadCommunities && (
        <p className={styles.plainNote}>
          {t("marketing:arriving.commQuick.locked")}
        </p>
      )}
      {!isBusy && canReadCommunities && shown.length === 0 && (
        <p className={styles.plainNote}>
          {t("marketing:arriving.commQuick.empty")}
        </p>
      )}
      {!isBusy && canReadCommunities && shown.length > 0 && (
        <CommunityCards communities={shown} />
      )}

      <Reveal as="div" className={styles.commCta} delay={120}>
        {canReadCommunities ? (
          <Button to={routes.communities} variant="ghost">
            {t("marketing:arriving.commQuick.browseCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        ) : (
          <Button to={requestInvitePath("arriving")} variant="ghost">
            {t("marketing:arriving.commQuick.lockedCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
      </Reveal>
    </MarketingSection>
  );
}
