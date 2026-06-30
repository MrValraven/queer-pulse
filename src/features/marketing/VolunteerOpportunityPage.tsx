import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import {
  VOLUNTEER_OPPORTUNITIES,
  getOpportunity,
} from "./volunteerOpportunities";
import styles from "./VolunteerOpportunityPage.module.css";

const MEMBER = routes.members;
const MESSAGES = routes.messages;
const PARTNER = routes.partner;
const DONATE = routes.donate;

const Tick = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function VolunteerOpportunityPage() {
  const { slug } = useParams();
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const apply = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplied(true);
    }, 900);
  };

  const opp = getOpportunity(slug);
  if (!opp) return <Navigate to={routes.volunteer} replace />;

  const alternatives = VOLUNTEER_OPPORTUNITIES.filter(
    (o) => o.slug !== opp.slug,
  ).slice(0, 3);

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={routes.volunteer} className={styles.back}>
          ← All volunteer opportunities
        </Link>

        <header className={styles.head}>
          <div className={styles.eyebrow}>
            <span>{opp.eyebrow}</span>
            <span className={styles.sep}>·</span>
            <span className={styles.urgent}>{opp.urgent}</span>
          </div>
          <h1 className={styles.h1}>
            {opp.titleLead}
            <em>{opp.titleEm}</em>
          </h1>
          <p className={styles.sub}>{opp.sub}</p>
          <div className={styles.meta}>
            {opp.stats.map((stat, i) => (
              <span key={i}>
                {stat.value}
                {stat.label}
              </span>
            ))}
          </div>
        </header>

        <div className={styles.grid}>
          <main>
            <section className={styles.sec}>
              <h2>
                Why this role <em>matters</em>
              </h2>
              {opp.why.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>

            <section className={styles.sec}>
              <h2>
                What you'll <em>actually do</em>
              </h2>
              <div className={styles.tasks}>
                {opp.tasks.map((t) => (
                  <div className={styles.taskRow} key={t.title}>
                    <div className={styles.taskIc}>
                      <Tick />
                    </div>
                    <div>
                      <b>{t.title}</b>
                      <span>{t.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sec}>
              <h2>
                The <em>commitment</em>, honestly
              </h2>
              <div className={styles.commitGrid}>
                {opp.commitments.map((c) => (
                  <div className={styles.commit} key={c.b}>
                    <b>{c.b}</b>
                    <span>{c.s}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.sec}>
              <h2>
                Who's <em>good for this</em>
              </h2>
              {opp.goodFor.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>

            <section className={styles.sec}>
              <h2>
                Who's <em>already in</em>
              </h2>
              <p className={styles.teamIntro}>{opp.teamIntro}</p>
              <div className={styles.teamRow}>
                {opp.team.map((m) => (
                  <Link to={MEMBER} className={styles.teamPill} key={m.name}>
                    <div
                      className={styles.av}
                      style={{ background: m.bg, color: m.color }}
                    >
                      {m.initials}
                    </div>
                    {m.name}
                  </Link>
                ))}
              </div>
            </section>
          </main>

          <aside className={styles.side}>
            {applied ? (
              <FadeIn className={styles.appliedCard}>
                <div className={styles.appliedIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--jade-soft)"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className={styles.appliedTitle}>
                  You're <em>on the list.</em>
                </div>
                <p className={styles.appliedText}>{opp.applyConfirm}</p>
                <Button
                  variant="ghost-dark"
                  className={styles.ctaBtn}
                  to={MESSAGES}
                >
                  Message the team
                </Button>
              </FadeIn>
            ) : (
              <div className={styles.card}>
                <div className={styles.applyHead}>
                  <h4>Apply</h4>
                  <div className={styles.role}>{opp.applyRole}</div>
                </div>
                <div className={styles.spotsRow}>
                  <span>Spots filled</span>
                  <b>{opp.spotsFilled}</b>
                </div>
                <div className={styles.spotsBar}>
                  <span style={{ width: `${opp.spotsPct}%` }} />
                </div>
                {opp.spots.map((r) => (
                  <div className={styles.spotsRow} key={r.label}>
                    <span>{r.label}</span>
                    {r.value}
                  </div>
                ))}
                <div className={styles.cta}>
                  <Button
                    variant="primary"
                    className={styles.ctaBtn}
                    onClick={apply}
                    disabled={submitting}
                    aria-busy={submitting}
                  >
                    {submitting ? "Sending your application…" : "Apply →"}
                  </Button>
                  <Button
                    variant="ghost"
                    className={styles.ctaBtn}
                    to={MESSAGES}
                  >
                    Ask the team
                  </Button>
                </div>
                <p className={styles.footNote}>
                  Returning volunteers:{" "}
                  <Link to={MEMBER}>use last year's profile →</Link> · skips the
                  screen.
                </p>
              </div>
            )}

            {opp.partner && (
              <div className={styles.card}>
                <div className={styles.cardLabel}>In partnership with</div>
                <span className={styles.partnerPill}>{opp.partner.name}</span>
                <p className={styles.partnerText}>{opp.partner.text}</p>
                <Link to={PARTNER} className={styles.partnerLink}>
                  About the partnership →
                </Link>
              </div>
            )}

            <div className={styles.card}>
              <div className={styles.cardLabel}>Not the right fit?</div>
              <p className={styles.altText}>Other ways to help right now:</p>
              <div className={styles.altList}>
                {alternatives.map((a) => (
                  <Link
                    key={a.slug}
                    to={`${routes.volunteer}/opportunity/${a.slug}`}
                  >
                    → {a.role} · {a.org}
                  </Link>
                ))}
                <Link to={DONATE}>→ Fund this work instead</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
