import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./SexualHealthPage.module.css";
import { Button } from '../../shared/components/ui'

type TabId = "testing" | "prep" | "hiv" | "guides";
type ClinicType = "public" | "ngo" | "private" | "pharmacy";

const TABS: { id: TabId; label: string }[] = [
  { id: "testing", label: "Testing & screening" },
  { id: "prep", label: "PrEP in Portugal" },
  { id: "hiv", label: "HIV resources" },
  { id: "guides", label: "Guides & Q&A" },
];

interface Clinic {
  type: ClinicType;
  typeLabel: string;
  name: string;
  desc: string;
  meta: string[];
  verified?: boolean;
  btn: string;
  review?: string;
}
const CLINICS: Clinic[] = [
  { type: "ngo", typeLabel: "NGO · Free", name: "CheckpointLx", desc: "Lisbon's leading queer-specific sexual health service. Free, anonymous testing for HIV, syphilis, hepatitis B & C, and gonorrhoea. PrEP counselling. Staff are experienced with queer and trans clients. No appointment needed on drop-in days.", meta: ["📍 Rua de São Lázaro, Intendente", "🕐 Tue & Thu 18:00–21:00, Sat 14:00–18:00"], verified: true, btn: "Get directions", review: "★ 4.9 · 84 member reviews" },
  { type: "ngo", typeLabel: "NGO · Free", name: "GAT Lisboa", desc: "Community-based harm reduction and sexual health. Free HIV rapid tests, peer counselling, PrEP navigation support, and an anonymous STI referral service. Particularly strong on outreach to migrants and people in sex work.", meta: ["📍 Rua do Século, Bairro Alto", "🕐 Mon–Fri 10:00–18:00"], verified: true, btn: "Get directions", review: "★ 4.8 · 61 member reviews" },
  { type: "public", typeLabel: "SNS · Free", name: "CAD — Centro de Aconselhamento e Deteção", desc: "The public SNS HIV testing and counselling service. Free, confidential, with a counsellor present. Also provides hepatitis B vaccination and referrals to PrEP. You need to register with the SNS but no insurance required.", meta: ["📍 Multiple locations across Lisbon", "🕐 By appointment"], btn: "Find nearest", review: "★ 4.3 · 29 member reviews" },
  { type: "pharmacy", typeLabel: "Pharmacy · €15–25", name: "Rapid HIV test — any pharmacy", desc: "Available over the counter at most pharmacies. Result in 15 minutes. Detects HIV from 3 months after potential exposure. Ask for a teste rápido de VIH. No prescription needed, no record kept.", meta: ["📍 Any farmácia", "🕐 Walk-in, no appointment"], btn: "Find a pharmacy" },
  { type: "private", typeLabel: "Private · Paid", name: "Clínica da Travessa — Sexual Health", desc: "Private clinic with queer-affirming staff. Full STI panel (HIV, syphilis, gonorrhoea, chlamydia, HSV, hepatitis B & C, HPV). Results within 48 hours. Offers PrEP prescription outside the SNS pathway for those who prefer it.", meta: ["📍 Príncipe Real", "🕐 Mon–Sat, by appointment"], verified: true, btn: "Book appointment", review: "★ 4.7 · 38 member reviews" },
];
const TYPE_CLASS: Record<ClinicType, string> = {
  public: "typePublic",
  ngo: "typeNgo",
  private: "typePrivate",
  pharmacy: "typePharmacy",
};
const CLINIC_FILTERS: { id: ClinicType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "public", label: "Free / SNS" },
  { id: "ngo", label: "NGO" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "private", label: "Private" },
];

const TESTING_INFO = [
  { icon: "⏱", title: "How often?", color: "var(--jade)", bg: "rgba(74,140,111,.06)", border: "rgba(74,140,111,.18)", body: "If you have multiple partners: every 3 months. Single partner, both tested: less frequently. HIV rapid test at any pharmacy takes 15 minutes." },
  { icon: "🔒", title: "Confidential", color: "var(--accent-ink)", bg: "rgba(232,119,90,.05)", border: "rgba(232,119,90,.18)", body: "All public SNS sexual health services are confidential. No results are shared without your consent, including with your GP." },
  { icon: "💶", title: "Cost", color: "var(--plum)", bg: "rgba(45,27,61,.04)", border: "rgba(45,27,61,.12)", body: "SNS CAD centres are free. Rapid HIV tests at pharmacies cost €15–25. NGO services (CheckpointLx, GAT) are free and anonymous." },
];

const PREP_STEPS = [
  { title: "Book an appointment at a CAD or sexual health clinic", desc: "Tell them you're interested in PrEP. CheckpointLx and GAT can help you navigate the referral if you're unsure where to start.", note: "CheckpointLx offers PrEP counselling every Tuesday evening — no appointment needed." },
  { title: "Initial eligibility assessment & blood tests", desc: "A counsellor will discuss your situation and arrange blood tests: HIV, hepatitis B, creatinine (kidney function), and STI panel. Results in 5–10 days.", note: "You must be HIV-negative to start PrEP." },
  { title: "Prescription issued — medication collected free from SNS pharmacy", desc: "If eligible, you'll receive a prescription for tenofovir/emtricitabine. Collect from any SNS-contracted pharmacy at no cost with your SNS number.", note: "No SNS number? GAT Lisboa can advise on alternative pathways." },
  { title: "Quarterly check-ins", desc: "Every 3 months: HIV test, STI screen, and kidney function check. This is also where you get your next prescription. Appointments are 20–30 minutes." },
];

const PREP_FAQ = [
  { q: "Do I need a Portuguese SNS number?", a: "EU citizens can access SNS services with their EHIC card. Non-EU residents should register with the SNS — you're entitled to do this if you're legally resident in Portugal. If you're in a more complex situation, GAT Lisboa specialises in supporting people without straightforward documentation." },
  { q: "Can I take PrEP on-demand (event-based) rather than daily?", a: "Yes — the 2-1-1 protocol (two pills 2–24 hours before sex, one 24 hours after, one 48 hours after) is supported in Portugal and is effective for receptive anal sex. Discuss with your clinician whether daily or on-demand is right for you." },
  { q: "Does PrEP protect against other STIs?", a: "PrEP only prevents HIV. It doesn't protect against syphilis, gonorrhoea, chlamydia, herpes, HPV, or hepatitis C. Condoms remain useful for STI prevention, and regular testing every 3 months is part of the PrEP programme for this reason." },
  { q: "I'm trans and taking hormones — does this affect PrEP?", a: "For trans women on oestrogen, some studies suggest slightly lower drug levels — daily dosing (rather than on-demand) is recommended. PrEP and HRT are generally safe to take together. Discuss with a clinician who has experience with trans patients; CheckpointLx has trans-experienced staff." },
];

const HIV_INFO = [
  { icon: "🏥", title: "Just tested positive?", body: "Take a breath. Modern HIV treatment is effective and straightforward. The CAD service or your GP can refer you immediately to an infectious disease specialist. Treatment usually begins within days of diagnosis.", link: { label: "Linha SIDA: 800 210 008 (free) →", href: "tel:800210008", external: true } },
  { icon: "💊", title: "PEP — after potential exposure", body: "Post-exposure prophylaxis must be started within 72 hours (ideally 24). Go to any hospital A&E and ask for PEP — do not wait. It's free through the SNS and highly effective when taken on time." },
  { icon: "🤝", title: "Community peer support", body: "The QueerPulse HIV+ peer support group is private, moderated, and limited to members who have opted in. A space to share experience without stigma or unsolicited advice.", link: { label: "Find the group →", href: linkToPath("QueerPulse Communities.html") } },
  { icon: "⚖️", title: "Rights & non-disclosure", body: "Portuguese law on HIV criminalisation is nuanced. You are not legally obligated to disclose to every partner in every situation. The legal reality is complex — talk to GAT or a lawyer if you have concerns.", link: { label: "Legal resources →", href: linkToPath("QueerPulse Legal.html") } },
];

const GUIDES = [
  { icon: "💉", title: "HPV & hepatitis B vaccination", body: "Both are free through the SNS for certain groups, and strongly recommended. HPV vaccination is now available up to age 45 through some clinics. Ask your GP or CheckpointLx." },
  { icon: "🦠", title: "Mpox — what to know", body: "Mpox can affect anyone, but some queer networks have higher exposure. Vaccination is available via SNS for close contacts and higher-risk individuals. CheckpointLx maintains an up-to-date guide." },
  { icon: "🔬", title: "Bacterial STIs — syphilis, gonorrhoea, chlamydia", body: "All are curable with antibiotics and all are on the rise across Europe. Many have no symptoms. Testing every 3 months if sexually active is the most reliable way to catch them early." },
  { icon: "💬", title: "Talking to partners about testing", body: "A practical guide to having the conversation — different scripts for different situations. Written by community members, not clinical guidelines.", link: { label: "Read the guide →", href: "#" } },
  { icon: "🌿", title: "Sexual health & substance use", body: "Practical harm reduction for people who use substances in sexual contexts — chemsex, MDMA, alcohol. No judgment, practical information about risk reduction.", link: { label: "Read the guide →", href: linkToPath("QueerPulse Harm Reduction.html") } },
  { icon: "🧬", title: "Sexual health for trans & non-binary people", body: "Bodies vary, practices vary, and most sexual health guidance is written for cisgender people. A community-written guide to navigating the system and finding clinicians who understand.", link: { label: "Trans Hub →", href: linkToPath("QueerPulse Trans Hub.html") } },
];

export function SexualHealthPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabId>("testing");
  const [clinicFilter, setClinicFilter] = useState<ClinicType | "all">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const clinics = CLINICS.filter(
    (c) => clinicFilter === "all" || c.type === clinicFilter,
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Sexual health</div>
          <h1>
            Your health, on your <em>own terms.</em>
          </h1>
          <p className={styles.lead}>
            Direct, queer-specific, non-judgmental. Testing, PrEP, HIV resources,
            and a community-reviewed provider directory — all in one place.
          </p>
          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={[styles.tab, tab === t.id && styles.tabActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          {tab === "testing" && (
            <>
              <h2 className={styles.h}>
                Where to get <em>tested</em> in Lisbon.
              </h2>
              <p className={styles.sub}>
                Community-reviewed clinics and services. Last updated by members
                June 2025.
              </p>
              <div className={styles.infoGrid}>
                {TESTING_INFO.map((c) => (
                  <div
                    key={c.title}
                    className={styles.infoCard}
                    style={{ background: c.bg, borderColor: c.border }}
                  >
                    <div className={styles.infoIcon}>{c.icon}</div>
                    <div className={styles.infoTitle} style={{ color: c.color }}>
                      {c.title}
                    </div>
                    <div className={styles.infoBody}>{c.body}</div>
                  </div>
                ))}
              </div>

              <div className={styles.clinicFilters}>
                {CLINIC_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={[styles.cChip, clinicFilter === f.id && styles.cChipActive]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setClinicFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className={styles.clinicList}>
                {clinics.map((c) => (
                  <div className={styles.clinicCard} key={c.name}>
                    <div>
                      <div className={`${styles.ccType} ${styles[TYPE_CLASS[c.type]]}`}>
                        {c.typeLabel}
                      </div>
                      <div className={styles.ccName}>{c.name}</div>
                      <div className={styles.ccDesc}>{c.desc}</div>
                      <div className={styles.ccMeta}>
                        {c.meta.map((m) => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.ccRight}>
                      {c.verified && <div className={styles.ccBadge}>Community verified ✓</div>}
                      <button
                        type="button"
                        className={styles.ccBtn}
                        onClick={() => showToast("Opening details…", "info")}
                      >
                        {c.btn}
                      </button>
                      {c.review && <div className={styles.ccReview}>{c.review}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.anonBox}>
                <h3>Know a service we should add?</h3>
                <p>
                  Nominate a clinic or service for community review. We verify every
                  listing before it goes live.
                </p>
                <input
                  className={styles.anonInput}
                  style={{ minHeight: 52, resize: "none" }}
                  placeholder="Clinic name, location, and why you'd recommend it…"
                />
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => showToast("Nomination submitted", "success")}
                  >
                    Submit nomination
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "prep" && (
            <>
              <h2 className={styles.h}>
                PrEP in <em>Portugal.</em>
              </h2>
              <p className={styles.sub}>
                PrEP (pre-exposure prophylaxis) is available free through the SNS
                for eligible people. When taken correctly it is over 99% effective
                at preventing HIV. Here's how to access it.
              </p>
              <div className={styles.tip}>
                <div className={styles.tipIcon}>💡</div>
                <div className={styles.tipText}>
                  <strong>Portugal was one of the first European countries to make PrEP free.</strong>{" "}
                  You don't need private insurance. The process involves a simple
                  eligibility check, blood tests, and a prescription — the whole
                  pathway takes about 4–6 weeks the first time.
                </div>
              </div>
              <div className={styles.prepSteps}>
                {PREP_STEPS.map((s, i) => (
                  <div className={styles.prepStep} key={s.title}>
                    <div className={styles.psNum}>{i + 1}</div>
                    <div className={styles.psBody}>
                      <div className={styles.psTitle}>{s.title}</div>
                      <div className={styles.psDesc}>{s.desc}</div>
                      {s.note && <div className={styles.psNote}>{s.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <h3 className={styles.subHead}>
                Common <em>questions.</em>
              </h3>
              <div className={styles.faq}>
                {PREP_FAQ.map((f, i) => (
                  <div
                    key={f.q}
                    className={[styles.faqItem, openFaq === i && styles.faqItemOpen]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <button
                      type="button"
                      className={styles.faqQ}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className={styles.faqQText}>{f.q}</span>
                      <span className={styles.faqArrow}>+</span>
                    </button>
                    {openFaq === i && <div className={styles.faqA}>{f.a}</div>}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "hiv" && (
            <>
              <h2 className={styles.h}>
                HIV — what you need to <em>know.</em>
              </h2>
              <p className={styles.sub}>
                Honest, current information. HIV is a manageable condition. With
                treatment, people with HIV live full, long lives and can't pass the
                virus on.
              </p>
              <div className={styles.hivBanner}>
                <h3>
                  Undetectable = <em>Untransmittable.</em>
                </h3>
                <p>
                  U=U is one of the most important facts in sexual health. People
                  living with HIV who are on effective treatment and have an
                  undetectable viral load cannot sexually transmit HIV to their
                  partners. This is scientifically established and endorsed by every
                  major health authority.
                </p>
                <div className={styles.hivStats}>
                  <div className={styles.hivStat}>
                    <div className={styles.n}>U=U</div>
                    <div className={styles.l}>Undetectable = Untransmittable. Confirmed by the CDC, WHO, and 400+ health organisations globally.</div>
                  </div>
                  <div className={styles.hivStat}>
                    <div className={styles.n}>97%</div>
                    <div className={styles.l}>of people on treatment in Portugal achieve an undetectable viral load within 6 months.</div>
                  </div>
                  <div className={styles.hivStat}>
                    <div className={styles.n}>Free</div>
                    <div className={styles.l}>HIV treatment (antiretrovirals) is free for all residents through the SNS.</div>
                  </div>
                </div>
                <div className={styles.hivBtns}>
                  <Button to={linkToPath("QueerPulse Communities.html")} variant="primary">
                    Find HIV support services
                  </Button>
                </div>
              </div>
              <div className={styles.infoGrid}>
                {HIV_INFO.map((c) => (
                  <div className={styles.infoCard} key={c.title}>
                    <div className={styles.infoIcon}>{c.icon}</div>
                    <div className={styles.infoTitle}>{c.title}</div>
                    <div className={styles.infoBody}>{c.body}</div>
                    {c.link &&
                      (c.link.external ? (
                        <a href={c.link.href} className={styles.infoLink}>
                          {c.link.label}
                        </a>
                      ) : (
                        <Link to={c.link.href} className={styles.infoLink}>
                          {c.link.label}
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "guides" && (
            <>
              <h2 className={styles.h}>
                Guides &amp; <em>questions.</em>
              </h2>
              <p className={styles.sub}>
                Short guides and a place to ask anything anonymously. Answered by
                community members with relevant experience — not bots.
              </p>
              <div className={styles.infoGrid}>
                {GUIDES.map((g) => (
                  <div className={styles.infoCard} key={g.title}>
                    <div className={styles.infoIcon}>{g.icon}</div>
                    <div className={styles.infoTitle}>{g.title}</div>
                    <div className={styles.infoBody}>{g.body}</div>
                    {g.link &&
                      (g.link.href === "#" ? (
                        <span className={styles.infoLink}>{g.link.label}</span>
                      ) : (
                        <Link to={g.link.href} className={styles.infoLink}>
                          {g.link.label}
                        </Link>
                      ))}
                  </div>
                ))}
              </div>
              <div className={styles.anonBox}>
                <h3>Ask anything — anonymously.</h3>
                <p>
                  Submit a question to the community. Answered by members with
                  relevant knowledge. Nothing is shared or linked to your account.
                </p>
                <textarea
                  className={styles.anonInput}
                  placeholder="Your question — no detail is too small or too embarrassing…"
                />
                <div className={styles.anonFoot}>
                  <span className={styles.anonNote}>
                    Completely anonymous. No account required.
                  </span>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => showToast("Question submitted anonymously", "success")}
                  >
                    Submit question
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Your health <em>matters.</em>
          </h2>
          <p className={styles.outroSub}>
            Questions, concerns, or just not sure where to start — the community is
            here.
          </p>
          <div className={styles.outroBtns}>
            <Button to={linkToPath("QueerPulse Wellbeing.html")} variant="primary" size="lg">
              Wellbeing resources
            </Button>
            <Button to={linkToPath("QueerPulse Communities.html")} variant="ghost-dark" size="lg">
              Find peer support
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
