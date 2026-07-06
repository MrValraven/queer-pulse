import { FiCheck, FiTrendingUp } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, SkeletonCard, SubpageIndex } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { BuildingCard, PlannedCard, ShippedCard } from "./RoadmapCards";
import { HowWeDecide, SubmitIdea, TopIdeas } from "./RoadmapSections";
import { BUILDING, HERO_STATS, PLANNED, SHIPPED } from "./roadmap.data";
import styles from "./RoadmapPage.module.css";

export function RoadmapPage() {
  const loading = useSimulatedLoad();

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>What we're building</div>
          <h1 className={styles.heroTitle}>
            The <em>roadmap</em>
          </h1>
          <p className={styles.heroSub}>
            QueerPulse is built by a small team in Lisbon. Here's what we're
            working on, what's shipped, and what you can vote on next.
          </p>
          <div className={styles.heroStats}>
            {HERO_STATS.map((s) => (
              <span
                key={s.label}
                className={`${styles.statChip} ${s.jade ? styles.jade : ""}`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.kanban}>
            <section className={styles.col}>
              <div className={styles.colHeader}>
                <span className={`${styles.colChip} ${styles.shipped}`}>
                  <FiCheck aria-hidden /> Done
                </span>
              </div>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : SHIPPED.map((item, i) => (
                    <FadeIn key={item.name} delay={i * 60}>
                      <ShippedCard item={item} />
                    </FadeIn>
                  ))}
            </section>

            <section className={styles.col}>
              <div className={styles.colHeader}>
                <span className={`${styles.colChip} ${styles.building}`}>
                  <span className={styles.pulseDot} aria-hidden /> Building now
                </span>
              </div>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : BUILDING.map((item, i) => (
                    <FadeIn key={item.name} delay={i * 60}>
                      <BuildingCard item={item} />
                    </FadeIn>
                  ))}
            </section>

            <section className={styles.col}>
              <div className={styles.colHeader}>
                <span className={`${styles.colChip} ${styles.planned}`}>
                  <FiTrendingUp aria-hidden /> Planned
                </span>
              </div>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : PLANNED.map((item, i) => (
                    <FadeIn key={item.id} delay={i * 60}>
                      <PlannedCard item={item} />
                    </FadeIn>
                  ))}
            </section>
          </div>

          <section className={styles.shapeSection}>
            <h2 className={styles.sectionHead}>
              Have an <em>idea?</em>
            </h2>
            <p className={styles.sectionSub}>
              We read every suggestion. The most-voted ideas move up the
              roadmap.
            </p>
            <div className={styles.shapeGrid}>
              <SubmitIdea />
              <TopIdeas />
            </div>
          </section>

          <HowWeDecide />
        </div>
      </div>

      <SubpageIndex
        title="Already shipped"
        items={[
          {
            label: "Changelog",
            to: routes.changelog,
            blurb: "Every release, dated — what we've shipped so far.",
          },
        ]}
      />
    </PageShell>
  );
}
