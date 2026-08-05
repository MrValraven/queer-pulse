import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { communityPath, routes } from "../../../app/routeMap";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `Communities`: the communities an admin has
 * chosen to feature on `/landing/features`, rendered as a simple honest grid
 * rather than the demo prototype's filterable rail + spotlight (that toolbar
 * makes sense over dozens of fabricated communities; a curated handful of
 * real ones doesn't need filtering). Renders nothing when nothing is
 * curated yet.
 */
export function LiveCommunities() {
  const { t } = useTranslation();
  const { communities, isLoading } = useLandingFeaturesPublic();

  if (isLoading || communities.length === 0) return null;

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
              <Button variant="ghost" to={routes.communities}>
                {t("homepage:communities.browseAllCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {communities.map((community, index) => (
            <Reveal
              key={community.id}
              delay={index * 60}
              as={Link}
              to={communityPath(community.slug)}
              className={styles.communityCard}
            >
              <div className={styles.communityName}>{community.name}</div>
              <div className={styles.communityCount}>
                {t("homepage:liveCommunities.memberCount", {
                  count: community.memberCount,
                })}
              </div>
              {community.blurb && (
                <p className={styles.communityBlurb}>{community.blurb}</p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
