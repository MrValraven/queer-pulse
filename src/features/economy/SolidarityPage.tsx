import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./SolidarityPage.module.css";
import { Button } from '../../shared/components/ui'

type Cat = "therapy" | "legal" | "medical" | "dental" | "vet" | "finance" | "body";
type Tint = "coral" | "jade" | "plum";

interface Practitioner {
  id: string;
  name: string;
  cat: Cat;
  spec: string;
  hood: string;
  langs: string[];
  isMember: boolean;
  range: string;
  scaleNote: string;
  desc: string;
  tags: string[];
  tint: Tint;
}

const PRACTITIONERS: Practitioner[] = [
  { id: "p1", name: "Mariana Costa", cat: "therapy", spec: "Psychotherapy & EMDR", hood: "Mouraria", langs: ["PT", "EN"], isMember: true, range: "€30 – €80", scaleNote: "Income-based. First session free to assess fit. No proof required — you set the amount.", desc: "Queer-affirming, trauma-informed psychotherapy. Works with gender identity, relationship structures, and life transitions. In-person and remote.", tags: ["LGBTQ+", "trauma", "relationships", "trans-affirming"], tint: "jade" },
  { id: "p2", name: "Beatriz Melo", cat: "legal", spec: "Immigration & Employment Law", hood: "Príncipe Real", langs: ["PT", "EN", "FR"], isMember: false, range: "€0 – €120/hr", scaleNote: "Name-your-price for community members earning under €1,400/month. Full rate for others.", desc: "Specialises in NHR applications, D7 visas, residency renewals, and employment contracts. Bilingual consultations in PT, EN, or FR.", tags: ["visas", "NHR", "employment", "immigration"], tint: "plum" },
  { id: "p3", name: "Dr. Luís Ferreira", cat: "medical", spec: "General Practice / SNS", hood: "Intendente", langs: ["PT", "EN"], isMember: false, range: "Free (SNS) or €35 private", scaleNote: "SNS patients pay nothing. Private appointments for those without a centros de saúde allocation — sliding scale for income under €1,200/month.", desc: "LGBTQ+-affirming GP with experience in trans health. Provides referrals for gender dysphoria care within the SNS system. No judgement, ever.", tags: ["GP", "trans-affirming", "SNS", "HRT referrals"], tint: "jade" },
  { id: "p4", name: "Catarina Luz", cat: "therapy", spec: "Sex & Relationship Therapy", hood: "Santos", langs: ["PT", "EN", "ES"], isMember: true, range: "€25 – €90", scaleNote: "Sliding scale based on income bracket. Three brackets: under €900, €900–1500, above €1500. You self-select, no questions asked.", desc: "Relational and somatic sex therapy. Works with queer, poly, and kinky clients. No prior knowledge of your sexuality or relationship structure required.", tags: ["sex therapy", "poly", "kink", "somatic"], tint: "coral" },
  { id: "p5", name: "Ricardo Pais", cat: "finance", spec: "Tax & Freelancer Accounting", hood: "Alfama", langs: ["PT", "EN"], isMember: true, range: "€40 – €150", scaleNote: "Flat rate for recibos verdes setup (€40). Annual IRS filing: sliding scale by income. Earners under €1,000/month pay €40.", desc: "Certified accountant specialising in freelancers and self-employed community members. Recibos verdes, IRS, NHR regime, invoicing. Patient and thorough.", tags: ["tax", "freelance", "recibos verdes", "IRS"], tint: "plum" },
  { id: "p6", name: "Sofia Dinis", cat: "dental", spec: "General Dentistry", hood: "Mouraria", langs: ["PT", "EN"], isMember: false, range: "€0 – €60 consultation", scaleNote: "Consultation and check-up on sliding scale. Treatment costs negotiated separately — no one is turned away for cost alone.", desc: "Queer-welcoming dental practice. Trans patients: preferred name and pronouns on file from the first visit. Consultations in PT or EN.", tags: ["dental", "LGBTQ+ welcoming", "trans-affirming"], tint: "jade" },
  { id: "p7", name: "Nuno Gaspar", cat: "vet", spec: "Small Animal Veterinary Care", hood: "Estrela", langs: ["PT", "EN"], isMember: false, range: "€15 – €55 consultation", scaleNote: "Consultation fee sliding scale. Treatments and medications at cost for verified community members in financial difficulty.", desc: "Queer-owned veterinary practice. Cats, dogs, rabbits, and some small mammals. Emergency appointments prioritised for community members in crisis.", tags: ["pets", "cats", "dogs", "emergency"], tint: "coral" },
  { id: "p8", name: "Ana Branco", cat: "body", spec: "Physiotherapy & Somatic Work", hood: "Bairro Alto", langs: ["PT", "EN"], isMember: true, range: "€25 – €75", scaleNote: "You set the amount within the range. Sessions are 50 minutes. No documentation needed.", desc: "LGBTQ+-affirming physiotherapy and body-based therapy. Works with chronic pain, post-surgery recovery, and body-gender relationships. Trans clients very welcome.", tags: ["physiotherapy", "trans", "chronic pain", "post-surgery"], tint: "jade" },
  { id: "p9", name: "Joana Teixeira", cat: "therapy", spec: "Psychiatry & Medication", hood: "Príncipe Real", langs: ["PT", "EN"], isMember: false, range: "€50 – €150", scaleNote: "Sliding scale by income. Earners under €1,000/month: €50. Community members can request a fee review at any time.", desc: "Psychiatrist with expertise in gender dysphoria, trauma, and complex PTSD. Provides psychiatric support letters for gender-affirming procedures.", tags: ["psychiatry", "HRT support", "gender dysphoria", "PTSD"], tint: "plum" },
  { id: "p10", name: "Tiago Alves", cat: "legal", spec: "Family & Housing Law", hood: "Cais do Sodré", langs: ["PT", "EN"], isMember: false, range: "€0 – €100/hr", scaleNote: "Pro bono for community members facing housing discrimination or family exclusion. Sliding scale for other cases.", desc: "Specialises in housing rights, eviction defence, same-sex family law, and adoption. Has represented clients in hate-crime civil proceedings.", tags: ["housing", "family law", "adoption", "discrimination"], tint: "coral" },
  { id: "p11", name: "Marta Santos", cat: "body", spec: "Massage & Trauma-Sensitive Bodywork", hood: "Graça", langs: ["PT", "EN"], isMember: true, range: "€20 – €60", scaleNote: "Name-your-price within range. Consent and boundaries discussed before every session. No pressure, ever.", desc: "Trauma-sensitive massage practitioner. Works with survivors, people in gender transition, and anyone whose relationship with their body is complex.", tags: ["massage", "trauma-sensitive", "trans-affirming"], tint: "jade" },
  { id: "p12", name: "Pedro Rocha", cat: "medical", spec: "Sexual Health & HIV Medicine", hood: "Intendente", langs: ["PT", "EN", "ES"], isMember: false, range: "Free – €40", scaleNote: "SNS referrals: free. Private consultations: sliding scale. PrEP access consultations always free for first visit.", desc: "Specialist in sexual health, HIV prevention and treatment, PrEP, and PEP. Works with Checkpoint and GAT. No judgment, complete confidentiality.", tags: ["HIV", "PrEP", "PEP", "sexual health"], tint: "plum" },
];

const TINT_BG: Record<Tint, string> = {
  coral: "rgba(232,119,90,.14)",
  jade: "rgba(74,140,111,.14)",
  plum: "rgba(45,27,61,.1)",
};
const TINT_FG: Record<Tint, string> = {
  coral: "#C85A40",
  jade: "#4A8C6F",
  plum: "#2D1B3D",
};

const HOW: { n: string; title: string; body: string }[] = [
  { n: "01", title: "Find your practitioner", body: "Filter by profession, neighbourhood, or language. Every listing includes how their sliding scale works — no surprises." },
  { n: "02", title: "Contact them directly", body: "Reach out via the platform or email. You set the conversation — you do not have to explain your financial situation to anyone else first." },
  { n: "03", title: "Pay what you can", body: "Each practitioner sets their own range and approach. Some use income-based scales, others name-your-price. The listing tells you how." },
];

const FILTERS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "therapy", label: "Therapy" },
  { id: "legal", label: "Legal" },
  { id: "medical", label: "Medical" },
  { id: "dental", label: "Dental" },
  { id: "vet", label: "Vet" },
  { id: "finance", label: "Accountancy" },
  { id: "body", label: "Bodywork" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
}

export function SolidarityPage() {
  const [cat, setCat] = useState<Cat | "all">("all");
  const [query, setQuery] = useState("");
  const messages = linkToPath("QueerPulse Messages.html");
  const q = query.toLowerCase();

  const items = PRACTITIONERS.filter((p) => {
    if (cat !== "all" && p.cat !== cat) return false;
    if (q) {
      const hay = `${p.name}${p.spec}${p.hood}${p.tags.join(" ")}${p.desc}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.eye}>Community care</div>
          <h1 className={styles.title}>
            Pay what
            <br />
            <em>you can.</em>
          </h1>
          <p className={styles.sub}>
            Professionals from the QueerPulse community who offer sliding-scale
            fees — because access to good care shouldn't depend on what you earn.
          </p>
          <div className={styles.note}>
            All practitioners have been verified by at least two community members.
          </div>
        </div>
      </header>

      <section className={styles.howStrip}>
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

      <div className={styles.filterBar}>
        <div className={styles.fbInner}>
          <span className={styles.fbLabel}>Profession</span>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={[styles.chip, cat === f.id && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setCat(f.id)}
            >
              {f.label}
            </button>
          ))}
          <div className={styles.fbSep} />
          <div className={styles.cbSearch}>
            <input
              type="text"
              placeholder="Search by name, area…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.count}>
            <b>{items.length}</b> practitioner{items.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {items.length === 0 && (
              <div className={styles.empty}>
                <p>No practitioners match — try different filters.</p>
              </div>
            )}
            {items.map((p) => (
              <article className={styles.pc} key={p.id}>
                <div className={styles.pcTop}>
                  <div
                    className={styles.pcAv}
                    style={{ background: TINT_BG[p.tint], color: TINT_FG[p.tint] }}
                  >
                    {initials(p.name)}
                  </div>
                  <div className={styles.pcMeta}>
                    <div className={styles.pcName}>{p.name}</div>
                    <div className={styles.pcSpec}>
                      {p.spec} · {p.hood}
                    </div>
                  </div>
                  <span
                    className={[
                      styles.pcBadge,
                      p.isMember ? styles.badgeMember : styles.badgeVerified,
                    ].join(" ")}
                  >
                    {p.isMember ? "Member" : "Verified"}
                  </span>
                </div>
                <div className={styles.pcPricing}>
                  <div className={styles.pcPriceLabel}>Sliding scale</div>
                  <div className={styles.pcPriceRange}>{p.range}</div>
                  <div className={styles.pcPriceNote}>{p.scaleNote}</div>
                </div>
                <div className={styles.pcDesc}>{p.desc}</div>
                <div className={styles.pcTags}>
                  {p.tags.map((t) => (
                    <span key={t} className={styles.ptag}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className={styles.pcFoot}>
                  <span className={styles.pcLang}>{p.langs.join(" · ")}</span>
                  <Link to={messages} className={styles.pcContact}>
                    Contact →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.regStrip}>
            <div className={styles.rsText}>
              <h3>
                Do you offer
                <br />
                <em>solidarity pricing?</em>
              </h3>
              <p>
                If you are a professional in the community and already offer
                sliding-scale fees, add yourself to this list. It takes ten minutes
                and helps people find you.
              </p>
            </div>
            <div className={styles.rsCta}>
              <Button to={linkToPath("QueerPulse Invite.html")} variant="primary" size="lg">
                Register your practice
              </Button>
              <Link to={linkToPath("QueerPulse Contact.html")} className={styles.rsCtaLink}>
                Questions first? Get in touch
              </Link>
            </div>
          </div>
        </div>
      </main>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Care is a <em>collective act.</em>
          </h2>
          <p className={styles.outroSub}>
            QueerPulse connects the community to professionals who believe in access
            as much as you do.
          </p>
          <Button to={linkToPath("QueerPulse Invite.html")} variant="primary" size="lg">
            Join the network
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
