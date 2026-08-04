import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  ImageSlot,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useConnect } from "../../app/providers/useConnect";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NominateChangemakerSection } from "./NominateChangemakerSection";
import { useChangemakers } from "./api/useChangemakers";
import styles from "./ChangemakersPage.module.css";

function MakerCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width="100%" height={180} style={{ borderRadius: 0 }} />
      <div className={styles.cardBody}>
        <SkeletonLine width={120} height={12} />
        <SkeletonLine width="65%" height={20} style={{ marginTop: 8 }} />
        <SkeletonLine width="100%" height={14} style={{ marginTop: 10 }} />
        <SkeletonLine width="80%" height={14} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}

export function ChangemakersPage() {
  const { profiles, featured, stats, isLoading } = useChangemakers();
  const { openConnect } = useConnect();
  const { t } = useTranslation();

  const makers = featured
    ? profiles.filter((profile) => profile.slug !== featured.slug)
    : profiles;
  const loading = isLoading;

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("community:changemakers.hero.cat")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="community:changemakers.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" delay={120}>
            {t("community:changemakers.hero.lead")}
          </Reveal>
          <div className={styles.stats}>
            {stats.map((stat, index) => (
              <Reveal
                as="div"
                key={stat.labelKey}
                className={styles.stat}
                delay={160 + index * 60}
              >
                <div
                  className="n"
                  style={{
                    fontFamily: "var(--serif)",
                    fontWeight: 300,
                    fontSize: "clamp(34px,4vw,52px)",
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(247,243,238,.55)",
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {t(stat.labelKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className={styles.featured}>
          <div className="wrap">
            <Reveal as="div" className={styles.featLabel}>
              {t("community:changemakers.featured.label")}
            </Reveal>
            <Reveal as="div" className={styles.featCard}>
              <ImageSlot
                tint={featured.tint}
                src={featured.image}
                width="100%"
                height="100%"
                radius={0}
                placeholder={featured.name}
                initials={featured.initials}
              />
              <div className={styles.featBody}>
                <div className={styles.featCause}>{featured.cause}</div>
                <div className={styles.featName}>{featured.name}</div>
                <p className={styles.featBio}>{featured.summary}</p>
                <div className={styles.impact}>
                  {featured.impact.map((row) => (
                    <div key={row} className={styles.impactRow}>
                      {row}
                    </div>
                  ))}
                </div>
                <div className={styles.featFoot}>
                  <Button to={`/changemaker/${featured.slug}`}>
                    {t("community:changemakers.featured.readStoryCta")}{" "}
                    <FiArrowRight aria-hidden />
                  </Button>
                  <Button variant="ghost" onClick={() => openConnect()}>
                    {t("community:changemakers.featured.connectCta")}
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className={styles.profiles}>
        <div className="wrap">
          {!loading && makers.length === 0 ? (
            <EmptyState
              icon={<FiHeart />}
              title={t("community:changemakers.empty.title")}
              description={t("community:changemakers.empty.description")}
            />
          ) : (
            <div className={styles.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <MakerCardSkeleton key={index} />
                  ))
                : makers.map((maker, index) => (
                    <FadeIn
                      as={Link}
                      to={`/changemaker/${maker.slug}`}
                      key={maker.name}
                      className={styles.card}
                      delay={Math.min(index, 8) * 60}
                    >
                      <ImageSlot
                        tint={maker.tint}
                        src={maker.image}
                        width="100%"
                        height={180}
                        radius={0}
                        placeholder={maker.name}
                        initials={maker.initials}
                      />
                      <div className={styles.cardBody}>
                        <div className={styles.cardCause}>{maker.cause}</div>
                        <div className={styles.cardName}>{maker.name}</div>
                        <p className={styles.cardBio}>{maker.summary}</p>
                        <div className={styles.cardTags}>
                          {maker.tags.map((tag) => (
                            <span key={tag} className={styles.cardTag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.cardFoot}>
                        <span className={styles.read}>
                          {t("community:changemakers.card.readMoreCta")}{" "}
                          <FiArrowRight aria-hidden />
                        </span>
                      </div>
                    </FadeIn>
                  ))}
            </div>
          )}
        </div>
      </section>

      <NominateChangemakerSection />
    </PageShell>
  );
}
