import { FiArrowRight } from "react-icons/fi";
import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import { FeaturedCommunityCard } from "./FeaturedCommunityCard";
import { landingCommunityToView } from "./communitySpotlightView";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `Communities`: the communities an admin has chosen
 * to feature on `/landing/features`, rendered through the same rich card family
 * the demo showcase uses (cover, category, blurb, "what you get", owner, access
 * + founding year, roster faces + count) rather than the demo prototype's
 * filterable rail + spotlight (that toolbar makes sense over dozens of
 * fabricated communities; a curated handful of real ones doesn't need it).
 *
 * The public feed carries only what real communities actually have, so the
 * card's founder-quote, location, languages, verified-badge and growth-sparkline
 * bits stay hidden (see `CommunitySpotlightView`) — it leans on genuine data and
 * shows a tinted placeholder for communities without a cover. Renders nothing
 * when nothing is curated yet: an empty section beats inventing communities.
 */
export function LiveCommunities() {
  const { t } = useTranslation();
  const { communities, isLoading } = useLandingFeaturesPublic();

  if (isLoading || communities.length === 0) return null;

  const views = communities.map(landingCommunityToView);

  return (
    <section className={styles.section} id="communities">
      <div className="wrap">
        <Reveal>
          <div className={styles.head}>
            <div className={styles.headText}>
              <div className={styles.eyebrow}>
                {t("homepage:communities.eyebrow")}
              </div>
              <h2 className={styles.title}>
                <Translation
                  i18nKey="homepage:communities.title"
                  components={{ em: <em /> }}
                />
              </h2>
              <p className={styles.sub}>
                {t("homepage:liveCommunities.sub")}
              </p>
            </div>
            <div>
              <Button variant="ghost" to={routes.aboutCommunities}>
                {t("homepage:communities.howCommunitiesWorkCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <FeaturedCommunityCard items={views} />
        </Reveal>
      </div>
    </section>
  );
}
