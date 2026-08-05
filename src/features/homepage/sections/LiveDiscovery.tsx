import { Link } from "react-router-dom";
import { Avatar, Button, Reveal } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { initialsFromName } from "../../../shared/lib/initials";
import { useLandingFeaturesPublic } from "../api/useLandingFeatures";
import styles from "./LiveSections.module.css";

/**
 * Live-mode counterpart to `Discovery`: the members an admin has chosen to
 * feature on `/landing/features`, rather than the demo prototype's rotating
 * cast of fabricated spotlights. Renders nothing when nobody is curated yet
 * — an empty section beats inventing members for production visitors.
 */
export function LiveDiscovery() {
  const { t } = useTranslation();
  const { members, isLoading } = useLandingFeaturesPublic();

  if (isLoading || members.length === 0) return null;

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

        <div className={[styles.grid, styles.gridSpaced].join(" ")}>
          {members.map((member, index) => (
            <Reveal
              key={member.id}
              delay={160 + index * 60}
              as={Link}
              to={`${routes.publicProfile}/${member.slug}`}
              className={styles.memberCard}
            >
              <div className={styles.memberHead}>
                <Avatar
                  src={member.avatarUrl ?? undefined}
                  initials={initialsFromName(member.name, "?")}
                  size={48}
                  alt={member.name}
                />
                <div className={styles.memberMeta}>
                  <div className={styles.memberName}>{member.name}</div>
                  {member.tagline && (
                    <div className={styles.memberTagline}>
                      {member.tagline}
                    </div>
                  )}
                </div>
              </div>
              <p className={styles.memberQuote}>&ldquo;{member.quote}&rdquo;</p>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.foot} delay={280}>
          <Button to={routes.members}>
            {t("homepage:discovery.exploreMembersCta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
