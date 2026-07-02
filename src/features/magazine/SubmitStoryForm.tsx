import { useMemo, useState, type FormEvent } from "react";
import { Button, Reveal } from "../../shared/components/ui";
import { MagazineMasthead } from "./MagazineMasthead";
import { SubmitStoryIntro } from "./SubmitStoryIntro";
import { FORMATS } from "./submitStory.data";
import styles from "./SubmitStoryPage.module.css";

const PITCH_MIN = 40;
const PITCH_MAX = 800;

export function SubmitStoryForm({
  onSent,
}: {
  onSent: (working: string) => void;
}) {
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
    onSent(working);
  }

  const pitchLen = pitch.length;
  const pitchOver = pitchLen > PITCH_MAX;

  return (
    <>
      <MagazineMasthead active="write" />
      <section className={styles.page}>
        <div className="wrap">
          <div className={styles.grid}>
            <SubmitStoryIntro />

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
    </>
  );
}
