import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./MentalHealthPage.module.css";
import { Button } from '../../shared/components/ui'

const FORUM = linkToPath("QueerPulse Forum.html");
const MENTORSHIP = linkToPath("QueerPulse Mentorship.html");

interface Therapist {
  name: string;
  creds: string;
  langs: string[];
  specs: string[];
  format: string;
  note: string;
  avBg: string;
  avCol: string;
}

const THERAPISTS: Therapist[] = [
  { name: "Dr. Marta Silva", creds: "Clinical Psychologist · COP registered", langs: ["Portuguese", "English"], specs: ["Trauma", "Identity", "LGBTQ+"], format: "In-person · Chiado", note: '"My practice is specifically focused on LGBTQ+ clients. I have been doing this for 12 years and will not make you explain your identity to me."', avBg: "rgba(74,140,111,.16)", avCol: "var(--jade)" },
  { name: "James Chen", creds: "Psychotherapist · UKCP registered", langs: ["English", "Mandarin"], specs: ["Expat adjustment", "Relationships", "Anxiety"], format: "Online only", note: '"I work with queer expats specifically — I understand the particular stress of building a life in a new country while navigating your identity."', avBg: "rgba(232,119,90,.16)", avCol: "var(--accent-ink)" },
  { name: "Ana Lima", creds: "Psychologist · OPP registered", langs: ["Portuguese", "Spanish"], specs: ["Sexuality", "Depression", "Family"], format: "In-person & online · Arroios", note: '"I offer a non-judgmental space for people navigating sexual orientation, gender identity, and family relationships. Sliding scale available."', avBg: "rgba(45,27,61,.12)", avCol: "var(--plum)" },
  { name: "Sarah Okafor", creds: "Counselling Psychologist · BPS chartered", langs: ["English", "French"], specs: ["Intersectionality", "Trauma", "Race & identity"], format: "Online only", note: '"I work at the intersection of race, queerness, and displacement. If you\'ve struggled to find a therapist who holds all of it, I do."', avBg: "rgba(122,82,184,.14)", avCol: "#7A52B8" },
  { name: "Pedro Carvalho", creds: "Psychotherapist · APAF member", langs: ["Portuguese", "English"], specs: ["Coming out", "Couples", "Trans-affirming"], format: "In-person · Príncipe Real", note: '"Queer myself. I have specific experience working with coming-out processes at all ages, trans identities, and queer couples and relationships."', avBg: "rgba(74,140,111,.16)", avCol: "var(--jade)" },
];

const CRISIS: { name: string; num: string; note: string }[] = [
  { name: "SOS Voz Amiga", num: "213 544 545", note: "24h · Portuguese & English" },
  { name: "SNS 24", num: "808 24 24 24", note: "Health line · 24h" },
  { name: "ILGA Portugal", num: "213 887 239", note: "LGBTQ+ support line" },
  { name: "Samaritans (online)", num: "jo@samaritans.org", note: "Email · English · 24h response" },
];

const EXPERIENCES: { title: string; text: string }[] = [
  { title: "Starting over in a new community", text: "Losing your queer social network when you move is a genuine grief. Building a new one takes time and feels unnatural at first. The people who've been here longest remember it — it does get easier, but the early months are hard and it's okay to say so." },
  { title: "Navigating visibility in a new culture", text: "Lisbon is broadly safe but queer visibility works differently here. Some members feel more visible than at home; others feel less. Reading social situations in a second language or culture is exhausting and disorienting in ways that are hard to explain to people who haven't experienced it." },
  { title: "The administrative grind", text: "Visas, NIF, AIMA, healthcare registration, bank accounts that won't open. The bureaucratic weight of building a life in a new country is a documented source of chronic stress. It's not weakness — it's a lot. Naming it as a mental health factor is valid." },
  { title: "Trans and non-binary experiences in a new system", text: "Navigating healthcare, legal documents, and social situations as a trans or non-binary person in Portugal adds a specific layer of stress and labour. Portugal's legal framework is progressive but administrative reality varies. The Trans Hub has specific resources." },
  { title: "Distance from family of origin", text: "Moving to another country often means physical distance from family — chosen or biological. For queer people whose family relationships are complicated or conditional, this distance can be both a relief and its own kind of grief. Both are real at the same time." },
  { title: "Financial anxiety", text: "Lisbon's rising cost of living affects queer expats acutely. Housing insecurity, visa costs, and the pressure to perform a certain kind of queer expat life are all real stressors. The community talks about money honestly — the forum's economics thread is a good start." },
];

const SNS: { num: string; title: string; text: string }[] = [
  { num: "01", title: "Register with a GP first", text: "You need to be registered with a Centro de Saúde before accessing SNS mental health services. Register with your AR card or EU registration certificate and NISS number. Waiting lists for GP registration exist in some areas." },
  { num: "02", title: "GP referral for psychology", text: "Your GP can refer you to a psychologist or psychiatrist through the SNS. Waiting times for the first appointment are typically 3–6 months. For urgent needs, explain severity clearly — this can speed up the referral." },
  { num: "03", title: "Language matters", text: "SNS therapists and psychiatrists typically work in Portuguese. If your Portuguese is limited, private therapy in English is more practical for most expats. Online platforms (BetterHelp, Zenklub) offer English-speaking therapists at lower cost than Lisbon private rates." },
  { num: "04", title: "Private rates in Lisbon", text: "Private therapy ranges from €50–120 per session. Some therapists offer sliding scale fees — it's always worth asking. Several therapists in our directory offer community member rates for QueerPulse members." },
];

const LANGS = ["all", "English", "Portuguese", "Spanish", "French"];

function initials(name: string) {
  return name
    .replace(/Dr\.\s*/, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export function MentalHealthPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState("all");

  const therapists =
    filter === "all"
      ? THERAPISTS
      : THERAPISTS.filter((t) => t.langs.includes(filter));

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Mental Health</div>
          <h1>
            You don't have to be <em>okay.</em>
          </h1>
          <p className={styles.heroSub}>
            Queer-affirming therapists, honest information about accessing mental
            health support in Lisbon, crisis resources, and a community that
            understands what you're carrying — because we're carrying it too.
          </p>
        </div>
      </div>

      <div className={styles.crisisBar}>
        <div className="wrap">
          <div className={styles.crisisInner}>
            <div>
              <div className={styles.crisisLabel}>If you need support now</div>
              <div className={styles.crisisHeading}>
                Crisis &amp; immediate support lines
              </div>
              <p className={styles.crisisSub}>
                These lines are available now. You don't have to be in immediate
                danger to call — if you're struggling, reaching out is enough.
              </p>
            </div>
            <div className={styles.crisisLines}>
              {CRISIS.map((c) => (
                <div className={styles.crisisLine} key={c.name}>
                  <div className={styles.clName}>{c.name}</div>
                  <div className={styles.clNum}>{c.num}</div>
                  <div className={styles.clNote}>{c.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Queer-affirming <em>therapists in Lisbon</em>
            </h2>
            <p>
              Reviewed and recommended by community members. Every therapist here
              has been verified as genuinely queer-affirming — not just "welcoming"
              but experienced with queer lives, identities, and the specific
              pressures of being queer and an expat in Lisbon.
            </p>
          </div>
          <div className={styles.thFilter}>
            <span className={styles.thFilterLabel}>Filter</span>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className={[styles.thChip, filter === l && styles.thChipOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(l)}
              >
                {l === "all" ? "All languages" : l}
              </button>
            ))}
          </div>
          <div className={styles.therapistGrid}>
            {therapists.map((t) => (
              <div className={styles.therapistCard} key={t.name}>
                <div className={styles.tcTop}>
                  <div className={styles.tcAv} style={{ background: t.avBg, color: t.avCol }}>
                    {initials(t.name)}
                  </div>
                  <div>
                    <div className={styles.tcName}>{t.name}</div>
                    <div className={styles.tcCreds}>{t.creds}</div>
                  </div>
                </div>
                <div className={styles.tcTags}>
                  {t.langs.map((l) => (
                    <span key={l} className={`${styles.tcTag} ${styles.tcTagLang}`}>
                      {l}
                    </span>
                  ))}
                  {t.specs.map((s) => (
                    <span key={s} className={styles.tcTag}>
                      {s}
                    </span>
                  ))}
                </div>
                <p className={styles.tcNote}>{t.note}</p>
                <div className={styles.tcFoot}>
                  <span className={styles.tcFormat}>{t.format}</span>
                  <button
                    type="button"
                    className={styles.tcContact}
                    onClick={() => showToast(`Message sent to ${t.name.split(" ").pop()}`, "success")}
                  >
                    Say hello →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.sec} ${styles.alt}`}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Things the community <em>has felt</em>
            </h2>
            <p>
              Being a queer expat in Lisbon comes with specific pressures. Naming
              them isn't complaining — it's the start of dealing with them.
            </p>
          </div>
          <div className={styles.expGrid}>
            {EXPERIENCES.map((e) => (
              <div className={styles.expCard} key={e.title}>
                <div className={styles.expBar} />
                <div>
                  <div className={styles.expTitle}>{e.title}</div>
                  <div className={styles.expText}>{e.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHead}>
            <h2>
              Accessing mental health <em>through the SNS</em>
            </h2>
            <p>
              Portugal's public health system covers mental health, including
              therapy and psychiatry — but access is uneven. Here's what to
              realistically expect.
            </p>
          </div>
          <div className={styles.snsGrid}>
            {SNS.map((s) => (
              <div className={styles.snsCard} key={s.num}>
                <div className={styles.snsNum}>{s.num}</div>
                <div className={styles.snsTitle}>{s.title}</div>
                <div className={styles.snsText}>{s.text}</div>
              </div>
            ))}
          </div>

          <div className={styles.peerStrip}>
            <div>
              <h3>
                Peer support within <em>the community</em>
              </h3>
              <p>
                The mental health peer support group meets monthly. Members share
                experiences, recommend resources, and support each other — no
                professional facilitation, just honest conversation.
              </p>
            </div>
            <div className={styles.peerBtns}>
              <Button to={FORUM} variant="primary">
                Join the group
              </Button>
              <Button to={MENTORSHIP} variant="ghost-dark">
                Find a peer mentor →
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Asking for help is <em>not small.</em>
          </h2>
          <p className={styles.outroSub}>
            It's one of the harder things. The community is here.
          </p>
          <Button to={FORUM} variant="primary" size="lg">
            Talk to someone
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
