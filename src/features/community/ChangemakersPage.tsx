import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  ImageSlot,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useConnect } from "../../app/providers/ConnectProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NominateChangemakerSection } from "./NominateChangemakerSection";
import { CHANGEMAKERS } from "./changemakerStories";
import styles from "./ChangemakersPage.module.css";

const STATS = [
  { n: "34", labelKey: "community:changemakers.stat.profiled" },
  { n: "6", labelKey: "community:changemakers.stat.causeAreas" },
  { n: "1.2k", labelKey: "community:changemakers.stat.peopleHelped" },
  { n: "12", labelKey: "community:changemakers.stat.activeCampaigns" },
];

const FEATURED = CHANGEMAKERS[0]!;
const MAKERS = CHANGEMAKERS.slice(1);

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
  const loading = useSimulatedLoad();
  const { openConnect } = useConnect();
  const { t } = useTranslation();

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
            {STATS.map((s, i) => (
              <Reveal
                as="div"
                key={s.labelKey}
                className={styles.stat}
                delay={160 + i * 60}
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
                  {s.n}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(247,243,238,.55)",
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  {t(s.labelKey)}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className="wrap">
          <Reveal as="div" className={styles.featLabel}>
            {t("community:changemakers.featured.label")}
          </Reveal>
          <Reveal as="div" className={styles.featCard}>
            <ImageSlot
              tint={FEATURED.tint}
              src={FEATURED.image}
              width="100%"
              height="100%"
              radius={0}
              placeholder={FEATURED.name}
              initials={FEATURED.initials}
            />
            <div className={styles.featBody}>
              <div className={styles.featCause}>{FEATURED.cause}</div>
              <div className={styles.featName}>{FEATURED.name}</div>
              <p className={styles.featBio}>{FEATURED.summary}</p>
              <div className={styles.impact}>
                {FEATURED.impact.map((row) => (
                  <div key={row} className={styles.impactRow}>
                    {row}
                  </div>
                ))}
              </div>
              <div className={styles.featFoot}>
                <Button to={`/changemaker/${FEATURED.slug}`}>
                  {t("community:changemakers.featured.readStoryCta")}
                </Button>
                <Button variant="ghost" onClick={() => openConnect()}>
                  {t("community:changemakers.featured.connectCta")}
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.profiles}>
        <div className="wrap">
          {!loading && MAKERS.length === 0 ? (
            <EmptyState
              icon={<FiHeart />}
              title={t("community:changemakers.empty.title")}
              description={t("community:changemakers.empty.description")}
            />
          ) : (
            <div className={styles.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <MakerCardSkeleton key={i} />
                  ))
                : MAKERS.map((m, i) => (
                    <FadeIn
                      as={Link}
                      to={`/changemaker/${m.slug}`}
                      key={m.name}
                      className={styles.card}
                      delay={Math.min(i, 8) * 60}
                    >
                      <ImageSlot
                        tint={m.tint}
                        src={m.image}
                        width="100%"
                        height={180}
                        radius={0}
                        placeholder={m.name}
                        initials={m.initials}
                      />
                      <div className={styles.cardBody}>
                        <div className={styles.cardCause}>{m.cause}</div>
                        <div className={styles.cardName}>{m.name}</div>
                        <p className={styles.cardBio}>{m.summary}</p>
                        <div className={styles.cardTags}>
                          {m.tags.map((t) => (
                            <span key={t} className={styles.cardTag}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.cardFoot}>
                        <span className={styles.read}>
                          {t("community:changemakers.card.readMoreCta")}
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
