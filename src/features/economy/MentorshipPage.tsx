import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollLock } from "../../shared/hooks";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./MentorshipPage.module.css";
import { Button } from '../../shared/components/ui'

type Mode = "mentee" | "mentor";

const VOLUNTEER = linkToPath("QueerPulse Volunteer.html");

const STATS = [
  { n: "24", l: "Active mentors in the network" },
  { n: "38", l: "Matches made so far" },
  { n: "8", l: "Areas of focus" },
];

interface Mentor {
  initials: string;
  bg: string;
  color: string;
  name: string;
  role: string;
  areas: string[];
  cap: string;
  btn: string;
}
const MENTORS: Mentor[] = [
  { initials: "IT", bg: "rgba(232,119,90,.15)", color: "var(--accent-ink)", name: "Inês Tavares", role: "Graphic Designer", areas: ["Design career", "Freelancing", "Studio building"], cap: "1 open spot this quarter", btn: "Request a match" },
  { initials: "RM", bg: "rgba(45,27,61,.12)", color: "var(--plum)", name: "Rui Marçal", role: "Software Engineer", areas: ["Engineering career", "Junior to mid", "Open source"], cap: "2 open spots this quarter", btn: "Request a match" },
  { initials: "ML", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "Mariana Loução", role: "Clinical Psychologist", areas: ["Wellbeing at work", "Coming out professionally", "Identity"], cap: "Waitlist only right now", btn: "Join waitlist" },
  { initials: "CN", bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)", name: "Carla Nogueira", role: "Product Manager", areas: ["Product career", "Fintech", "Switching industries"], cap: "1 open spot this quarter", btn: "Request a match" },
  { initials: "SA", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "Sofia Andrade", role: "Documentary Filmmaker", areas: ["Filmmaking", "Creative practice", "Arts funding"], cap: "2 open spots this quarter", btn: "Request a match" },
  { initials: "RB", bg: "rgba(122,82,184,.12)", color: "#7A52B8", name: "Raquel Baptista", role: "Lawyer", areas: ["Legal career", "Rights navigation", "Advocacy"], cap: "1 open spot this quarter", btn: "Request a match" },
];

const MENTEE_AREAS = ["Career direction", "Coming out professionally", "Creative practice", "Starting a business", "Navigating a difficult workplace", "New to Lisbon", "Mental health at work", "Legal or rights issues"];
const MENTOR_AREAS = ["Career direction", "Coming out professionally", "Creative practice", "Starting a business", "Navigating a difficult workplace", "Settling in Lisbon", "Mental health at work", "Legal or rights navigation"];

function CheckGrid({ options }: { options: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  return (
    <div className={styles.mmCheckGrid}>
      {options.map((o) => (
        <label
          key={o}
          className={[styles.mmCheck, checked.has(o) && styles.mmCheckActive].filter(Boolean).join(" ")}
        >
          <input
            type="checkbox"
            checked={checked.has(o)}
            onChange={() =>
              setChecked((prev) => {
                const n = new Set(prev);
                if (n.has(o)) n.delete(o);
                else n.add(o);
                return n;
              })
            }
          />
          {o}
        </label>
      ))}
    </div>
  );
}

export function MentorshipPage() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState(1);
  useScrollLock(mode !== null);

  const total = mode === "mentee" ? 3 : 2;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;

  const open = (m: Mode) => {
    setMode(m);
    setStep(1);
  };
  const close = () => setMode(null);

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Mentorship</div>
          <h1>
            Someone ahead of you on the path <em>wants to help.</em>
          </h1>
          <p>
            Formal one-to-one mentorship matching between queer professionals in
            Lisbon. If you're finding it hard, someone in the network has been there.
            If you've made it through, you can give that back.
          </p>
          <div className={styles.stats}>
            {STATS.map((s) => (
              <div key={s.l}>
                <div className={styles.msN}>{s.n}</div>
                <div className={styles.msL}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className={styles.choose}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              What brings you <em>here?</em>
            </h2>
          </div>
          <div className={styles.chooseGrid}>
            <button type="button" className={styles.chooseCard} onClick={() => open("mentee")}>
              <div className={styles.ccIcon}>🌱</div>
              <div className={styles.ccTitle}>I'm looking for a mentor</div>
              <p className={styles.ccDesc}>
                You're navigating something — a career transition, a creative block,
                coming out professionally, a difficult workplace, a new city. You'd
                benefit from talking to someone who's been through it.
              </p>
              <div className={styles.ccFor}>
                For: anyone at any stage who could use some guidance →
              </div>
            </button>
            <button type="button" className={styles.chooseCard} onClick={() => open("mentor")}>
              <div className={styles.ccIcon}>🌳</div>
              <div className={styles.ccTitle}>I can be a mentor</div>
              <p className={styles.ccDesc}>
                You've been through enough to have something to offer. You don't need
                to be an expert — you just need to have navigated something that
                someone else is currently navigating.
              </p>
              <div className={styles.ccFor}>
                For: members with experience they're willing to share →
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.mentorsStrip}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Current mentors in <em>the network</em>
            </h2>
            <div className={styles.sub}>
              These members have opened themselves up to mentoring. You can request a
              match through the form above.
            </div>
          </div>
          <div className={styles.mentorGrid}>
            {MENTORS.map((m) => (
              <div className={styles.mentorCard} key={m.name}>
                <div className={styles.mcTop}>
                  <div className={styles.mcAv} style={{ background: m.bg, color: m.color }}>
                    {m.initials}
                  </div>
                  <div>
                    <div className={styles.mcName}>{m.name}</div>
                    <div className={styles.mcRole}>{m.role}</div>
                  </div>
                </div>
                <div className={styles.mcAreas}>
                  {m.areas.map((a) => (
                    <span key={a} className={styles.mcArea}>
                      {a}
                    </span>
                  ))}
                </div>
                <div className={styles.mcCap}>{m.cap}</div>
                <button type="button" className={styles.mcConnect} onClick={() => open("mentee")}>
                  {m.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Have something <em>to give?</em>
          </h2>
          <p className={styles.outroSub}>
            Mentorship is one way. Browse volunteer opportunities to find other ways to
            contribute to the community around you.
          </p>
          <Button to={VOLUNTEER} variant="primary" size="lg">
            See volunteer roles →
          </Button>
        </div>
      </section>

      {mode && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={styles.modal}>
            <button type="button" className={styles.modalClose} onClick={close}>
              ×
            </button>
            <div className={styles.mmBar}>
              <div className={styles.mmFill} style={{ width: `${fill}%` }} />
            </div>
            <div className={styles.mmLabel}>
              {done ? "Done!" : `Step ${step} of ${total}`}
            </div>

            {done ? (
              <div className={styles.mmSuccess}>
                <div className={styles.mmSuccessIcon}>{mode === "mentee" ? "🌱" : "🌳"}</div>
                <div className={styles.mmTitle} style={{ fontSize: 24 }}>
                  {mode === "mentee" ? "Request received." : "Thank you."}
                </div>
                <p className={styles.mmDesc}>
                  {mode === "mentee"
                    ? "We'll review your request and send you a match suggestion within 2 weeks. The introduction will come by email."
                    : "We'll add you to the mentor pool and reach out when we have a good match for you. It means a lot."}
                </p>
                <Button type="button" variant="ghost" onClick={close}>
                  Done
                </Button>
              </div>
            ) : mode === "mentee" ? (
              <>
                {step === 1 && (
                  <>
                    <div className={styles.mmEye}>Finding you a mentor</div>
                    <div className={styles.mmTitle}>What do you need help with?</div>
                    <p className={styles.mmDesc}>
                      Pick the areas where you'd most benefit from guidance. We'll match
                      you with someone who has direct experience there.
                    </p>
                    <CheckGrid options={MENTEE_AREAS} />
                    <div className={styles.mmNav}>
                      <span />
                      <Button type="button" variant="primary" className={styles.mmContinue} onClick={() => setStep(2)}>
                        Continue →
                      </Button>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className={styles.mmEye}>About you</div>
                    <div className={styles.mmTitle}>What should your mentor know?</div>
                    <div className={styles.mmFields}>
                      <input className={styles.mmInput} type="text" placeholder="Your name" />
                      <input className={styles.mmInput} type="text" placeholder="Your role or practice" />
                      <select className={styles.mmSelect} defaultValue="">
                        <option value="">How often would you like to meet?</option>
                        <option>Once a month</option>
                        <option>Twice a month</option>
                        <option>As needed</option>
                      </select>
                      <textarea className={styles.mmTextarea} rows={3} placeholder="A sentence about what's going on and what kind of support would help…" />
                    </div>
                    <div className={styles.mmNav}>
                      <button type="button" className={styles.mmBack} onClick={() => setStep(1)}>
                        ← Back
                      </button>
                      <Button type="button" variant="primary" className={styles.mmContinue} onClick={() => setStep(3)}>
                        Continue →
                      </Button>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <div className={styles.mmEye}>Almost done</div>
                    <div className={styles.mmTitle}>How do we reach you?</div>
                    <div className={styles.mmFields}>
                      <input className={styles.mmInput} type="email" placeholder="Your email address" />
                    </div>
                    <p className={styles.mmDesc}>
                      We'll review your request and suggest a match within 2 weeks.
                      You'll get an email introduction and can take it from there.
                    </p>
                    <div className={styles.mmNav}>
                      <button type="button" className={styles.mmBack} onClick={() => setStep(2)}>
                        ← Back
                      </button>
                      <Button
                        type="button" variant="primary" className={styles.mmContinue}
                        onClick={() => {
                          setStep(4);
                          showToast("Match request received", "success");
                        }}
                      >
                        Submit →
                      </Button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <div className={styles.mmEye}>Becoming a mentor</div>
                    <div className={styles.mmTitle}>What can you offer?</div>
                    <p className={styles.mmDesc}>
                      You don't need to be an expert. You need to have navigated
                      something that someone else is currently navigating.
                    </p>
                    <CheckGrid options={MENTOR_AREAS} />
                    <div className={styles.mmNav}>
                      <span />
                      <Button type="button" variant="primary" className={styles.mmContinue} onClick={() => setStep(2)}>
                        Continue →
                      </Button>
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <div className={styles.mmEye}>Your capacity</div>
                    <div className={styles.mmTitle}>How much time can you give?</div>
                    <div className={styles.mmFields}>
                      <input className={styles.mmInput} type="text" placeholder="Your name and role" />
                      <select className={styles.mmSelect} defaultValue="">
                        <option value="">How many mentees per quarter?</option>
                        <option>1 mentee</option>
                        <option>2 mentees</option>
                        <option>3 mentees</option>
                      </select>
                      <select className={styles.mmSelect} defaultValue="">
                        <option value="">Preferred meeting format</option>
                        <option>In-person in Lisbon</option>
                        <option>Video call</option>
                        <option>Either works</option>
                      </select>
                      <input className={styles.mmInput} type="email" placeholder="Your email address" />
                    </div>
                    <div className={styles.mmNav}>
                      <button type="button" className={styles.mmBack} onClick={() => setStep(1)}>
                        ← Back
                      </button>
                      <Button
                        type="button" variant="primary" className={styles.mmContinue}
                        onClick={() => {
                          setStep(3);
                          showToast("Added to the mentor pool", "success");
                        }}
                      >
                        Submit →
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
