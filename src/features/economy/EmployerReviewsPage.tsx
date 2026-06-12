import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import styles from "./EmployerReviewsPage.module.css";
import { Button, Outro } from '../../shared/components/ui'

const INVITE = routes.invite;

const HOW = [
  { n: "01", title: "Write anonymously", desc: "Your identity is never attached to your review. We verify you're a member — nothing else is logged." },
  { n: "02", title: "Rate what matters", desc: "Safety to be out, management awareness, trans inclusion, HR responsiveness, and culture vs. stated values." },
  { n: "03", title: "Help the next person", desc: "Your review helps other queer people make better choices about where they take their talent and their whole selves." },
];

interface Bar {
  label: string;
  pct: number;
  score: string;
  accent?: boolean;
}
interface Company {
  av: string;
  avBg: string;
  avColor: string;
  name: string;
  industry: string;
  score: string;
  scoreColor?: string;
  bars: Bar[];
  quote: string;
  meta: string[];
}
const COMPANIES: Company[] = [
  { av: "LX", avBg: "rgba(74,140,111,.15)", avColor: "var(--jade)", name: "Lisbon Tech Hub", industry: "Technology · 200–500 employees", score: "7.8", bars: [{ label: "Safe to be out", pct: 82, score: "8.2" }, { label: "Trans inclusion", pct: 72, score: "7.2", accent: true }, { label: "HR awareness", pct: 78, score: "7.8" }], quote: '"Generally good. The team is fine — leadership is still catching up. They have an ERG but it needs more budget and teeth."', meta: ["14 reviews", "Last updated 2 weeks ago"] },
  { av: "NV", avBg: "rgba(45,27,61,.1)", avColor: "var(--plum)", name: "Nova Ventures", industry: "Finance · 50–200 employees", score: "4.3", scoreColor: "var(--accent-ink)", bars: [{ label: "Safe to be out", pct: 40, score: "4.0", accent: true }, { label: "Trans inclusion", pct: 28, score: "2.8", accent: true }, { label: "HR awareness", pct: 52, score: "5.2", accent: true }], quote: '"Pride month branding. Zero follow-through. I was out for two years and not once did a manager acknowledge it in any way that felt real."', meta: ["8 reviews", "Last updated 1 month ago"] },
  { av: "MC", avBg: "rgba(74,140,111,.12)", avColor: "var(--jade)", name: "Marvila Creative", industry: "Creative agency · 20–50 employees", score: "9.1", bars: [{ label: "Safe to be out", pct: 94, score: "9.4" }, { label: "Trans inclusion", pct: 90, score: "9.0" }, { label: "HR awareness", pct: 88, score: "8.8" }], quote: '"Genuinely queer-led culture. My pronouns were on my contract. No one made a big deal of it — it was just how it worked there."', meta: ["6 reviews", "Last updated 3 weeks ago"] },
];

const RULES = [
  "Reviews are anonymous — your name is never attached",
  "We verify you're a QueerPulse member, nothing more",
  "Employers cannot edit, remove, or respond to reviews",
  "We moderate for factual accuracy, not for comfort",
  "You can update or retract your review at any time",
  "No company can buy a higher rating or featured placement",
];

export function EmployerReviewsPage() {
  const { showToast } = useToast();

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>
            <span className={styles.live} />
            Employer Reviews
          </div>
          <h1>
            Is your workplace <em>actually safe?</em>
          </h1>
          <p className={styles.lead}>
            Anonymous reviews of Lisbon companies by LGBTQ+ employees. Beyond the Pride
            logo — what it's actually like to be out there, behind closed office doors.
          </p>
        </div>
      </header>

      <section className={styles.howSection}>
        <div className="wrap">
          <div className={styles.secHead}>
            <div>
              <h2>
                How it <em>works</em>
              </h2>
              <div className={styles.sub}>
                Anonymous, verified by membership, not editable by employers.
              </div>
            </div>
          </div>
          <div className={styles.howGrid}>
            {HOW.map((h) => (
              <div className={styles.howItem} key={h.n}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howDesc}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.reviewsSection}>
        <div className="wrap">
          <div className={styles.secHead}>
            <div>
              <h2>
                Recent <em>reviews</em>
              </h2>
              <div className={styles.sub}>
                Member-written · anonymous · updated continuously
              </div>
            </div>
            <Button href="#write" variant="ghost">
              Write a review →
            </Button>
          </div>
          <div className={styles.companyGrid}>
            {COMPANIES.map((c) => (
              <div className={styles.companyCard} key={c.name}>
                <div className={styles.coTop}>
                  <div className={styles.coAv} style={{ background: c.avBg, color: c.avColor }}>
                    {c.av}
                  </div>
                  <div style={{ flex: 1, paddingLeft: 14 }}>
                    <div className={styles.coName}>{c.name}</div>
                    <div className={styles.coIndustry}>{c.industry}</div>
                  </div>
                  <div className={styles.coScore}>
                    <div className={styles.coNum} style={c.scoreColor ? { color: c.scoreColor } : undefined}>
                      {c.score}
                    </div>
                    <div className={styles.coLabel}>/ 10</div>
                  </div>
                </div>
                <div className={styles.coBars}>
                  {c.bars.map((b) => (
                    <div className={styles.barRow} key={b.label}>
                      <span className={styles.barLabel}>{b.label}</span>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${b.pct}%`, background: b.accent ? "var(--accent)" : undefined }}
                        />
                      </div>
                      <span>{b.score}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.coQuote}>{c.quote}</div>
                <div className={styles.coMeta}>
                  {c.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <div className={styles.coFoot}>
                  <Button type="button" variant="ghost" className={styles.coBtn} onClick={() => showToast("Opening reviews…", "info")}>
                    Read all reviews
                  </Button>
                  <Button href="#write" variant="ghost" className={styles.coBtn}>
                    Write a review
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.writeBox} id="write">
            <div>
              <h2>
                Write a <em>review.</em>
              </h2>
              <p>
                You've been there. You know what it was actually like. Your review helps
                the next queer person decide whether to take that interview. It takes 5
                minutes and is completely anonymous.
              </p>
              <Button to={INVITE} variant="primary" className={styles.writeBtn}>
                Write a review →
              </Button>
              <div className={styles.writeNote}>
                Members only · anonymous · your identity is never stored with your review
              </div>
            </div>
            <div className={styles.writeRules}>
              <div className={styles.rulesTitle}>Our review principles</div>
              {RULES.map((r) => (
                <div className={styles.rule} key={r}>
                  <div className={styles.ruleDot} />
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Outro
        title={<>Your work <em>matters.</em></>}
        sub="You deserve to know what you're walking into. So does everyone else."
      >
        <Button to={INVITE} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  );
}
