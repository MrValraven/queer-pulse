import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { initialsFromName } from "../../../shared/lib/initials";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import { FeaturedSpotlightCard } from "./FeaturedSpotlightCard";
import { portraitSrc } from "./portraitSrc";
import { type SpotlightView, tintForKey } from "./spotlightView";
import { ExploreMembersCta } from "./ExploreMembersCta";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `Discovery`: the members an admin has chosen to
 * feature on `/landing/features`, rendered through the same rich spotlight card
 * the demo showcase uses — a portrait, quote, and profile link that rotate
 * through everyone curated. Renders nothing when nobody is curated yet: an empty
 * section beats inventing members for production visitors.
 *
 * The public feed carries name/tagline/avatar/quote plus the member's own
 * profile tags, so the card's neighborhood and voucher-name bits stay hidden
 * here (see `SpotlightView`) — the tagline stands in for the role line, and the
 * verified mark reflects that every featured member is a vouched member of the
 * community.
 */
export function LiveDiscovery() {
  const { t } = useTranslation();
  const { members, isLoading } = useLandingFeaturesPublic();

  if (isLoading || members.length === 0) return null;

  const views: SpotlightView[] = members.map((member) => ({
    key: member.slug,
    to: `${routes.publicProfile}/${member.slug}`,
    name: member.name,
    initials: initialsFromName(member.name, "?"),
    tint: tintForKey(member.slug),
    photoUrl: portraitSrc(member.avatarUrl ?? undefined),
    role: member.tagline ?? undefined,
    tags: member.tags,
    verified: true,
    quote: member.quote,
  }));

  return (
    <section className={styles.section} id="discovery">
      <div className="wrap">
        <Reveal className={styles.eyebrow}>
          {t("homepage:liveDiscovery.eyebrow")}
        </Reveal>
        <Reveal as="h2" className={styles.title} delay={60}>
          <Translation
            i18nKey="homepage:discovery.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.sub} delay={120}>
          {t("homepage:discovery.sub")}
        </Reveal>

        <Reveal className={styles.featWrap} delay={160}>
          <FeaturedSpotlightCard items={views} />
        </Reveal>

        <Reveal className={styles.foot} delay={280}>
          <ExploreMembersCta />
        </Reveal>
      </div>
    </section>
  );
}
