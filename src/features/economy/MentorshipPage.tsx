import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { LuSprout, LuTreeDeciduous } from "react-icons/lu";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  Outro,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { routes } from "../../app/routeMap";
import {
  MENTORS,
  STATS,
  VOLUNTEER,
  isWaitlisted,
  type Mode,
} from "./mentorship.data";
import { MentorMatchModal } from "./MentorMatchModal";
import styles from "./MentorshipPage.module.css";

// Mirrors the inline mentorCard shape so there's zero layout shift on swap.
function MentorSkeleton() {
  return (
    <div className={styles.mentorCard} aria-hidden>
      <div className={styles.mcTop}>
        <SkeletonAvatar size={46} />
        <div>
          <SkeletonLine width={120} height={16} />
          <SkeletonLine width={88} height={13} style={{ marginTop: 6 }} />
        </div>
      </div>
      <div className={styles.mcAreas}>
        <SkeletonLine width={72} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width={94} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width={60} height={24} style={{ borderRadius: 7 }} />
      </div>
      <div className={styles.mcCap}>
        <SkeletonLine width="55%" height={13} />
      </div>
      <SkeletonLine width="100%" height={40} style={{ borderRadius: 999 }} />
    </div>
  );
}

export function MentorshipPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <PageShell>
      <header className={styles.hero} data-plum>
        <div className="wrap">
          <div className={styles.cat}>
            {t("economy:mentorship.hero.eyebrow")}
          </div>
          <h1>
            <Translation
              i18nKey="economy:mentorship.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p>{t("economy:mentorship.hero.lead")}</p>
          {demoMode && (
            <div className={styles.stats}>
              {STATS.map((stat) => (
                <div key={stat.labelKey}>
                  <div className={styles.msN}>{stat.n}</div>
                  <div className={styles.msL}>{t(stat.labelKey)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className={styles.choose}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="economy:mentorship.choose.title"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <div className={styles.chooseGrid}>
            <button
              type="button"
              className={styles.chooseCard}
              onClick={() => setMode("mentee")}
            >
              <div className={styles.ccIcon}>
                <LuSprout />
              </div>
              <div className={styles.ccTitle}>
                {t("economy:mentorship.choose.mentee.title")}
              </div>
              <p className={styles.ccDesc}>
                {t("economy:mentorship.choose.mentee.desc")}
              </p>
              <div className={styles.ccFor}>
                {t("economy:mentorship.choose.mentee.for")}{" "}
                <FiArrowRight aria-hidden />
              </div>
            </button>
            <button
              type="button"
              className={styles.chooseCard}
              onClick={() => setMode("mentor")}
            >
              <div className={styles.ccIcon}>
                <LuTreeDeciduous />
              </div>
              <div className={styles.ccTitle}>
                {t("economy:mentorship.choose.mentor.title")}
              </div>
              <p className={styles.ccDesc}>
                {t("economy:mentorship.choose.mentor.desc")}
              </p>
              <div className={styles.ccFor}>
                {t("economy:mentorship.choose.mentor.for")}{" "}
                <FiArrowRight aria-hidden />
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.mentorsStrip}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              <Translation
                i18nKey="economy:mentorship.strip.title"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.sub}>
              {t("economy:mentorship.strip.sub")}
            </div>
          </div>
          {demoMode ? (
            <div className={styles.mentorGrid}>
              {loading
                ? Array.from({ length: 6 }).map((_, skeletonIndex) => (
                    <MentorSkeleton key={skeletonIndex} />
                  ))
                : MENTORS.map((mentor, mentorIndex) => (
                    <FadeIn
                      key={mentor.slug}
                      delay={Math.min(mentorIndex, 8) * 60}
                    >
                      <Link
                        to={`${routes.mentorship}/${mentor.slug}`}
                        className={styles.mentorCard}
                      >
                        <div className={styles.mcTop}>
                          <div
                            className={styles.mcAv}
                            style={{ background: mentor.background, color: mentor.color }}
                          >
                            {mentor.initials}
                          </div>
                          <div>
                            <div className={styles.mcName}>{mentor.name}</div>
                            <div className={styles.mcRole}>{mentor.role}</div>
                          </div>
                        </div>
                        <div className={styles.mcAreas}>
                          {mentor.areas.map((area) => (
                            <span key={area} className={styles.mcArea}>
                              {area}
                            </span>
                          ))}
                        </div>
                        <div
                          className={`${styles.mcCap} ${isWaitlisted(mentor) ? styles.mcCapWait : ""}`}
                        >
                          {mentor.cap}
                        </div>
                        <span
                          role="button"
                          tabIndex={0}
                          className={styles.mcConnect}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setMode("mentee");
                          }}
                          onKeyDown={(event) =>
                            activateOnKey(event, () => {
                              event.stopPropagation();
                              setMode("mentee");
                            })
                          }
                        >
                          {isWaitlisted(mentor)
                            ? t("economy:mentorship.cta.joinWaitlist")
                            : t("economy:mentorship.cta.requestMatch")}
                        </span>
                      </Link>
                    </FadeIn>
                  ))}
            </div>
          ) : (
            <EmptyState
              icon={<LuTreeDeciduous />}
              title={t("economy:mentorship.emptyLive.title")}
              description={t("economy:mentorship.emptyLive.description")}
            />
          )}
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="economy:mentorship.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:mentorship.outro.sub")}
      >
        <Button to={VOLUNTEER} variant="primary" size="lg">
          {t("economy:mentorship.outro.cta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Outro>

      {mode && <MentorMatchModal mode={mode} onClose={() => setMode(null)} />}
    </PageShell>
  );
}
