import { Button, Reveal } from "../../shared/components/ui";
import {
  COOP_STATS,
  COOP_PHASES,
  FORMING_COOPS,
  COOP_TEMPLATES,
  COOP_RESOURCES,
  type FormingCoop,
} from "./housingCoop.data";
import styles from "./HousingCoopPage.module.css";

const FACE_TINT: Record<string, string | undefined> = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
};

/** Hero: headline + live formation stats card. */
export function CoopHero() {
  return (
    <section className={styles.hero}>
      <div className="wrap">
        <div className={styles.heroInner}>
          <div>
            <Reveal as="div" className={styles.eyebrow}>
              Housing co-op formation · Portugal-first, expandable
            </Reveal>
            <Reveal as="h1" className={styles.title} delay={60}>
              Build a co-op <em>together</em>.
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={120}>
              A toolkit for forming a queer housing co-operative in Portugal —
              from finding the people, through the legal incorporation, the
              financing, the property, the daily governance.{" "}
              <em>Five phases, real templates, members already in each one.</em>
            </Reveal>
          </div>
          <Reveal className={styles.statsCard} delay={160}>
            <div className={styles.statsHead}>Co-ops forming now</div>
            {COOP_STATS.map((s) => (
              <div className={styles.statRow} key={s.label}>
                <span className="k">{s.label}</span>
                <span className="v">
                  {s.value}
                  {s.em && <em>{s.em}</em>}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** The five-phase formation timeline. */
export function CoopPhases() {
  return (
    <section className={styles.phases}>
      <div className="wrap">
        <Reveal className={styles.sectionHead}>
          <h2>
            Five <em>phases</em> from idea to keys
          </h2>
          <p>
            Realistic timeline: 14–28 months. Each phase has templates, real
            examples from existing co-ops, and a mentor you can reach when
            stuck.
          </p>
        </Reveal>
        <div className={styles.phaseRail}>
          {COOP_PHASES.map((p, i) => (
            <Reveal className={styles.phase} key={p.num} delay={i * 60}>
              <div className={styles.phaseNum}>{p.num}</div>
              <div className={styles.phaseName}>
                {p.name} <em>{p.nameEm}</em>
              </div>
              <div className={styles.phaseTime}>{p.time}</div>
              <div className={styles.phaseDesc}>{p.desc}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** One co-op card in the "forming now" grid. */
function CoopCard({
  coop,
  onCta,
}: {
  coop: FormingCoop;
  onCta: (coop: FormingCoop) => void;
}) {
  return (
    <div className={styles.coopCard}>
      <div className={styles.ccHead}>
        <div>
          <div className={styles.ccTitle}>
            {coop.name} {coop.nameEm && <em>{coop.nameEm}</em>}
          </div>
          <div className={styles.ccLoc}>{coop.location}</div>
        </div>
        <span className={styles.ccPhase}>{coop.phaseLabel}</span>
      </div>
      <div className={styles.ccBody}>
        <div className={styles.ccProgress}>
          <div className={styles.ccBar}>
            <div
              className={`${styles.ccSeg} ${coop.operational ? styles.ccSegDone : ""}`}
              style={{ width: `${coop.progress}%` }}
            />
          </div>
          <div
            className={`${styles.ccStepLabel} ${coop.operational ? styles.ccStepLabelDone : ""}`}
          >
            {coop.operational ? (
              <>
                {coop.progressLabel} <em>{coop.progressEm}</em>
              </>
            ) : (
              <>
                <em>{coop.progressLabel}</em> through
              </>
            )}
          </div>
        </div>
        <div className={styles.ccDesc}>{coop.desc}</div>
        <div className={styles.ccMeta}>
          {coop.meta.map((m, i) => (
            <span key={m.label}>
              {i > 0 && <span aria-hidden>· </span>}
              {m.label} <em>{m.value}</em>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.ccFoot}>
        <div className={styles.avStack} aria-hidden>
          {coop.faces.map((f, i) => (
            <div className={`${styles.av} ${FACE_TINT[f.tint]}`} key={i}>
              {f.initials}
            </div>
          ))}
        </div>
        <Button
          variant={coop.cta.kind === "join" ? "primary" : "ghost"}
          onClick={() => onCta(coop)}
        >
          {coop.cta.label}
        </Button>
      </div>
    </div>
  );
}

/** The grid of co-ops currently forming or operational. */
export function CoopGrid({
  onCta,
  onSeeAll,
}: {
  onCta: (coop: FormingCoop) => void;
  onSeeAll: () => void;
}) {
  return (
    <section className={styles.active}>
      <div className="wrap">
        <div className={styles.actHead}>
          <h2>
            Co-ops <em>forming now</em>
          </h2>
          <button type="button" className={styles.all} onClick={onSeeAll}>
            All 8 →
          </button>
        </div>
        <div className={styles.coopGrid}>
          {FORMING_COOPS.map((coop) => (
            <CoopCard key={coop.id} coop={coop} onCta={onCta} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Downloadable formation templates. */
export function CoopTemplates({
  onDownload,
}: {
  onDownload: (name: string) => void;
}) {
  return (
    <section className={styles.templates}>
      <div className="wrap">
        <div className={styles.sectionHead}>
          <h2>
            Templates &amp; <em>tools</em>
          </h2>
          <p>
            Every document we wish someone had given us. Drafted with QueerPulse
            legal, translated PT &amp; EN, stress-tested by Casa Sambizanga's
            first two years.
          </p>
        </div>
        <div className={styles.tpGrid}>
          {COOP_TEMPLATES.map((t) => (
            <button
              type="button"
              className={styles.tpCard}
              key={`${t.name} ${t.nameEm}`}
              onClick={() => onDownload(`${t.name} ${t.nameEm}`)}
            >
              <div className={styles.tpTag}>{t.tag}</div>
              <div className={styles.tpName}>
                {t.name} <em>{t.nameEm}</em>
              </div>
              <div className={styles.tpMeta}>{t.meta}</div>
              <div className={styles.tpCta}>Download →</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing plum panel: start-a-co-op prompt + resources/mentors list. */
export function CoopStartCta({
  onPost,
  onStory,
}: {
  onPost: () => void;
  onStory: () => void;
}) {
  return (
    <section className={styles.startCta}>
      <div className="wrap">
        <div className={styles.scInner}>
          <div className={styles.scText}>
            <div className={styles.scEyebrow}>Start a co-op</div>
            <h2>
              Don't have <em>your people yet</em>?
            </h2>
            <p>
              Post that you're starting and we'll match you with other members
              in your city looking for the same thing. Most co-ops start with
              2–3 people and grow to 6+ over the first 6 months.{" "}
              <em>Casa Sambizanga started with three.</em>
            </p>
            <div className={styles.scActs}>
              <Button variant="primary" onClick={onPost}>
                Post that you're starting
              </Button>
              <Button variant="ghost-dark" onClick={onStory}>
                Read Casa Sambizanga's story
              </Button>
            </div>
          </div>
          <div className={styles.scResources}>
            <div className={styles.srHead}>Resources &amp; mentors</div>
            {COOP_RESOURCES.map((r, i) => (
              <div className={styles.srRow} key={i}>
                <span className={styles.srLabel}>
                  {r.pre}
                  {r.em && <em>{r.em}</em>}
                  {r.post}
                </span>
                <span className={styles.srMeta}>{r.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
