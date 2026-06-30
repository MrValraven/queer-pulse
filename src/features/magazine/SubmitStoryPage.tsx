import { useMemo, useState, type FormEvent } from "react";
import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, Reveal } from "../../shared/components/ui";
import { MagazineMasthead } from "./MagazineMasthead";
import { FORMATS, LOOKING_FOR, STEPS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";
import { routes } from "../../app/routeMap";

const PITCH_MIN = 40;
const PITCH_MAX = 800;

/** Two weeks from "now", formatted as e.g. "10 July 2026". */
function replyByDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SubmitStoryPage() {
  const [sent, setSent] = useState(false);
  const [format, setFormat] = useState("essay");
  const [working, setWorking] = useState("");
  const [pitch, setPitch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({ working: false, pitch: false });

  const errors = useMemo(() => {
    const e: { working?: string; pitch?: string } = {};
    if (!working.trim())
      e.working = "A working title helps us keep track — it can change later.";
    if (!pitch.trim()) e.pitch = "Tell us a little about the story.";
    else if (pitch.trim().length < PITCH_MIN)
      e.pitch = `A bit more, please — at least ${PITCH_MIN} characters.`;
    return e;
  }, [working, pitch]);

  const isValid = Object.keys(errors).length === 0;
  const showError = (k: "working" | "pitch") =>
    (touched[k] || submitted) && errors[k];
  const showOk = (k: "working" | "pitch") =>
    (touched[k] || submitted) && !errors[k];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    setSent(true);
  }

  if (sent) {
    return (
      <PageShell>
        <section className={styles.page}>
          <div className="wrap">
            <Reveal className={styles.panel}>
              <div className={styles.panelIcon}>
                <FiCheck />
              </div>
              <h1 className={styles.panelTitle}>
                We're <em>reading.</em>
              </h1>
              <p className={styles.panelSub}>
                Thank you for trusting us with “{working || "your story"}”.
                Whatever happens, the copyright stays yours.
              </p>
              <div className={styles.timeline}>
                <div className={styles.timelineRow}>
                  <span className={styles.timelineDot} />
                  <span>An editor reads every pitch personally.</span>
                </div>
                <div className={styles.timelineRow}>
                  <span
                    className={[styles.timelineDot, styles.timelineDotKey].join(
                      " ",
                    )}
                  />
                  <span>
                    You'll hear from us by <strong>{replyByDate()}</strong> —
                    yes, no, or let's talk.
                  </span>
                </div>
                <div className={styles.timelineRow}>
                  <span className={styles.timelineDot} />
                  <span>
                    If it's a yes, we agree a rate and deadline together.
                  </span>
                </div>
              </div>
              <div className={styles.panelActions}>
                <Button to={routes.magazine} variant="ghost-dark" size="lg">
                  Back to the magazine
                </Button>
                <Button to={routes.issues} variant="jade" size="lg">
                  Read past issues
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </PageShell>
    );
  }

  const pitchLen = pitch.length;
  const pitchOver = pitchLen > PITCH_MAX;

  return (
    <PageShell>
      <MagazineMasthead active="write" />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.grid}>
            <div>
              <Reveal className={styles.eyebrow}>Pitch a story</Reveal>
              <Reveal as="h1" className={styles.title} delay={60}>
                Got something <em>worth telling?</em>
              </Reveal>
              <Reveal as="p" className={styles.lead} delay={120}>
                The QueerPulse magazine is written by the community. You don't
                need a byline or an agent — just a story that matters and an
                honest way of telling it.
              </Reveal>

              <div className={styles.looking}>
                {LOOKING_FOR.map((item, index) => (
                  <Reveal
                    key={item.title}
                    className={styles.look}
                    delay={index * 50}
                  >
                    <span className={styles.lookIcon}>
                      <item.icon />
                    </span>
                    <div>
                      <div className={styles.lookTitle}>{item.title}</div>
                      <div className={styles.lookBody}>{item.body}</div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className={styles.steps}>
                <div className={styles.stepsH}>What happens next</div>
                {STEPS.map((step) => (
                  <div key={step} className={styles.step}>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <Reveal
              as="form"
              className={styles.form}
              delay={120}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={styles.field}>
                <span className={styles.label}>What format is it?</span>
                <div className={styles.formats}>
                  {FORMATS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`${styles.fmt} ${format === option.id ? styles.fmtOn : ""}`}
                      onClick={() => setFormat(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="working-title">
                  Working title
                </label>
                <input
                  id="working-title"
                  className={[
                    styles.input,
                    showError("working")
                      ? styles.inputError
                      : showOk("working")
                        ? styles.inputOk
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  type="text"
                  placeholder="It can change later"
                  value={working}
                  onChange={(event) => setWorking(event.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, working: true }))}
                  aria-invalid={!!showError("working")}
                />
                {showError("working") && (
                  <div className={styles.fieldError}>{errors.working}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="pitch">
                  The pitch
                </label>
                <textarea
                  id="pitch"
                  className={[
                    styles.textarea,
                    showError("pitch")
                      ? styles.inputError
                      : showOk("pitch")
                        ? styles.inputOk
                        : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  placeholder="A paragraph or two — what's the story, why now, and why you?"
                  value={pitch}
                  onChange={(event) => setPitch(event.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, pitch: true }))}
                  aria-invalid={!!showError("pitch")}
                  maxLength={PITCH_MAX}
                />
                <div className={styles.metaRow}>
                  {showError("pitch") ? (
                    <span className={styles.fieldError}>{errors.pitch}</span>
                  ) : showOk("pitch") ? (
                    <span className={styles.fieldOk}>Looks good.</span>
                  ) : (
                    <span />
                  )}
                  <span
                    className={[
                      styles.charCount,
                      pitchOver ? styles.charCountWarn : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {pitchLen} / {PITCH_MAX}
                  </span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="links">
                  Links to past work (optional)
                </label>
                <input
                  id="links"
                  className={styles.input}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="Portfolio, a published piece, your Instagram…"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                style={{ width: "100%" }}
              >
                Send the pitch →
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
