import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { communityPath } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GatheringDetail } from "./data";
import { GatheringCommunityRow } from "./GatheringCommunityRow";
import { GatheringGuestCommunityRow } from "./GatheringGuestCommunityRow";
import {
  heroHostingCommunities,
  heroHostingKey,
} from "./gatheringHostingCommunities";
import {
  useVisibleGatheringCommunity,
  useVisibleGuestCommunities,
} from "./useVisibleGatheringCommunity";
import styles from "./GatheringPage.module.css";

/** The `{token}`s the hero sentence places a linked name in, in order. */
const HERO_SLOT_TOKENS = ["first", "second", "third"] as const;

/**
 * "With <lead> and <guest>" in the hero's meta line, next to "Hosted by".
 * The lead comes first, then the accepted guests; past two guests the rest
 * read "and N more". Each community is named under its own visibility rule,
 * so a private lead hidden from this viewer leaves the guests alone in the
 * line. Renders nothing when no community may be named.
 */
export function GatheringHeroCommunity({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const lead = useVisibleGatheringCommunity(gathering);
  const guests = useVisibleGuestCommunities(gathering);
  const { named, moreCount } = heroHostingCommunities(lead, guests);
  if (named.length === 0) return null;
  const slots: Record<string, ReactNode> = {};
  named.forEach((community, index) => {
    const token = HERO_SLOT_TOKENS[index];
    if (!token) return;
    slots[token] = (
      <Link className={styles.metaLink} to={communityPath(community.slug)}>
        {community.name}
      </Link>
    );
  });
  return (
    <span className={styles.metaItem}>
      <span className={styles.metaDot} />
      <span>
        <Translation
          i18nKey={heroHostingKey(named.length, moreCount)}
          values={moreCount > 0 ? { count: moreCount } : undefined}
          slots={slots}
        />
      </span>
    </span>
  );
}

/**
 * The sidebar's "Hosted with" card, under the host: the lead, then each
 * accepted guest, under the hero line's visibility rules so the two never
 * disagree. The heading takes focus when a guest community removes itself.
 */
export function GatheringCommunityCard({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const lead = useVisibleGatheringCommunity(gathering);
  const guests = useVisibleGuestCommunities(gathering);
  const headingRef = useRef<HTMLDivElement>(null);
  if (!lead && guests.length === 0) return null;
  return (
    <>
      <div ref={headingRef} tabIndex={-1} className={styles.sh}>
        {t("gatherings:gathering.hostedWithHeading")}
      </div>
      {lead && (
        <GatheringCommunityRow
          community={lead}
          roleLabel={t("gatherings:gathering.hostedWithRole")}
        />
      )}
      {guests.map((guest) => (
        <GatheringGuestCommunityRow
          key={guest.id}
          guest={guest}
          eventSlug={gathering.slug}
          onLeft={() => headingRef.current?.focus()}
        />
      ))}
    </>
  );
}
