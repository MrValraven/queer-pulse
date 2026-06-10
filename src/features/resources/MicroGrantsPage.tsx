import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./MicroGrantsPage.module.css";
import { Button } from '../../shared/components/ui'

const INVITE = linkToPath("QueerPulse Invite.html");

const HOW = [
  { n: "01", title: "Members contribute", body: "Members who can afford to contribute add to the quarterly pot — any amount, from €5 upwards. No pressure, no minimum." },
  { n: "02", title: "Projects apply", body: "Any QueerPulse member can apply for a grant. One page: what the project is, how much you need, what it will do." },
  { n: "03", title: "Community decides", body: "A rotating panel of 5 members reviews applications. Decisions published in full with reasoning. No appeals — but the next round is always open." },
  { n: "04", title: "Projects report back", body: "Recipients share a short update at 3 months. What happened, what changed, what they spent. Everything published in the magazine." },
];

const CRITERIA = [
  "You are a QueerPulse member in good standing",
  "The project benefits the queer community in Lisbon — not just you personally",
  "You can deliver it within 3 months of receiving the grant",
  "You are willing to share a brief public update on what happened",
  "The money will genuinely change what is possible — not just make it faster",
];

interface Grant {
  amount: string;
  name: string;
  desc: string;
  tags: string[];
  status: "in-progress" | "awarded";
  statusLabel: string;
}
const CURRENT: Grant[] = [
  { amount: "€800", name: "Corpo Presente — touring exhibition costs", desc: "Lena Ferraz's embroidered textile works touring queer community spaces in Lisbon — covering transport, installation materials, and printing a proper catalogue.", tags: ["art", "trans", "textile"], status: "in-progress", statusLabel: "In progress" },
  { amount: "€500", name: "Queer reading group starter kit — 12 groups", desc: "Books, hosting costs, and printed materials for 12 new reading groups across Lisbon. Each group gets a library of 6 titles to start from.", tags: ["reading", "community", "education"], status: "in-progress", statusLabel: "In progress" },
  { amount: "€1,200", name: "GAT Lisboa volunteer supplies (naloxone + testing kits)", desc: "Topping up the harm reduction supply stock at GAT Lisboa — naloxone kits, rapid test strips, and safer sex supplies for the next quarter of outreach nights.", tags: ["harm reduction", "health", "community"], status: "in-progress", statusLabel: "In progress" },
];
const PAST: Grant[] = [
  { amount: "€600", name: "Legal name change accompaniment fund", desc: "Covering transport, printing, and time costs for 14 trans community members navigating the Conservatória process with ILGA accompaniment.", tags: ["legal", "trans", "accompaniment"], status: "awarded", statusLabel: "Completed" },
  { amount: "€400", name: "Supper club sliding-scale meals — 6 editions", desc: "Subsidising twelve seats per supper club edition for community members in financial difficulty. Six months of monthly dinners.", tags: ["food", "community", "access"], status: "awarded", statusLabel: "Completed" },
  { amount: "€900", name: "Harm reduction zine — 2,000 copies", desc: "Printing and distribution of a queer harm reduction zine across Lisbon venues, clinics, and community spaces. Plain language, honest, no moralising.", tags: ["harm reduction", "print", "health"], status: "awarded", statusLabel: "Completed" },
  { amount: "€350", name: "Emergency deaf/HoH queer group — interpreter fees", desc: "Covering sign language interpreter costs for four community events to make them accessible to deaf and hard-of-hearing members.", tags: ["accessibility", "deaf", "community"], status: "awarded", statusLabel: "Completed" },
];

const RULES = [
  { title: "One grant per member", body: "Per calendar year. Collaborative projects can apply as a group." },
  { title: "Maximum €2,000", body: "For larger projects, we encourage applying across multiple rounds or pairing with the Barter exchange." },
  { title: "Community benefit required", body: "Must benefit queer people in Lisbon beyond the applicant. Personal projects are not eligible." },
  { title: "Public reporting", body: "A brief update at 3 months — published here and in the magazine. No repayment, but accountability matters." },
  { title: "No political campaigns", body: "We fund community projects, not election or party-political activity." },
];
const PANEL = [
  { title: "Mariana Costa", body: "Psychotherapist · Mouraria" },
  { title: "Rui Marçal", body: "Software engineer · Bairro Alto" },
  { title: "Beatriz Pinto", body: "Ceramicist · Graça" },
  { title: "+ 2 community members", body: "Rotating seats — open to any member who hasn't applied this round" },
];

const CATEGORIES = [
  { icon: "🎨", name: "Creative & art", sub: "Exhibitions, prints, performances" },
  { icon: "📚", name: "Education & knowledge", sub: "Workshops, guides, resources" },
  { icon: "🏥", name: "Health & wellbeing", sub: "Mental health, harm reduction" },
  { icon: "⚖️", name: "Legal & advocacy", sub: "Rights, accompaniment" },
  { icon: "🤝", name: "Community & space", sub: "Gatherings, mutual aid" },
  { icon: "🌱", name: "Other", sub: "Something that doesn't fit neatly" },
];

const STEP_LABELS = ["Choose a category", "Project details", "Budget breakdown", "About you", "Review & submit"];
const TOTAL_STEPS = 5;

interface BudgetRow {
  id: number;
  item: string;
  amount: string;
}

function StatusPill({ g }: { g: Grant }) {
  return (
    <span
      className={[styles.gcStatus, g.status === "awarded" ? styles.gsAwarded : styles.gsInProgress].join(" ")}
    >
      {g.statusLabel}
    </span>
  );
}

function GrantCard({ g }: { g: Grant }) {
  return (
    <div className={styles.gc}>
      <div className={styles.gcAmount}>{g.amount}</div>
      <div className={styles.gcBody}>
        <div className={styles.gcName}>{g.name}</div>
        <div className={styles.gcDesc}>{g.desc}</div>
        <div className={styles.gcFoot}>
          {g.tags.map((t) => (
            <span key={t} className={styles.gtag}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <StatusPill g={g} />
    </div>
  );
}

export function MicroGrantsPage() {
  const { showToast } = useToast();
  const [amount, setAmount] = useState("€20");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState<number | null>(null);
  const [projName, setProjName] = useState("");
  const [projWhat, setProjWhat] = useState("");
  const [appName, setAppName] = useState("");
  const [rows, setRows] = useState<BudgetRow[]>([{ id: 1, item: "", amount: "" }]);
  const [checks, setChecks] = useState<Set<number>>(new Set());

  const total = rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);

  const openModal = () => {
    setOpen(true);
    setStep(1);
  };
  const closeModal = () => setOpen(false);

  const next = () => {
    if (step === TOTAL_STEPS) {
      setStep(6);
      return;
    }
    setStep((s) => s + 1);
  };
  const back = () => {
    if (step === 1) {
      closeModal();
      return;
    }
    setStep((s) => s - 1);
  };

  const addRow = () =>
    setRows((r) => [...r, { id: Date.now(), item: "", amount: "" }]);
  const removeRow = (id: number) => setRows((r) => r.filter((x) => x.id !== id));
  const updateRow = (id: number, field: "item" | "amount", val: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: val } : x)));
  const toggleCheck = (n: number) =>
    setChecks((prev) => {
      const nx = new Set(prev);
      if (nx.has(n)) nx.delete(n);
      else nx.add(n);
      return nx;
    });

  const budgetItems =
    rows
      .filter((r) => r.item || r.amount)
      .map((r) => `${r.item} · €${r.amount || 0}`)
      .join(", ") || "—";

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Community fund</div>
          <h1 className={styles.title}>
            Small money.
            <br />
            <em>Real impact.</em>
          </h1>
          <p className={styles.sub}>
            Micro-grants of €200–2000 for queer community projects in Lisbon.
            Funded by members, allocated by members, reported back to members. No
            gatekeepers.
          </p>
          <div className={styles.fund}>
            <div className={styles.fundItem}>
              <b>€14,800</b>
              <span>awarded to date</span>
            </div>
            <div className={styles.fundItem}>
              <b>18</b>
              <span>projects funded</span>
            </div>
            <div className={styles.fundItem}>
              <b>€3,200</b>
              <span>in this quarter's pot</span>
            </div>
          </div>
          <div className={styles.fundBarWrap}>
            <div className={styles.fundBarLabel}>
              <span>Q2 2026 funding round</span>
              <span>€3,200 / €4,000 goal</span>
            </div>
            <div className={styles.fundBar}>
              <div className={styles.fundBarFill} />
            </div>
          </div>
        </div>
      </header>

      <section className={styles.howSection}>
        <div className="wrap">
          <div className={styles.howGrid}>
            {HOW.map((h) => (
              <div className={styles.howItem} key={h.n}>
                <div className={styles.howN}>{h.n}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howBody}>{h.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <div>
              <div className={styles.roundCard}>
                <div className={styles.rcLabel}>
                  <span className={styles.rcDot} />
                  Applications open · Q2 2026
                </div>
                <div className={styles.rcTitle}>
                  This round: <em>Making things together.</em>
                </div>
                <p className={styles.rcDesc}>
                  This quarter we are prioritising projects that create something —
                  events, publications, spaces, tools — that the wider queer
                  community in Lisbon can access and benefit from. Solo projects and
                  collaborations both welcome.
                </p>
                <div className={styles.rcMeta}>
                  <div className={styles.rcm}>
                    <strong>€200 – €2,000</strong>
                    <span>per project</span>
                  </div>
                  <div className={styles.rcm}>
                    <strong>30 June 2026</strong>
                    <span>application deadline</span>
                  </div>
                  <div className={styles.rcm}>
                    <strong>3 – 4 weeks</strong>
                    <span>to decision</span>
                  </div>
                </div>
                <div className={styles.rcCriteria}>
                  <div className={styles.rcCritTitle}>Criteria</div>
                  <div className={styles.critList}>
                    {CRITERIA.map((c) => (
                      <div className={styles.crit} key={c}>
                        <span className={styles.critCheck}>✓</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="button" variant="primary" onClick={openModal}>
                  Apply for this round
                </Button>
              </div>

              <div className={styles.grantsSection}>
                <div className={styles.gsHead}>
                  Current <em>recipients</em>
                </div>
                <div className={styles.grantsGrid}>
                  {CURRENT.map((g) => (
                    <GrantCard g={g} key={g.name} />
                  ))}
                </div>
              </div>

              <div className={styles.grantsSection}>
                <div className={styles.gsHead}>
                  Past <em>projects</em>
                </div>
                <div className={styles.grantsGrid}>
                  {PAST.map((g) => (
                    <GrantCard g={g} key={g.name} />
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>Grant rules</div>
                {RULES.map((r) => (
                  <div className={styles.sbcRule} key={r.title}>
                    <div className={styles.sbcRuleTitle}>{r.title}</div>
                    <div className={styles.sbcRuleBody}>{r.body}</div>
                  </div>
                ))}
              </div>
              <div className={styles.sbCard}>
                <div className={styles.sbcTitle}>Review panel — Q2 2026</div>
                {PANEL.map((p) => (
                  <div className={styles.sbcRule} key={p.title}>
                    <div className={styles.sbcRuleTitle}>{p.title}</div>
                    <div className={styles.sbcRuleBody}>{p.body}</div>
                  </div>
                ))}
              </div>
              <Button
                type="button" variant="ghost" className={styles.sbcBtn}
                onClick={() => showToast("Opening panel sign-up…", "info")}
              >
                Join the review panel →
              </Button>
            </aside>
          </div>

          <div className={styles.contributeStrip}>
            <div className={styles.csInner}>
              <div className={styles.csText}>
                <h3>
                  Add to the <em>pot.</em>
                </h3>
                <p>
                  The fund is sustained by members who contribute what they can.
                  There is no minimum. Every amount makes the next round possible.
                </p>
                <div className={styles.csAmounts}>
                  {["€5", "€10", "€20", "€50", "Other"].map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={[styles.csAmount, amount === a && styles.csAmountSelected]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setAmount(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.csRight}>
                <Button to={INVITE} variant="primary" size="lg">
                  Contribute to the fund
                </Button>
                <span className={styles.csNote}>
                  Contributions are voluntary. Members only. Not tax-deductible under
                  current Portuguese law.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            The community <em>funds itself.</em>
          </h2>
          <p className={styles.outroSub}>
            Every project here was made possible by members contributing what they
            could spare. The fund grows with the network.
          </p>
          <Button to={INVITE} variant="primary" size="lg">
            Join the network
          </Button>
        </div>
      </section>

      {open && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.sheet}>
            <div className={styles.sheetHead}>
              <div className={styles.sheetTitle}>Apply — Q2 2026 round</div>
              <button type="button" className={styles.close} onClick={closeModal}>
                ✕
              </button>
            </div>

            {step <= TOTAL_STEPS && (
              <div className={styles.progress}>
                <div className={styles.stepsRow}>
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
                    <div
                      key={i}
                      className={[
                        styles.stepDot,
                        i < step && styles.stepDotDone,
                        i === step && styles.stepDotActive,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  ))}
                </div>
                <div className={styles.stepLabel}>
                  Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
                </div>
              </div>
            )}

            <div className={styles.modalBody}>
              {step === 1 && (
                <>
                  <div className={styles.stepTitle}>
                    What kind of <em>project?</em>
                  </div>
                  <p className={styles.stepSub}>
                    Choose the category that best describes your project. This helps
                    the review panel read applications together.
                  </p>
                  <div className={styles.cats}>
                    {CATEGORIES.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        className={[styles.cat, cat === i && styles.catSelected]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => setCat(i)}
                      >
                        <div className={styles.catIcon}>{c.icon}</div>
                        <span className={styles.catName}>{c.name}</span>
                        <span className={styles.catSub}>{c.sub}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className={styles.stepTitle}>
                    Tell us about <em>the project.</em>
                  </div>
                  <p className={styles.stepSub}>
                    Be specific and honest. The review panel reads everything. Plain
                    language beats formal language every time.
                  </p>
                  <label className={styles.label}>Project name</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="A short, clear title"
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                  />
                  <label className={styles.label}>What will you make or do?</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Describe the project in plain terms. What will exist or happen that doesn't exist now?"
                    value={projWhat}
                    maxLength={400}
                    onChange={(e) => setProjWhat(e.target.value)}
                  />
                  <div className={styles.char}>{projWhat.length} / 400</div>
                  <label className={styles.label}>Who benefits, and how?</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Who in the queer community will this reach? How will it make a difference to them?"
                    style={{ minHeight: 90 }}
                  />
                  <div className={styles.row2}>
                    <div>
                      <label className={styles.label}>Timeline</label>
                      <input className={styles.input} type="text" placeholder="e.g. August–October 2026" />
                    </div>
                    <div>
                      <label className={styles.label}>Project stage</label>
                      <select className={styles.select} defaultValue="">
                        <option value="">Select…</option>
                        <option>Idea — not yet started</option>
                        <option>In development</option>
                        <option>Ready to go — just needs funding</option>
                        <option>Ongoing — this would expand it</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className={styles.stepTitle}>
                    How will you <em>spend it?</em>
                  </div>
                  <p className={styles.stepSub}>
                    Break your budget into line items. Be realistic — the panel
                    prefers honest estimates to optimistic ones. Maximum €2,000 this
                    round.
                  </p>
                  <div className={styles.budgetItems}>
                    {rows.map((r) => (
                      <div className={styles.budgetRow} key={r.id}>
                        <input
                          className={styles.input}
                          placeholder="Line item (e.g. Print costs)"
                          value={r.item}
                          onChange={(e) => updateRow(r.id, "item", e.target.value)}
                        />
                        <input
                          className={styles.input}
                          type="number"
                          placeholder="€"
                          min={0}
                          max={2000}
                          value={r.amount}
                          onChange={(e) => updateRow(r.id, "amount", e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => removeRow(r.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className={styles.addItem} onClick={addRow}>
                    + Add line item
                  </button>
                  <div className={styles.totalRow}>
                    <span className={styles.totalLabel}>Total requested</span>
                    <span className={[styles.totalVal, total > 2000 && styles.totalValOver].filter(Boolean).join(" ")}>
                      €{total.toFixed(0)}
                    </span>
                  </div>
                  <div className={styles.hint}>
                    If you're also contributing your own time or money, mention it
                    below — it strengthens the application.
                  </div>
                  <label className={styles.label}>Other contributions (optional)</label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="e.g. 20 hours of my own time, use of a friend's studio"
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <div className={styles.stepTitle}>
                    About <em>you.</em>
                  </div>
                  <p className={styles.stepSub}>
                    We know who you are as a member, but tell us a little about your
                    relationship to this project and the community it serves.
                  </p>
                  <label className={styles.label}>
                    Your name (as you'd like it on the grant record)
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Chosen name or full name — your call"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                  <label className={styles.label}>Your connection to this project</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Why are you the right person to do this? What is your relationship to the community it serves?"
                    style={{ minHeight: 90 }}
                  />
                  <label className={styles.label}>
                    Have you received a QueerPulse grant before?
                  </label>
                  <select className={styles.select} defaultValue="">
                    <option value="">Select…</option>
                    <option>No, this is my first application</option>
                    <option>Yes — and I submitted a report</option>
                    <option>Yes — report is pending (within 3 months)</option>
                  </select>
                  <div className={styles.label} style={{ marginBottom: 10 }}>
                    Commitments
                  </div>
                  {[
                    "I will share a brief public update at 3 months — what happened, what was spent, what changed.",
                    "This project genuinely benefits the queer community in Lisbon, not just me personally.",
                    "I can deliver this within 3 months of receiving the grant.",
                  ].map((txt, i) => (
                    <div className={styles.checkRow} key={i} onClick={() => toggleCheck(i)}>
                      <div className={[styles.check, checks.has(i) && styles.checkChecked].filter(Boolean).join(" ")}>
                        {checks.has(i) ? "✓" : ""}
                      </div>
                      <span className={styles.checkText}>{txt}</span>
                    </div>
                  ))}
                </>
              )}

              {step === 5 && (
                <>
                  <div className={styles.stepTitle}>
                    Review your <em>application.</em>
                  </div>
                  <p className={styles.stepSub}>
                    Check everything looks right. You can go back to edit any section.
                  </p>
                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewLabel}>Category</div>
                    <div className={styles.reviewVal}>
                      {cat !== null ? (
                        <>
                          {CATEGORIES[cat].icon} <strong>{CATEGORIES[cat].name}</strong>
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewLabel}>Project</div>
                    <div className={styles.reviewVal}>{projName || "—"}</div>
                  </div>
                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewLabel}>What you'll make / do</div>
                    <div className={styles.reviewVal}>
                      {projWhat ? projWhat.substring(0, 200) + (projWhat.length > 200 ? "…" : "") : "—"}
                    </div>
                  </div>
                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewLabel}>Budget requested</div>
                    <div className={styles.reviewVal}>
                      <strong>€{total.toFixed(0)}</strong> — {budgetItems}
                    </div>
                  </div>
                  <div className={styles.reviewBlock}>
                    <div className={styles.reviewLabel}>Applicant</div>
                    <div className={styles.reviewVal}>{appName || "—"}</div>
                  </div>
                  <div className={`${styles.reviewBlock} ${styles.reviewDeadline}`}>
                    <div className={`${styles.reviewLabel} ${styles.reviewDeadlineLabel}`}>
                      Deadline
                    </div>
                    <div className={styles.reviewVal}>
                      <strong>30 June 2026</strong> — decisions in 3–4 weeks
                    </div>
                  </div>
                </>
              )}

              {step === 6 && (
                <div className={styles.success}>
                  <div className={styles.successIcon}>🌱</div>
                  <div className={styles.successTitle}>
                    Application <em>submitted.</em>
                  </div>
                  <p className={styles.successSub}>
                    We'll confirm receipt by email within 24 hours. The review panel
                    meets in mid-July. You'll hear back before 31 July regardless of
                    outcome.
                  </p>
                  <button type="button" className={styles.next} onClick={closeModal}>
                    Close
                  </button>
                </div>
              )}
            </div>

            {step <= TOTAL_STEPS && (
              <div className={styles.footer}>
                <button type="button" className={styles.back} onClick={back}>
                  {step === 1 ? "Cancel" : "← Back"}
                </button>
                <button type="button" className={styles.next} onClick={next}>
                  {step === TOTAL_STEPS ? "Submit application →" : "Continue →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
