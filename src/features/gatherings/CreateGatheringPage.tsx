import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./CreateGatheringPage.module.css";

const PILL_LABELS = ["Type", "Date & place", "Capacity", "Pricing", "Review"];
const TIPS = [
  "Choose the format that comes most naturally to you. The best gatherings are the ones hosts actually enjoy running.",
  "The neighbourhood is shown on the listing. The full address is only shared with confirmed attendees.",
  "Be honest about accessibility. Attendees plan around it. Only tick what you can genuinely confirm.",
  "QueerPulse takes 0% of ticket revenue. Every euro goes to you. The sliding scale is required — it makes the community more accessible.",
  "Once you publish, you can still edit the listing. You cannot reduce capacity below the number of existing RSVPs.",
];

const TYPES = [
  { icon: "🍽️", name: "Supper club", sub: "Shared meal, hosted" },
  { icon: "📚", name: "Workshop / talk", sub: "Teach or share something" },
  { icon: "🎬", name: "Screening", sub: "Film, music, performance" },
  { icon: "🎨", name: "Studio visit", sub: "Open your space" },
  { icon: "🚶", name: "Walk or outdoor", sub: "Movement, outdoor" },
  { icon: "💬", name: "Discussion", sub: "Reading group, debate" },
  { icon: "🤝", name: "Skills exchange", sub: "Mutual learning" },
  { icon: "✨", name: "Other", sub: "Something else entirely" },
];

const HOODS = ["Mouraria", "Intendente", "Alfama", "Graça", "Príncipe Real", "Bairro Alto", "Cais do Sodré", "Santos", "Marvila", "Arroios", "Online", "Other in Lisbon"];
const LANGS = ["PT / EN bilingual", "Portuguese only", "English only", "Other"];
const ACCESS_OPTIONS = [
  "Step-free access throughout",
  "Accessible toilet",
  "Seating available throughout",
  "Low sensory / quiet option available",
  "Dietary requirements can be accommodated",
];

export function CreateGatheringPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);

  // form state
  const [type, setType] = useState("");
  const [typeIcon, setTypeIcon] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [endTime, setEndTime] = useState("22:00");
  const [hood, setHood] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [directions, setDirections] = useState("");
  const [cap, setCap] = useState("14");
  const [lang, setLang] = useState(LANGS[0]);
  const [access, setAccess] = useState<Set<string>>(new Set());
  const [accessNotes, setAccessNotes] = useState("");
  const [free, setFree] = useState(false);
  const [stdPrice, setStdPrice] = useState("10");
  const [supPrice, setSupPrice] = useState("18");
  const [included, setIncluded] = useState("");
  const [bring, setBring] = useState("");
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const TOTAL = 5;
  const isSuccess = step === 6;
  const fill = ((step - 1) / TOTAL) * 100;
  const allChecked = checks.every(Boolean);
  const checkedCount = checks.filter(Boolean).length;
  const canPublish = step !== TOTAL || allChecked;

  const toggleAccess = (name: string) =>
    setAccess((prev) => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });

  const next = () => {
    if (step === TOTAL) {
      if (!allChecked) return;
      setStep(6);
      showToast("Your gathering is live", "success");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    if (step === 1) {
      navigate(linkToPath("QueerPulse Host.html"));
      return;
    }
    setStep((s) => s - 1);
  };

  const review = [
    { l: "Type", v: <>{typeIcon} <strong>{type || "—"}</strong></> },
    { l: "Title", v: <strong>{title || "—"}</strong> },
    { l: "Date & time", v: `${date || "—"} at ${time || "—"}` },
    { l: "Location", v: `${venue || "—"}, ${hood || "—"}` },
    { l: "Capacity", v: `${cap || "—"} people · ${lang}` },
    { l: "Pricing", v: free ? "Free event" : `Sliding scale · Free / €${stdPrice || "—"} / €${supPrice || "—"}` },
  ];

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>List your event</div>
            <h2 className={styles.title}>
              Create your <em>gathering.</em>
            </h2>
            <p className={styles.sub}>
              Fill in the details below and your event will be live on the QueerPulse
              gatherings board immediately.
            </p>
          </div>

          {!isSuccess && (
            <div className={styles.progressWrap}>
              <div className={styles.stepPills}>
                {PILL_LABELS.map((l, i) => {
                  const s = i + 1;
                  const cls = s < step ? styles.pillDone : s === step ? styles.pillActive : styles.pillPending;
                  return (
                    <div key={l} className={`${styles.pill} ${cls}`}>
                      {l}
                    </div>
                  );
                })}
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${fill}%` }} />
              </div>
            </div>
          )}

          <div className={styles.layout}>
            <div>
              {step === 1 && (
                <div>
                  <div className={styles.stepTitle}>
                    What kind of <em>gathering?</em>
                  </div>
                  <p className={styles.stepSub}>
                    Choose the format. This determines some of the fields that follow.
                  </p>
                  <div className={styles.types}>
                    {TYPES.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        className={[styles.typeCard, type === t.name && styles.typeCardSelected].filter(Boolean).join(" ")}
                        onClick={() => {
                          setType(t.name);
                          setTypeIcon(t.icon);
                        }}
                      >
                        <div className={styles.typeIcon}>{t.icon}</div>
                        <span className={styles.typeName}>{t.name}</span>
                        <span className={styles.typeSub}>{t.sub}</span>
                      </button>
                    ))}
                  </div>
                  <label className={styles.label}>Event title</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="A clear, specific title — not a pun, not a mystery"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label className={styles.label}>Short description</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="What will people do? What should they expect? What makes this gathering worth attending?"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className={styles.stepTitle}>
                    When and <em>where?</em>
                  </div>
                  <p className={styles.stepSub}>
                    The location is only shared with confirmed attendees — not shown on the
                    public listing.
                  </p>
                  <div className={styles.row2}>
                    <div>
                      <label className={styles.label}>Date</label>
                      <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div>
                      <label className={styles.label}>Time</label>
                      <input className={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.row2}>
                    <div>
                      <label className={styles.label}>End time (optional)</label>
                      <input className={styles.input} type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                    <div>
                      <label className={styles.label}>Neighbourhood</label>
                      <select className={styles.select} value={hood} onChange={(e) => setHood(e.target.value)}>
                        <option value="">Select…</option>
                        {HOODS.map((h) => (
                          <option key={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className={styles.label}>Venue name</label>
                  <input className={styles.input} type="text" placeholder="e.g. Casa da Mariquinhas, My studio, Jardim do Torel" value={venue} onChange={(e) => setVenue(e.target.value)} />
                  <label className={styles.label}>Full address (shared only with confirmed attendees)</label>
                  <input className={styles.input} type="text" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  <label className={styles.label}>Getting there (optional)</label>
                  <input className={styles.input} type="text" placeholder="e.g. Ring the bell on the left, 5 min walk from Intendente metro" value={directions} onChange={(e) => setDirections(e.target.value)} />
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className={styles.stepTitle}>
                    Who and <em>how many?</em>
                  </div>
                  <p className={styles.stepSub}>
                    Set a realistic cap. It's easier to open more spots than to turn people
                    away at the door.
                  </p>
                  <div className={styles.row2}>
                    <div>
                      <label className={styles.label}>Capacity</label>
                      <input className={styles.input} type="number" min={2} max={200} placeholder="Max attendees" value={cap} onChange={(e) => setCap(e.target.value)} />
                    </div>
                    <div>
                      <label className={styles.label}>Language</label>
                      <select className={styles.select} value={lang} onChange={(e) => setLang(e.target.value)}>
                        {LANGS.map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label className={styles.label}>Accessibility — what can you confirm?</label>
                  <p className={styles.hint}>
                    Only tick what you can genuinely confirm. Attendees will rely on this
                    information.
                  </p>
                  <div className={styles.accessList}>
                    {ACCESS_OPTIONS.map((name) => {
                      const on = access.has(name);
                      return (
                        <div
                          key={name}
                          className={[styles.accessItem, on && styles.accessItemSelected].filter(Boolean).join(" ")}
                          onClick={() => toggleAccess(name)}
                        >
                          <div className={styles.accessCheck}>{on ? "✓" : ""}</div>
                          <span className={styles.accessName}>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <label className={styles.label}>Accessibility notes (optional)</label>
                  <input className={styles.input} type="text" placeholder="Anything else attendees should know — steps, parking, sound level…" value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} />
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className={styles.stepTitle}>
                    Tickets and <em>pricing.</em>
                  </div>
                  <p className={styles.stepSub}>
                    QueerPulse takes 0% of ticket revenue. All money goes directly to you.
                    Sliding scale is mandatory for any paid event.
                  </p>
                  <div className={styles.freeToggle} onClick={() => setFree((f) => !f)}>
                    <div className={[styles.freeCheck, free && styles.freeCheckOn].filter(Boolean).join(" ")}>
                      {free ? "✓" : ""}
                    </div>
                    <div>
                      <div className={styles.freeLabel}>Free event — no tickets needed</div>
                    </div>
                  </div>
                  {!free && (
                    <div>
                      <p className={styles.hint}>
                        Set three tiers. The sliding scale is not optional — if your event is
                        paid, all three tiers must be offered. Members choose their tier
                        privately.
                      </p>
                      <div className={styles.tierHead}>
                        <span />
                        <span className={styles.tierColHead}>Price / person</span>
                        <span className={styles.tierColHead}>Spots</span>
                        <span />
                      </div>
                      <div className={styles.tierRow}>
                        <span className={styles.tierLabel}>Free / solidarity</span>
                        <div className={styles.moneyCell}>
                          <span className={styles.moneyPrefix}>€</span>
                          <input className={styles.tierInput} type="number" min={0} defaultValue="0" aria-label="Free / solidarity price in euros" />
                        </div>
                        <div className={styles.spotsCell}>
                          <input className={styles.tierInput} type="number" min={0} defaultValue="3" aria-label="Free / solidarity number of spots" />
                          <span className={styles.spotsSuffix}>ppl</span>
                        </div>
                        <span />
                      </div>
                      <div className={styles.tierNote}>
                        This tier is for members who cannot afford to pay. Set aside at least
                        2–3 spots.
                      </div>
                      <div className={styles.tierRow}>
                        <span className={styles.tierLabel}>Standard</span>
                        <div className={styles.moneyCell}>
                          <span className={styles.moneyPrefix}>€</span>
                          <input className={styles.tierInput} type="number" min={0} value={stdPrice} onChange={(e) => setStdPrice(e.target.value)} aria-label="Standard price in euros" />
                        </div>
                        <div className={styles.spotsCell}>
                          <input className={styles.tierInput} type="number" min={0} defaultValue="8" aria-label="Standard number of spots" />
                          <span className={styles.spotsSuffix}>ppl</span>
                        </div>
                        <span />
                      </div>
                      <div className={styles.tierRow}>
                        <span className={styles.tierLabel}>Supporter</span>
                        <div className={styles.moneyCell}>
                          <span className={styles.moneyPrefix}>€</span>
                          <input className={styles.tierInput} type="number" min={0} value={supPrice} onChange={(e) => setSupPrice(e.target.value)} aria-label="Supporter price in euros" />
                        </div>
                        <div className={styles.spotsCell}>
                          <input className={styles.tierInput} type="number" min={0} defaultValue="5" aria-label="Supporter number of spots" />
                          <span className={styles.spotsSuffix}>ppl</span>
                        </div>
                        <span />
                      </div>
                      <p className={styles.hint} style={{ marginTop: 8 }}>
                        Supporter tier income subsidises the free tier. Suggested: standard ×
                        1.8.
                      </p>
                    </div>
                  )}
                  <label className={styles.label} style={{ marginTop: 4 }}>
                    What's included in the ticket?
                  </label>
                  <input className={styles.input} type="text" placeholder="e.g. Shared dinner and wine, materials provided, just your time" value={included} onChange={(e) => setIncluded(e.target.value)} />
                  <label className={styles.label}>Anything to bring / prepare?</label>
                  <input className={styles.input} type="text" placeholder="Optional — e.g. Bring something to share, wear comfortable shoes" value={bring} onChange={(e) => setBring(e.target.value)} />
                </div>
              )}

              {step === 5 && (
                <div>
                  <div className={styles.stepTitle}>
                    Review and <em>publish.</em>
                  </div>
                  <p className={styles.stepSub}>Check the details before your gathering goes live.</p>
                  <div className={styles.reviewGrid}>
                    {review.map((r) => (
                      <div className={styles.reviewRow} key={r.l}>
                        <div className={styles.reviewLbl}>{r.l}</div>
                        <div className={styles.reviewVal}>{r.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.label} style={{ marginBottom: 4 }}>
                    Before you publish — confirm all three
                  </div>
                  <p className={styles.checkIntro}>
                    Tick each box to confirm. The <strong>Publish gathering</strong> button
                    stays disabled until all three are checked.
                  </p>
                  {[
                    "This gathering follows the QueerPulse Code of Care.",
                    "The sliding scale (if ticketed) is genuine — the free tier will be honoured.",
                    "The accessibility information I've provided is accurate to the best of my knowledge.",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className={styles.checkRow}
                      onClick={() => setChecks((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                    >
                      <div className={[styles.check, checks[i] && styles.checkOn].filter(Boolean).join(" ")}>
                        {checks[i] ? "✓" : ""}
                      </div>
                      <span className={styles.checkText}>{text}</span>
                    </div>
                  ))}
                  <div className={[styles.publishStatus, allChecked && styles.publishStatusReady].filter(Boolean).join(" ")}>
                    {allChecked
                      ? "All set — you can publish now."
                      : `${checkedCount} of 3 confirmed — tick the ${3 - checkedCount === 1 ? "last box" : `remaining ${3 - checkedCount} boxes`} to publish.`}
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className={styles.success}>
                  <div className={styles.successIcon}>🎉</div>
                  <div className={styles.successTitle}>
                    Your gathering <em>is live.</em>
                  </div>
                  <p className={styles.successSub}>
                    It's now visible on the QueerPulse gatherings board. Members can see it
                    and RSVP. You'll get an email notification for each new attendee.
                  </p>
                  <div className={styles.successActions}>
                    <Button to={linkToPath("QueerPulse Gathering.html")} variant="ghost-dark">
                      View on board →
                    </Button>
                    <Button to={linkToPath("QueerPulse Event.html")} variant="primary">
                      See your event page →
                    </Button>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className={styles.nav}>
                  <button type="button" className={styles.back} onClick={back}>
                    {step === 1 ? "Cancel" : "← Back"}
                  </button>
                  <button
                    type="button"
                    className={styles.next}
                    onClick={next}
                    disabled={!canPublish}
                    title={!canPublish ? "Confirm all three boxes above to publish" : undefined}
                  >
                    {step === TOTAL ? "Publish gathering →" : "Continue →"}
                  </button>
                </div>
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.tipCard}>
                <div className={styles.tipTitle}>Tip for this step</div>
                <div className={styles.tipBody}>{TIPS[Math.min(step, TOTAL) - 1]}</div>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipTitle}>What happens after you publish</div>
                <div className={styles.tipBody}>
                  Your gathering appears on the board immediately. RSVPs come to your
                  QueerPulse inbox. Full addresses are shared only with confirmed attendees.
                  You can edit or cancel at any time up to 48 hours before.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
