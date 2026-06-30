import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./WorldAidsDayPage.module.css";
import {
  Button,
  FadeIn,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import {
  useSimulatedLoad,
  useCountUp,
  useScrollReveal,
} from "../../shared/hooks";

const LEGAL = routes.legal;
const GATHERING = routes.gathering;
const DIRECTORY = routes.directory;

// Numeric targets separated from decorative markup so useCountUp can animate them.
const STATS = [
  {
    lbl: "New diagnoses · 2024",
    num: 820,
    fmt: (n: number) => <em>{n}</em>,
    p: "Down 34% from a decade ago · still ~2 per day",
  },
  {
    lbl: "People living with HIV in PT",
    num: 47,
    fmt: (n: number) => (
      <>
        ~ {n}
        <em>k</em>
      </>
    ),
    p: "97% diagnosed · 95% on treatment · 93% U=U",
  },
  {
    lbl: "PrEP users · prescribed",
    num: 124,
    fmt: (n: number) => (
      <>
        <em>{(n / 10).toFixed(1)}</em>k
      </>
    ),
    p: "Up 18% YoY · still well below estimated need",
  },
  {
    lbl: 'Of new diagnoses · "late presenters"',
    num: 42,
    fmt: (n: number) => (
      <>
        {Math.floor(n / 10)}
        <em>{n % 10}</em>%
      </>
    ),
    p: "Diagnosed late — the stat that keeps people awake",
  },
];

const UNDO: {
  n: React.ReactNode;
  h: React.ReactNode;
  body: React.ReactNode;
}[] = [
  {
    n: (
      <>
        0<em>1</em>
      </>
    ),
    h: (
      <>
        Free, anonymous, in-community <em>testing</em>
      </>
    ),
    body: (
      <>
        The SNS test is free but mandates ID. CheckpointLX is the gold standard
        but its hours and locations leave gaps.{" "}
        <strong>
          We want one walk-in, anonymous, member-supported testing slot per
          Lisbon neighbourhood, monthly.
        </strong>{" "}
        Café Beirão already volunteered the back room.{" "}
        <em>We are waiting on funding sign-off.</em>
      </>
    ),
  },
  {
    n: (
      <>
        0<em>2</em>
      </>
    ),
    h: (
      <>
        PrEP access for <em>everyone who would benefit</em>
      </>
    ),
    body: (
      <>
        PrEP is on the SNS since 2018. But it's still effectively gated by GP
        relationships, awkward conversations, and clinics that don't know they
        can prescribe it.{" "}
        <strong>
          Anyone, any age, who would benefit should be able to get a 90-day
          script in &lt; 14 days from any GP.
        </strong>{" "}
        Right now the average is 6 weeks.
      </>
    ),
  },
  {
    n: (
      <>
        0<em>3</em>
      </>
    ),
    h: (
      <>
        End the <em>employer disclosure asks</em>
      </>
    ),
    body: (
      <>
        HIV status is medical-confidential under EU and Portuguese law.{" "}
        <em>But it is still routinely asked</em> in employment paperwork,
        insurance forms, and travel documents.{" "}
        <strong>
          Disclosure should be voluntary, always, with no penalty for declining.
        </strong>{" "}
        ILGA Portugal's casework team handles ~40 of these incidents per year.{" "}
        <Link to={LEGAL}>Read our legal guide →</Link>
      </>
    ),
  },
];

// StatCell animates its number once the stats section scrolls into view.
// The `active` + `isVisible` wiring is handled by the parent via a shared ref.
function StatCell({
  stat,
  active,
}: {
  stat: (typeof STATS)[0];
  active: boolean;
}) {
  const count = useCountUp(stat.num, { active, durationMs: 1200 });
  return (
    <div className={styles.stat}>
      <div className={styles.lbl}>{stat.lbl}</div>
      <b>{stat.fmt(count)}</b>
      <p>{stat.p}</p>
    </div>
  );
}

function TestedSkeleton() {
  return (
    <div
      className={styles.testedCard}
      aria-hidden
      style={{ pointerEvents: "none" }}
    >
      <SkeletonLine width={140} height={11} />
      <SkeletonLine width="75%" height={22} style={{ marginTop: 6 }} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13} style={{ marginTop: 4 }} />
        <SkeletonLine width="90%" height={13} style={{ marginTop: 6 }} />
        <SkeletonLine width="70%" height={13} style={{ marginTop: 6 }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 12,
          borderTop: "1px solid rgba(45,27,61,.07)",
        }}
      >
        <SkeletonLine width={110} height={12} />
        <SkeletonLine width={70} height={12} />
      </div>
    </div>
  );
}

const TESTED: {
  tag: string;
  free?: boolean;
  name: React.ReactNode;
  d: React.ReactNode;
  metaL: string;
  metaR: string;
}[] = [
  {
    tag: "Free · no ID · today",
    free: true,
    name: (
      <>
        Open clinic night · <em>HIV / STI testing</em>
      </>
    ),
    d: (
      <>
        Café Beirão back room · Thursday 19:00–21:00. Rapid finger-prick +
        counsellor. <b>22 slots</b>, walk in. The pharmacist on site can
        prescribe PrEP next-day.
      </>
    ),
    metaL: "Hosted by Trans Hub",
    metaR: "This Thu",
  },
  {
    tag: "Free · partly anonymous",
    free: true,
    name: (
      <>
        CheckpointLX · <em>Mouraria</em>
      </>
    ),
    d: (
      <>
        The gold-standard community testing centre · R. da Mouraria 1A.{" "}
        <b>Mon–Sat</b>, walk in, peer counsellors. Counsel + test + result in
        ~45 min.
      </>
    ),
    metaL: "Partner since 2024",
    metaR: "5 days/week",
  },
  {
    tag: "Free · SNS · with health card",
    name: (
      <>
        USF Sé · <em>Dr. Hugo Marques</em>
      </>
    ),
    d: (
      <>
        Public-system, somewhat slower, but{" "}
        <b>genuinely affirming and complete</b> — covers full STI panel + PrEP
        eligibility in one visit. Book ahead, 2-3 week wait typical.
      </>
    ),
    metaL: "Vetted by 12 members",
    metaR: "By appointment",
  },
];

export function WorldAidsDayPage() {
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const { ref: statsRef, isVisible: statsVisible } =
    useScrollReveal<HTMLElement>();

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              1 December · World AIDS Day · Lisbon
            </div>
            <h1 className={styles.h1}>
              Forty <em>years.</em> Still here. <em>Still working.</em>
            </h1>
            <p className={styles.dek}>
              Today is not about a ribbon. It is about <em>what changed,</em>{" "}
              what didn't, and what we owe the people who carried this through
              forty years of public neglect. <b>Treatment is prevention.</b>{" "}
              Testing is free. The clinic is open. And the names we read aloud
              at the Memorial tonight are{" "}
              <em>longer than the bus to get there.</em>
            </p>
          </div>
        </section>

        <section className={styles.lede}>
          <div className={styles.ledeInner}>
            <div>
              <div className={styles.ledeStat}>
                <em>U=U</em>
              </div>
              <div className={styles.ledeStatL}>
                Undetectable = Untransmittable · the science, settled since 2017
              </div>
            </div>
            <div className={styles.ledeExplain}>
              <p>
                If you are HIV-positive and your viral load is consistently
                undetectable on treatment,{" "}
                <strong>you cannot transmit the virus through sex.</strong> This
                has been established beyond doubt for nearly a decade. It is not
                in dispute among clinicians.
              </p>
              <p>
                It is, however, <em>still routinely contradicted</em> by
                parents, by ex-partners, by HR departments, by border officials,
                by some doctors. So we say it again, in the largest type we
                have:
              </p>
            </div>
          </div>
        </section>

        <section className={styles.statsSection} ref={statsRef}>
          <h2>
            Where we stand · <em>Portugal, 2025</em>
          </h2>
          <p className={styles.sub}>
            Latest published data from Direção-Geral da Saúde and the Casa da
            Cidadania. <em>Linked sources at the bottom.</em>
          </p>
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <StatCell key={i} stat={s} active={statsVisible} />
            ))}
          </div>
        </section>

        <Reveal as="section" className={styles.undoSection}>
          <div className={styles.undoInner}>
            <div className={styles.undoKicker}>What we want · in 2026</div>
            <h2 className={styles.undoH}>
              Three things that <em>haven't yet changed.</em>
            </h2>
            <p className={styles.undoLead}>
              Concrete. Specific. We have been asking for these for two years.
              We will keep asking next year.
            </p>
            <div className={styles.undoList}>
              {UNDO.map((u, i) => (
                <Reveal
                  as="div"
                  className={styles.undoRow}
                  key={i}
                  delay={i * 80}
                >
                  <div className={styles.undoN}>{u.n}</div>
                  <div>
                    <h3>{u.h}</h3>
                    <p>{u.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className={styles.tested}>
          <div className={styles.testedInner}>
            <h2>
              Get tested · <em>this week in Lisbon</em>
            </h2>
            <p className={styles.sub}>
              Three vetted places, three different formats. Pick whichever fits
              the day.
            </p>
            <div className={styles.testedGrid}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TestedSkeleton key={i} />
                  ))
                : TESTED.map((t, i) => (
                    <FadeIn key={t.metaL} delay={Math.min(i, 8) * 60}>
                      <Link to={DIRECTORY} className={styles.testedCard}>
                        <div
                          className={[
                            styles.testedTag,
                            t.free && styles.testedTagFree,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {t.tag}
                        </div>
                        <div className={styles.testedName}>{t.name}</div>
                        <p className={styles.testedD}>{t.d}</p>
                        <div className={styles.testedMeta}>
                          <span>{t.metaL}</span>
                          <b>{t.metaR}</b>
                        </div>
                      </Link>
                    </FadeIn>
                  ))}
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className={styles.memory}>
          <div className={styles.memoryInner}>
            <div className={styles.memoryKicker}>
              Tonight · 19:00 · Praça das Flores
            </div>
            <h2>
              For everyone who didn't <em>get</em> the medication, in time.
            </h2>
            <p>
              Lisbon's quiet annual reading. <b>Forty minutes long</b>, in a
              small square, with the names of community members who died — of
              AIDS-related causes, of overdoses through the long emergency, of
              being denied care. Read out, twice, in Portuguese and English.{" "}
              <em>No speeches afterwards.</em>
            </p>
            <p>
              If you're new to the community and don't know names, that's okay —
              you can come and listen. People do.
            </p>
            <div className={styles.memoryCta}>
              <div className={styles.memoryActions}>
                <Button to={GATHERING} variant="primary">
                  RSVP to the reading
                </Button>
                <Button to={GATHERING} variant="ghost-dark">
                  Visit the memorial wall
                </Button>
                <Button to={routes.requestInvite} variant="ghost-dark">
                  Fund the testing programme
                </Button>
              </div>
            </div>
          </div>
        </Reveal>

        <div className={styles.ptNote}>
          <em>Esta página existe também em português</em> ·{" "}
          <button type="button" onClick={() => showToast("PT version", "info")}>
            Ver versão em PT →
          </button>
          <br />
          Sources: DGS · CheckpointLX · UNAIDS Portugal country profile · ILGA
          Portugal Anti-Discrimination Report 2025
        </div>
      </div>
    </PageShell>
  );
}
