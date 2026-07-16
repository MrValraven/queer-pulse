import { PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  ImageSlot,
  Reveal,
  SectionHead,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { FEATURED, ARCHIVE_CARDS, ORAL_QUOTES } from "./archive.data";
import styles from "./ArchivePage.module.css";

function ArchiveCardSkeleton() {
  // Mirrors the real .card: 220px image, then year / quote / desc / by-line.
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width="100%" height={220} style={{ borderRadius: 0 }} />
      <div className={styles.cardBody}>
        <SkeletonLine width={96} height={11} />
        <SkeletonLine width="90%" height={20} style={{ marginTop: 4 }} />
        <SkeletonLine width="100%" height={14} style={{ marginTop: 4 }} />
        <SkeletonLine width="80%" height={14} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 6,
          }}
        >
          <SkeletonLine width={36} height={36} style={{ borderRadius: 999 }} />
          <SkeletonLine width="45%" height={14} />
        </div>
      </div>
    </div>
  );
}

export function ArchivePage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            {t("marketing:archive.hero.category")}
          </Reveal>
          <Reveal as="h1" delay={60}>
            <Translation
              i18nKey="marketing:archive.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.heroSub} delay={120}>
            {t("marketing:archive.hero.sub")}
          </Reveal>
        </div>
      </div>

      <section className={styles.featured}>
        <div className="wrap">
          <Reveal as="div" className={styles.featLabel}>
            {t("marketing:archive.featured.label")}
          </Reveal>
          <Reveal as="div" className={styles.featStory} delay={60}>
            <ImageSlot
              tint={FEATURED.imgTint}
              src={FEATURED.image}
              height={480}
              radius={0}
              placeholder="Portrait or scene for the featured story"
            />
            <div className={styles.featBody}>
              <div className={styles.featQuote}>{FEATURED.quote}</div>
              <div className={styles.featBy}>
                <div
                  className={styles.featAv}
                  style={{ background: FEATURED.avBg, color: FEATURED.avColor }}
                >
                  {FEATURED.initials}
                </div>
                <div>
                  <div className={styles.featName}>{FEATURED.name}</div>
                  <div className={styles.featRole}>{FEATURED.role}</div>
                </div>
              </div>
              <p className={styles.featExcerpt}>{FEATURED.excerpt}</p>
              <Button
                to={routes.story}
                variant="ghost"
                style={{ alignSelf: "flex-start" }}
              >
                {t("marketing:archive.featured.readCta")}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className={styles.gridSec}>
        <div className="wrap">
          <Reveal>
            <SectionHead
              title={
                <Translation
                  i18nKey="marketing:archive.grid.title"
                  components={{ em: <em /> }}
                />
              }
              subtitle={t("marketing:archive.grid.sub")}
            />
          </Reveal>
          <div className={styles.grid}>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <ArchiveCardSkeleton key={i} />
              ))}
            {!loading &&
              ARCHIVE_CARDS.map((c, i) => (
                <FadeIn
                  as="div"
                  key={c.id}
                  className={styles.card}
                  delay={Math.min(i, 8) * 60}
                >
                  <ImageSlot
                    tint={c.imgTint}
                    src={c.image}
                    height={220}
                    radius={0}
                    placeholder={`Archive · ${c.name}`}
                  />
                  <div className={styles.cardBody}>
                    <div className={styles.acYear}>{c.year}</div>
                    <div className={styles.acQuote}>{c.quote}</div>
                    <p className={styles.acDesc}>{c.desc}</p>
                    <div className={styles.acBy}>
                      <div
                        className={styles.acAv}
                        style={{ background: c.avBg, color: c.avColor }}
                      >
                        {c.initials}
                      </div>
                      <div>
                        <div className={styles.acName}>{c.name}</div>
                        <span className={styles.acMeta}>{c.meta}</span>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
          </div>
        </div>
      </section>

      <section className={styles.oral}>
        <div className="wrap">
          <Reveal as="div" className={styles.oralHead}>
            <h2 className={styles.oralH}>
              <Translation
                i18nKey="marketing:archive.oral.title"
                components={{ em: <em /> }}
              />
            </h2>
            <div className={styles.oralSub}>
              {t("marketing:archive.oral.sub")}
            </div>
          </Reveal>
          <div className={styles.oralGrid}>
            {ORAL_QUOTES.map((q, i) => (
              <Reveal
                as="div"
                key={q.name}
                className={styles.oralCard}
                delay={i * 70}
              >
                <div className={styles.ocName}>{q.name}</div>
                <div className={styles.ocRole}>{q.role}</div>
                <div className={styles.ocQuote}>{q.quote}</div>
                <div className={styles.ocYear}>{q.year}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.submit}>
        <div className="wrap">
          <Reveal as="div" className={styles.submitInner}>
            <h2>
              <Translation
                i18nKey="marketing:archive.submit.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>{t("marketing:archive.submit.body")}</p>
            <Button to={routes.contact} variant="primary" size="lg">
              {t("marketing:archive.submit.cta")}
            </Button>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
