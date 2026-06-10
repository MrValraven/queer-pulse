import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./EconomyPage.module.css";
import { Button } from '../../shared/components/ui'

type Tab = "incubator" | "freelance" | "salary";
type Sector = "tech" | "design" | "creative" | "ngo" | "law";

const JOBS = linkToPath("QueerPulse Jobs.html");
const MENTORSHIP = linkToPath("QueerPulse Mentorship.html");

const STEPS = [
  { n: 1, title: "Apply", desc: "A short application — your idea, where you are, what you need. No pitch deck required. Decisions in 3 weeks.", meta: "Applications open · Deadline 30 Jul" },
  { n: 2, title: "Match with a mentor", desc: "Matched to a community mentor based on your sector, stage, and what you told us you need. You meet fortnightly for six months.", meta: "Sep–Feb · Fortnightly sessions" },
  { n: 3, title: "Cohort sessions", desc: "Monthly workshops with the full cohort — legal, finance, fundraising, design — plus time for peer support and honest conversation.", meta: "First Saturday of every month" },
  { n: 4, title: "Demo night", desc: "Share what you've built with the community, investors, and the press. Low-stakes, high-support. You decide how much to reveal.", meta: "March · Invite-only" },
];

const INC_MENTORS = [
  { av: "RL", bg: "rgba(232,119,90,.15)", color: "var(--accent-ink)", name: "Rita Lopes", role: "Founder, Arquivo Studio · formerly Farfetch product lead", tags: ["Product", "B2C", "Fundraising"] },
  { av: "JM", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "João Melo", role: "Co-founder, Semente Legal · social enterprise lawyer", tags: ["Legal", "Cooperatives", "Grants"] },
  { av: "AC", bg: "rgba(45,27,61,.1)", color: "var(--plum)", name: "Ana Catarina", role: "Angel investor · ex-Unbabel, Feedzai", tags: ["B2B SaaS", "Pre-seed", "Hiring"] },
];

const TOOLS = [
  { icon: "📄", title: "Service contract (PT/EN)", desc: "A straightforward freelance services contract in Portuguese and English. Covers scope, payment terms, IP, and cancellation. Reviewed by a lawyer in the community.", cta: "Download (.docx)" },
  { icon: "💸", title: "Invoice template", desc: "A clean Portuguese-law-compliant invoice template with NIF field, IVA options, and retention tax. In both recibo verde and standard formats.", cta: "Download (.xlsx)" },
  { icon: "📋", title: "Scope of work template", desc: "Define exactly what you're delivering, what you're not, how many revisions, and what happens if the scope changes. The document that prevents most disputes.", cta: "Download (.docx)" },
  { icon: "📚", title: "Recibo verde guide", desc: "A plain-language guide to the Portuguese freelance tax system — what you need to register, when to pay, what you can deduct. Updated for 2025.", cta: "Read the guide" },
];

interface SalaryRow {
  sector: Sector;
  role: string;
  sectorLabel: string;
  money: string;
  exp: string;
  type: "Full" | "Freelance" | "Part";
  typeLabel: string;
}
const SALARIES: SalaryRow[] = [
  { sector: "tech", role: "Senior Software Engineer", sectorLabel: "Tech · Lisbon", money: "€72,000", exp: "8 yrs", type: "Full", typeLabel: "Full-time" },
  { sector: "design", role: "UX Designer", sectorLabel: "Design · Lisbon", money: "€38,000", exp: "4 yrs", type: "Full", typeLabel: "Full-time" },
  { sector: "creative", role: "Graphic Designer", sectorLabel: "Creative · Freelance", money: "€45,000", exp: "6 yrs", type: "Freelance", typeLabel: "Freelance" },
  { sector: "ngo", role: "Programme Coordinator", sectorLabel: "NGO · Lisbon", money: "€22,500", exp: "3 yrs", type: "Full", typeLabel: "Full-time" },
  { sector: "tech", role: "Product Manager", sectorLabel: "Tech · Remote", money: "€58,000", exp: "6 yrs", type: "Full", typeLabel: "Full-time" },
  { sector: "creative", role: "Documentary Filmmaker", sectorLabel: "Creative · Project-based", money: "€32,000", exp: "5 yrs", type: "Freelance", typeLabel: "Freelance" },
  { sector: "law", role: "Associate Lawyer", sectorLabel: "Law · Lisbon", money: "€34,000", exp: "2 yrs", type: "Full", typeLabel: "Full-time" },
  { sector: "design", role: "Brand Consultant", sectorLabel: "Design · Freelance", money: "€55,000", exp: "10 yrs", type: "Freelance", typeLabel: "Freelance" },
  { sector: "tech", role: "Data Analyst", sectorLabel: "Tech · Lisbon", money: "€31,000", exp: "2 yrs", type: "Full", typeLabel: "Full-time" },
  { sector: "ngo", role: "Communications Manager", sectorLabel: "NGO · Hybrid", money: "€28,000", exp: "5 yrs", type: "Part", typeLabel: "Part-time" },
];
const BADGE_CLASS: Record<SalaryRow["type"], string> = { Full: "badgeFull", Freelance: "badgeFreelance", Part: "badgePart" };
const SAL_FILTERS: { id: Sector | "all"; label: string }[] = [
  { id: "all", label: "All sectors" },
  { id: "tech", label: "Tech" },
  { id: "design", label: "Design" },
  { id: "creative", label: "Creative" },
  { id: "ngo", label: "NGO / non-profit" },
  { id: "law", label: "Law" },
];

const euro = (n: number) => "€" + Math.round(n).toLocaleString("pt-PT");

export function EconomyPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("incubator");
  const [sector, setSector] = useState<Sector | "all">("all");
  const [modal, setModal] = useState(false);
  const [annual, setAnnual] = useState("40000");
  const [days, setDays] = useState("180");
  const [overhead, setOverhead] = useState("20");
  const [iva, setIva] = useState("23");

  const base = (parseFloat(annual) || 0) / (parseFloat(days) || 1) * (1 + (parseFloat(overhead) || 0) / 100);
  const withIva = base * (1 + (parseFloat(iva) || 0) / 100);

  const salaries = SALARIES.filter((s) => sector === "all" || s.sector === sector);

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Queer economy</div>
          <h1>
            Build something that <em>lasts.</em>
          </h1>
          <p className={styles.lead}>
            Tools, mentorship, and solidarity for queer founders, freelancers, and
            professionals — because economic independence is part of queer liberation.
          </p>
          <div className={styles.tabs}>
            {(["incubator", "freelance", "salary"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={[styles.tab, tab === t && styles.tabActive].filter(Boolean).join(" ")}
                onClick={() => setTab(t)}
              >
                {t === "incubator" ? "Business incubator" : t === "freelance" ? "Freelance tools" : "Salary board"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          {tab === "incubator" && (
            <>
              <div className={styles.incHeroBox}>
                <div>
                  <div className={styles.incH}>
                    A space to build <em>your</em> thing.
                  </div>
                  <p className={styles.incP}>
                    The QueerPulse incubator supports queer founders in Lisbon with six
                    months of structured mentorship, peer accountability, and connections
                    to investors and collaborators who get it.
                  </p>
                  <div className={styles.incBtns}>
                    <Button type="button" variant="primary" onClick={() => showToast("Cohort 3 application opening…", "info")}>
                      Apply for cohort 3
                    </Button>
                    <Button type="button" variant="ghost-dark" onClick={() => showToast("Mentor sign-up opening…", "info")} style={{ fontSize: 14 }}>
                      Become a mentor
                    </Button>
                  </div>
                </div>
                <div className={styles.incStats}>
                  <div className={styles.incStat}>
                    <div className={styles.n}>24</div>
                    <div className={styles.l}>founders in 2 cohorts</div>
                  </div>
                  <div className={styles.incStat}>
                    <div className={styles.n}>18</div>
                    <div className={styles.l}>mentors from the community</div>
                  </div>
                  <div className={styles.incStat}>
                    <div className={styles.n}>€2.4M</div>
                    <div className={styles.l}>raised by cohort alumni</div>
                  </div>
                </div>
              </div>

              <div className={styles.incCols}>
                <div>
                  <h3 className={styles.colH}>
                    How the programme <em>works.</em>
                  </h3>
                  <div className={styles.incTimeline}>
                    {STEPS.map((s) => (
                      <div className={styles.incStep} key={s.n}>
                        <div className={styles.incStepNum}>{s.n}</div>
                        <div className={styles.incStepBody}>
                          <div className={styles.incStepTitle}>{s.title}</div>
                          <div className={styles.incStepDesc}>{s.desc}</div>
                          <div className={styles.incStepMeta}>{s.meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={styles.colH}>
                    Current <em>mentors.</em>
                  </h3>
                  <div className={styles.mentorGrid}>
                    {INC_MENTORS.map((m) => (
                      <div className={styles.mentorCard} key={m.name}>
                        <div className={styles.mentorTop}>
                          <div className={styles.mentorAv} style={{ background: m.bg, color: m.color }}>
                            {m.av}
                          </div>
                          <div>
                            <div className={styles.mentorName}>{m.name}</div>
                            <div className={styles.mentorRole}>{m.role}</div>
                          </div>
                        </div>
                        <div className={styles.mentorTags}>
                          {m.tags.map((t) => (
                            <span key={t} className={styles.mentorTag}>
                              {t}
                            </span>
                          ))}
                        </div>
                        <button type="button" className={styles.mentorBtn} onClick={() => showToast("Session requested", "success")}>
                          Request session
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === "freelance" && (
            <>
              <div className={styles.secHeader}>
                <div>
                  <h2 className={styles.econH}>
                    Freelance <em>tools.</em>
                  </h2>
                  <p className={styles.econSub}>
                    Templates, calculators, and guides written by and for queer
                    freelancers in Portugal. Free, no sign-up needed.
                  </p>
                </div>
              </div>
              <div className={styles.toolsGrid}>
                {TOOLS.map((t) => (
                  <div className={styles.toolCard} key={t.title}>
                    <div className={styles.toolIcon}>{t.icon}</div>
                    <div className={styles.toolTitle}>{t.title}</div>
                    <div className={styles.toolDesc}>{t.desc}</div>
                    <button type="button" className={styles.toolCtaBtn} onClick={() => showToast(`${t.cta}…`, "info")}>
                      {t.cta}
                    </button>
                  </div>
                ))}
              </div>

              <h3 className={styles.rateH}>
                Day rate <em>calculator.</em>
              </h3>
              <div className={styles.rateCalc}>
                <div className={styles.rcRow}>
                  <div>
                    <div className={styles.rcLabel}>Target annual income (€)</div>
                    <input className={styles.rcInput} type="number" value={annual} onChange={(e) => setAnnual(e.target.value)} />
                  </div>
                  <div>
                    <div className={styles.rcLabel}>Billable days per year</div>
                    <input className={styles.rcInput} type="number" value={days} onChange={(e) => setDays(e.target.value)} />
                  </div>
                </div>
                <div className={styles.rcRow}>
                  <div>
                    <div className={styles.rcLabel}>Overhead &amp; expenses (% of income)</div>
                    <input className={styles.rcInput} type="number" min={0} max={100} value={overhead} onChange={(e) => setOverhead(e.target.value)} />
                  </div>
                  <div>
                    <div className={styles.rcLabel}>IVA rate</div>
                    <select className={styles.rcSelect} value={iva} onChange={(e) => setIva(e.target.value)}>
                      <option value="0">0% (exempt)</option>
                      <option value="6">6%</option>
                      <option value="13">13%</option>
                      <option value="23">23%</option>
                    </select>
                  </div>
                </div>
                <div className={styles.rcResult}>
                  <div>
                    <div className={styles.rcResultLabel}>Minimum day rate (excl. IVA)</div>
                    <div className={styles.rcResultVal}>{euro(base)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className={styles.rcResultLabel}>Including IVA</div>
                    <div className={styles.rcResultVal}>{euro(withIva)}</div>
                  </div>
                </div>
              </div>
              <p className={styles.rateNote}>
                A starting point only — adjust for your sector, experience, and market.
                See the salary board for what others in similar roles charge.
              </p>
            </>
          )}

          {tab === "salary" && (
            <>
              <div className={styles.secHeader}>
                <div>
                  <h2 className={styles.econH}>
                    Salary <em>transparency.</em>
                  </h2>
                  <p className={styles.econSub}>
                    Anonymous submissions from the community. Filter by sector, role, or
                    type. Knowledge is power.
                  </p>
                </div>
                <button type="button" className={styles.primaryBtn} onClick={() => setModal(true)}>
                  + Submit yours
                </button>
              </div>
              <div className={styles.salFilters}>
                {SAL_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={[styles.salChip, sector === f.id && styles.salChipActive].filter(Boolean).join(" ")}
                    onClick={() => setSector(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className={styles.salTable}>
                <div className={styles.salHeader}>
                  <div className={styles.salHcell}>Role</div>
                  <div className={styles.salHcell}>Annual (gross)</div>
                  <div className={styles.salHcell}>Experience</div>
                  <div className={`${styles.salHcell} ${styles.salTypeCol}`}>Type</div>
                </div>
                {salaries.map((s, i) => (
                  <div className={styles.salRow} key={i}>
                    <div>
                      <div className={styles.salRole}>{s.role}</div>
                      <div className={styles.salSector}>{s.sectorLabel}</div>
                    </div>
                    <div className={`${styles.salCell} ${styles.salMoney}`}>{s.money}</div>
                    <div className={styles.salCell}>
                      <span className={styles.salExp}>{s.exp}</span>
                    </div>
                    <div className={`${styles.salCell} ${styles.salTypeCol}`}>
                      <span className={`${styles.salBadge} ${styles[BADGE_CLASS[s.type]]}`}>{s.typeLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.salAnon}>
                All entries are anonymous. No name, email, or employer is stored. Entries
                are reviewed by a moderator before appearing.
              </div>
              <div className={styles.salSubmitBox}>
                <p>
                  Help the community by sharing what you earn. The more entries, the more
                  useful this becomes for everyone — especially people just starting to
                  negotiate.
                </p>
                <button type="button" className={styles.primaryBtn} onClick={() => setModal(true)}>
                  Submit your salary
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Build it <em>with us.</em>
          </h2>
          <p className={styles.outroSub}>
            A stronger queer economy benefits all of us. Start with the tools, stay for
            the community.
          </p>
          <div className={styles.outroBtns}>
            <Button to={JOBS} variant="primary" size="lg">
              Browse jobs
            </Button>
            <Button to={MENTORSHIP} variant="ghost-dark" size="lg">
              Find a mentor
            </Button>
          </div>
        </div>
      </section>

      {modal && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>Submit your salary</div>
              <button type="button" className={styles.modalClose} onClick={() => setModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalSub}>
              Completely anonymous. Nothing that could identify you is stored.
            </div>
            <div className={styles.modalFields}>
              <input className={styles.modalInput} type="text" placeholder="Job title / role" />
              <input className={styles.modalInput} type="text" placeholder="Sector (e.g. Tech, NGO, Design)" />
              <div className={styles.modalRow2}>
                <input className={styles.modalInput} type="number" placeholder="Annual salary (€)" />
                <input className={styles.modalInput} type="number" placeholder="Years of experience" />
              </div>
              <select className={styles.modalSelect} defaultValue="">
                <option value="">Employment type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Freelance</option>
                <option>Contract</option>
              </select>
            </div>
            <button
              type="button"
              className={`${styles.primaryBtn} ${styles.modalSubmit}`}
              onClick={() => {
                setModal(false);
                showToast("Submitted anonymously — thank you", "success");
              }}
            >
              Submit anonymously
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
