import { useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./VisasPage.module.css";
import { Button } from '../../shared/components/ui'

type TabId = "eu" | "d7" | "d8" | "work" | "partner" | "citizenship";

const LEGAL = linkToPath("QueerPulse Legal.html");
const FORUM = linkToPath("QueerPulse Forum.html");
const ARRIVING = linkToPath("QueerPulse Arriving.html");

interface InfoCard {
  eyebrow: string;
  title: string;
  body: string;
  tag?: { label: string; kind: "jade" | "accent" };
  link?: { label: string; href: string };
}
interface Step {
  title: string;
  text: string;
  note?: string;
}
interface Tab {
  id: TabId;
  label: string;
  headTitle: ReactNode;
  headText: string;
  cards: InfoCard[];
  steps?: Step[];
  note?: ReactNode;
}

const ROUTES: { name: string; desc: string; to: string; tab: TabId }[] = [
  { name: "EU / EEA citizen", desc: "Free movement applies. Registration is simple but required.", to: "EU Citizens →", tab: "eu" },
  { name: "Remote worker / passive income", desc: "Living on savings, rental income, freelance, or remote employment.", to: "D7 Visa →", tab: "d7" },
  { name: "Digital nomad", desc: "Working remotely for a non-Portuguese employer, higher income.", to: "Digital Nomad (D8) →", tab: "d8" },
  { name: "Job offer in Portugal", desc: "You have or are seeking employment with a Portuguese entity.", to: "Work Visas →", tab: "work" },
  { name: "Joining a partner here", desc: "Your partner is in Portugal already or moving with you.", to: "Bringing a Partner →", tab: "partner" },
];

const TABS: Tab[] = [
  {
    id: "eu",
    label: "EU Citizens",
    headTitle: (<>EU &amp; EEA <em>citizens</em></>),
    headText: "EU and EEA citizens have the right to live and work in Portugal without a visa. You still need to register — and for queer couples, there are specific things to know about bringing a non-EU partner.",
    cards: [
      { eyebrow: "Registration", title: "Certificado de Registo", body: "EU citizens staying more than 3 months must register at their local Câmara Municipal. You'll need your passport, proof of address, and proof of income or employment. The certificate is usually issued the same day. Cost: €15.", tag: { label: "Simple, low cost", kind: "jade" } },
      { eyebrow: "Your rights", title: "What EU residency gives you", body: "Full access to the SNS health system (with NISS), the right to work without restriction, the right to vote in local and European elections, and the right to bring family members. After 5 years of continuous legal residence, you can apply for permanent residency or citizenship." },
      { eyebrow: "Non-EU partner", title: "Family reunification for same-sex partners", body: "If you're an EU citizen and your partner is not, they can join you in Portugal under EU free movement rules — including same-sex spouses and registered partners. The EU Court of Justice (Coman ruling, 2018) established that EU member states must recognise same-sex spouses for free movement purposes even if they don't have same-sex marriage domestically.", tag: { label: "Full partner rights", kind: "jade" }, link: { label: "Partner visa details →", href: "#" } },
    ],
    note: (<><strong>Community note:</strong> "The Câmara process was genuinely easy. The more annoying step is getting your NIF and NISS sorted — do both as early as possible, you'll need them for everything." — <strong>Member, moved from Germany</strong></>),
  },
  {
    id: "d7",
    label: "D7 — Passive Income",
    headTitle: (<>D7 — <em>Passive Income Visa</em></>),
    headText: "The D7 is Portugal's \"passive income\" or \"retirement\" visa. Despite the name, it's used by anyone with a stable income from remote work, freelancing, pensions, rental income, or investments. One of the most popular routes for queer people relocating to Portugal.",
    cards: [
      { eyebrow: "Who it's for", title: "Eligibility", body: "Non-EU citizens who can demonstrate a stable passive or remote income. The minimum income threshold is roughly €820/month (the Portuguese minimum wage), but some consulates want to see significantly more. Applications are made at the Portuguese consulate in your home country before arriving.", tag: { label: "Apply before arriving", kind: "accent" } },
      { eyebrow: "What you get", title: "Visa conditions", body: "Initial visa valid for 4 months; exchange for a 2-year residency permit (Autorização de Residência) on arrival in Portugal. Renewable for 3 years, then permanent residency. You must spend at least 6 months per year in Portugal to maintain it. Partners and dependent children can be included." },
      { eyebrow: "Tax", title: "IFICI tax regime", body: "Portugal replaced the NHR scheme at the end of 2023 with the IFICI regime (informally called NHR 2.0). It's now targeted at qualifying professions (tech, research, arts). General D7 holders no longer qualify automatically. Your income will be taxed as a standard resident. Get tax advice before moving.", link: { label: "Tax advice contacts →", href: LEGAL } },
    ],
    steps: [
      { title: "Apply at the Portuguese consulate in your country", text: "Submit proof of income, clean criminal record, health insurance, and proof of accommodation in Portugal.", note: "2–8 weeks processing" },
      { title: "Arrive in Portugal with your visa", text: "You have 4 months to book your AIMA appointment and exchange your visa for a residency permit." },
      { title: "AIMA appointment", text: "AIMA (replaced SEF in 2023) handles residency permits. Book early — waits can be long. Bring all original documents.", note: "Book online at aima.gov.pt" },
      { title: "Receive your AR card", text: "Your Autorização de Residência card is your proof of legal residency. Keep it safe — it's used for everything." },
    ],
    note: (<><strong>Community note:</strong> "AIMA appointments are the bottleneck right now. Book as soon as you land — even if it's 3 months out. Having a lawyer help with the initial consulate application saved us from a rejection." — <strong>Member, moved from Canada</strong></>),
  },
  {
    id: "d8",
    label: "Digital Nomad (D8)",
    headTitle: (<>Digital Nomad <em>Visa (D8)</em></>),
    headText: "Portugal's D8 visa, introduced in 2022, is designed for remote workers employed by or providing services to companies outside Portugal. Higher income threshold than D7 but increasingly popular.",
    cards: [
      { eyebrow: "Requirements", title: "What you need to qualify", body: "Proof of remote employment or contracts with non-Portuguese clients. Income requirement is typically 4× the Portuguese minimum wage (roughly €3,280/month). Health insurance with Portugal coverage. Clean criminal record. Portuguese NIF (can be obtained before the visa in some cases).", tag: { label: "Higher income bar than D7", kind: "accent" } },
      { eyebrow: "Process", title: "How to apply", body: "Like the D7, applications are made at the Portuguese consulate before arrival. On arrival, you exchange for a 2-year residency permit. Family members (including same-sex partners) can be included on the application or apply for family reunification after you receive your permit." },
      { eyebrow: "IFICI / Tax", title: "Tax treatment", body: "D8 holders working in qualifying tech or research roles may qualify for the IFICI regime (20% flat income tax for up to 10 years). This is not automatic — you must apply and your profession must qualify. Check with a tax specialist before assuming you'll benefit.", link: { label: "Tax advice →", href: LEGAL } },
    ],
    note: (<><strong>Community note:</strong> "D8 was the right route for me — I work for a UK company. The income requirement was challenging to prove but the consulate was clear about what they wanted. The whole process took about four months." — <strong>Member, moved from the UK</strong></>),
  },
  {
    id: "work",
    label: "Work Visas",
    headTitle: (<>Work <em>visas</em></>),
    headText: "If you have a job offer from a Portuguese employer, or are seeking one, there are specific visa routes. These are generally more straightforward than passive income visas but require employer involvement.",
    cards: [
      { eyebrow: "D1 visa", title: "Employment visa", body: "The standard route for non-EU workers with a job offer from a Portuguese employer. Your employer usually needs to show they couldn't fill the role with an EU citizen first, though this requirement is often waived in practice for skilled roles. Apply at the consulate with your employment contract." },
      { eyebrow: "Job seeker", title: "Job Seeker Visa", body: "180-day visa allowing you to come to Portugal to find work. Requires proof of sufficient funds and qualifications. Once you find a job, you can convert to a D1 work visa without leaving the country. Useful if you want to arrive before securing employment.", tag: { label: "180 days to find work", kind: "jade" } },
      { eyebrow: "Self-employed", title: "Independent worker (D2)", body: "For freelancers and independent professionals who have identified clients or opportunities in Portugal. You'll need a business plan and evidence of prospective income. Registering as a trabalhador independente (recibos verdes) is the tax structure most self-employed residents use." },
    ],
  },
  {
    id: "partner",
    label: "Bringing a Partner",
    headTitle: (<>Bringing a <em>partner</em></>),
    headText: "Portugal recognises same-sex marriage, civil partnership, and long-term cohabitation. What this means for residency depends on your nationalities and which visa route you're using — but the community news is broadly good.",
    cards: [
      { eyebrow: "Same-sex marriage", title: "Portugal fully recognises your marriage", body: "Portugal has recognised same-sex marriage since 2010. A legal marriage anywhere in the world is recognised for residency purposes in Portugal. Your spouse is entitled to join you under family reunification — regardless of their nationality or the country where you married.", tag: { label: "Full legal recognition", kind: "jade" } },
      { eyebrow: "Not married", title: "Partners without formal status", body: "If you're not married, long-term cohabitation (união de facto, typically 2+ years) is recognised for family reunification purposes. You'll need to document your relationship — shared bills, joint accounts, correspondence. Getting married or entering a civil partnership first is often simpler administratively." },
      { eyebrow: "EU citizen + non-EU partner", title: "The Coman ruling", body: "The 2018 EU Court of Justice ruling (Coman v. Romania) established that EU member states must recognise same-sex spouses of EU citizens for the purposes of free movement — even countries that don't have same-sex marriage. This means an EU citizen can bring their same-sex spouse to Portugal regardless of their home country's stance.", tag: { label: "EU court protection", kind: "jade" }, link: { label: "Talk to an immigration lawyer →", href: LEGAL } },
      { eyebrow: "Family reunification", title: "The process for partners", body: "Once you have your own residency permit, your partner applies for family reunification at AIMA. They'll need your AR card, proof of the relationship, proof of accommodation, and income evidence. Processing takes 60–90 days. During this time they can usually remain in Portugal on a short-stay visa." },
    ],
    note: (<><strong>Community note:</strong> "We got married at the Conservatória before starting our residency applications — it made everything cleaner. Portugal treated us exactly like any married couple, no complications." — <strong>Member couple, moved from Brazil and UK</strong></>),
  },
  {
    id: "citizenship",
    label: "Citizenship",
    headTitle: (<>Citizenship &amp; <em>permanent residency</em></>),
    headText: "Portugal offers one of the clearer paths to citizenship in Europe. After 5 years of legal residency, you can apply for either permanent residency or naturalisation as a Portuguese citizen.",
    cards: [
      { eyebrow: "Timeline", title: "5 years to citizenship", body: "After 5 years of continuous legal residency, you're eligible to apply for Portuguese citizenship. Requirements: basic Portuguese language (A2 level), clean criminal record, proof of ties to Portugal, and no absence of more than 6 consecutive months or 8 months total during the 5 years.", tag: { label: "EU passport included", kind: "jade" } },
      { eyebrow: "Permanent residency", title: "Alternative to citizenship", body: "You can also apply for permanent residency (Autorização de Residência Permanente) after 5 years. This gives you indefinite right to remain without the language and citizenship requirements. Some people prefer this route while maintaining their original nationality." },
      { eyebrow: "Portuguese language", title: "A2 requirement", body: "The Portuguese language requirement for citizenship is A2 (basic) — conversational rather than fluent. You can demonstrate this via an approved CAPLE or CIPLE test, or by showing Portuguese-medium education. The community forum has recommendations for Portuguese teachers who are queer-friendly.", link: { label: "Language learning resources →", href: FORUM } },
    ],
  },
];

const GROUND: { label: string; title: string; body: string }[] = [
  { label: "First", title: "NIF — Tax number", body: "You need a Número de Identificação Fiscal for almost everything: opening a bank account, signing a lease, buying a phone plan. Get it at the Finanças office with your passport. EU citizens: bring passport. Non-EU: bring passport + address proof. Can also use a fiscal representative service if you're not yet in Portugal." },
  { label: "Second", title: "NISS — Social security", body: "Your Número de Identificação de Segurança Social gives you access to SNS healthcare and records contributions. Register at your local Centro de Emprego e Formação Profissional or Segurança Social office. Required before you can access NHS appointments." },
  { label: "Key office", title: "AIMA", body: "AIMA (Agência para a Integração, Migrações e Asilo) replaced SEF in October 2023. It handles all residency permits, renewals, and family reunification. Book appointments online at aima.gov.pt — waits are long, book immediately on arrival." },
  { label: "Healthcare", title: "SNS access", body: "Register with a GP (Centro de Saúde) in your area using your AR card or EU registration certificate plus NISS. Wait times are long — many community members use private health insurance alongside SNS access. See the Wellbeing page for queer-friendly healthcare providers." },
];

const LAWYERS: { initials: string; bg: string; color: string; name: string; context: string; stars: string; quote: string }[] = [
  { initials: "SM", bg: "rgba(74,140,111,.15)", color: "var(--jade)", name: "Sofia Mendes", context: "Immigration law · Chiado", stars: "★★★★★", quote: '"Handled our same-sex couple application with complete ease. Knew the Coman ruling and how to apply it. Clear pricing, no surprises. Two members have used her this year."' },
  { initials: "JF", bg: "rgba(232,119,90,.15)", color: "var(--accent-ink)", name: "João Figueiredo", context: "Immigration & tax law · Marquês de Pombal", stars: "★★★★★", quote: '"Specialises in D7 and D8 applications. Also handles the IFICI tax regime. Efficient, English-speaking, and experienced with international LGBTQ+ clients."' },
  { initials: "CL", bg: "rgba(45,27,61,.12)", color: "var(--plum)", name: "Carla Lima Advogados", context: "Firm · Arroios", stars: "★★★★☆", quote: '"Good firm for complex situations — non-EU couples, prior visa refusals, cross-border family cases. More expensive than solo practitioners but thorough."' },
];

export function VisasPage() {
  const [active, setActive] = useState<TabId>("eu");
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const selectRoute = (index: number, tab: TabId) => {
    setSelectedRoute(index);
    setActive(tab);
    const el = tabNavRef.current;
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
    }
  };

  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Visas &amp; Residency · Portugal</div>
          <h1>
            Portugal, legally. <em>Your path to residency.</em>
          </h1>
          <p className={styles.heroSub}>
            Practical information about visas, residency, and citizenship in
            Portugal — and what queer couples and families need to know that the
            official guidance doesn't always say clearly.
          </p>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteDot} />
            Community information, not legal advice. Immigration law changes —
            always verify with a specialist.
          </div>
        </div>
      </div>

      <section className={styles.routeSection}>
        <div className="wrap">
          <div className={styles.routeLabel}>
            Where are you <em>starting from?</em>
          </div>
          <div className={styles.routeGrid}>
            {ROUTES.map((r, i) => (
              <button
                key={r.name}
                type="button"
                className={[styles.routeCard, selectedRoute === i && styles.routeSel]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => selectRoute(i, r.tab)}
              >
                <div className={styles.rcName}>{r.name}</div>
                <div className={styles.rcDesc}>{r.desc}</div>
                <div className={styles.rcTo}>{r.to}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.tabNav} ref={tabNavRef}>
        <div className={styles.tabNavInner}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[styles.tabBtn, active === t.id && styles.tabBtnActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActive(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tabContent}>
        <div className="wrap">
          <div className={styles.tabHead}>
            <h2>{tab.headTitle}</h2>
            <p>{tab.headText}</p>
          </div>
          <div className={styles.infoGrid}>
            {tab.cards.map((card) => (
              <div className={styles.infoCard} key={card.title}>
                <div className={styles.icEyebrow}>{card.eyebrow}</div>
                <div className={styles.icTitle}>{card.title}</div>
                <div className={styles.icBody}>{card.body}</div>
                {card.tag && (
                  <span
                    className={[
                      styles.icTag,
                      card.tag.kind === "jade" ? styles.tagJade : styles.tagAccent,
                    ].join(" ")}
                  >
                    {card.tag.label}
                  </span>
                )}
                {card.link && (
                  <div className={styles.icLink}>
                    {card.link.href === "#" ? (
                      <button
                        type="button"
                        onClick={() => setActive("partner")}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", color: "inherit", textDecoration: "underline" }}
                      >
                        {card.link.label}
                      </button>
                    ) : (
                      <Link to={card.link.href}>{card.link.label}</Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {tab.steps && (
            <div className={styles.steps}>
              {tab.steps.map((step, i) => (
                <div className={styles.step} key={step.title}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepInfo}>
                    <div className={styles.stepTitle}>{step.title}</div>
                    <div className={styles.stepText}>{step.text}</div>
                    {step.note && <div className={styles.stepNote}>{step.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab.note && (
            <div className={styles.communityNote}>
              <div className={styles.cnBar} />
              <div className={styles.cnBody}>{tab.note}</div>
            </div>
          )}
        </div>
      </div>

      <section className={styles.groundSec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              On the <em>ground</em>
            </h2>
            <div className={styles.secHeadSub}>
              Practical first steps regardless of your visa route.
            </div>
          </div>
          <div className={styles.groundGrid}>
            {GROUND.map((g) => (
              <div className={styles.groundCard} key={g.title}>
                <div className={styles.gcLabel}>{g.label}</div>
                <div className={styles.gcTitle}>{g.title}</div>
                <div className={styles.gcBody}>{g.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.lawyerSec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Community-reviewed <em>immigration lawyers</em>
            </h2>
          </div>
          <div className={styles.reviewGrid}>
            {LAWYERS.map((l) => (
              <div className={styles.reviewCard} key={l.name}>
                <div className={styles.rvTop}>
                  <div className={styles.rvAv} style={{ background: l.bg, color: l.color }}>
                    {l.initials}
                  </div>
                  <div>
                    <div className={styles.rvName}>{l.name}</div>
                    <div className={styles.rvContext}>{l.context}</div>
                  </div>
                </div>
                <div className={styles.rvStars}>{l.stars}</div>
                <div className={styles.rvQuote}>{l.quote}</div>
              </div>
            ))}
          </div>
          <div className={styles.lawyerCta}>
            <Button to={FORUM} variant="ghost">
              Ask the visa forum thread →
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            You're building a life <em>here.</em>
          </h2>
          <p className={styles.outroSub}>
            The paperwork is temporary. The community is permanent.
          </p>
          <div className={styles.outroBtns}>
            <Button to={ARRIVING} variant="primary" size="lg">
              Settling in guide →
            </Button>
            <Button to={FORUM} variant="ghost-dark" size="lg">
              Ask the community
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
