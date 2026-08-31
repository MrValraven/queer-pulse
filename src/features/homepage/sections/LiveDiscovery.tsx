import { useRef, useState } from "react";
import { Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import {
  FeaturedSpotlightCard,
  type FeaturedSpotlightCardHandle,
} from "./FeaturedSpotlightCard";
import { memberFeatureToSpotlightView } from "./spotlightView";
import { SpotlightRow } from "./SpotlightRow";
import { ExploreMembersCta } from "./ExploreMembersCta";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `Discovery`: the members an admin has chosen to
 * feature on `/landing/features`, rendered through the same rich spotlight card
 * the demo showcase uses — a portrait, quote, and profile link that rotate
 * through everyone curated. Beside the card sits the same two-column roster the
 * demo showcase has: one compact row per featured member, so visitors can see
 * the whole set the card is cycling through rather than only whoever's on
 * screen. Renders nothing when nobody is curated yet: an empty section beats
 * inventing members for production visitors.
 *
 * The public feed carries name/tagline/avatar/quote plus the member's own
 * profile tags, so the card's neighborhood and voucher-name bits stay hidden
 * here (see `SpotlightView`) — the tagline stands in for the role line, and the
 * verified mark reflects that every featured member is a vouched member of the
 * community.
 */
export function LiveDiscovery() {
  const { t } = useTranslation();
  const { members, isLoading, isError } = useLandingFeaturesPublic();
  const cardRef = useRef<FeaturedSpotlightCardHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // A failed fetch renders nothing, like an empty slice does. This is the
  // marketing homepage: a visitor has no stake in this teaser row and cannot
  // act on a failure here, and an alert panel between the curated plum and
  // cream sections would cost more than the row is worth. The flag is read
  // explicitly so the choice is a decision rather than an accident.
  if (isLoading || isError || members.length === 0) return null;

  const views = members.map(memberFeatureToSpotlightView);

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

        <div className={styles.roster}>
          <Reveal className={styles.rosterFeat} delay={160}>
            <FeaturedSpotlightCard
              ref={cardRef}
              items={views}
              onActiveChange={setActiveIndex}
            />
          </Reveal>
          <div className={styles.rosterRows}>
            {views.map((view, index) => (
              <Reveal key={view.key} delay={200 + index * 70}>
                <SpotlightRow
                  view={view}
                  active={index === activeIndex}
                  onSelect={() => cardRef.current?.goTo(index)}
                />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className={styles.foot} delay={280}>
          <ExploreMembersCta />
        </Reveal>
      </div>
    </section>
  );
}
