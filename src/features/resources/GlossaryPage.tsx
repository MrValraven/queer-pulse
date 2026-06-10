import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./GlossaryPage.module.css";
import { Button } from '../../shared/components/ui'

type TypeKind = "" | "essential" | "med" | "local";
interface Term {
  name: string;
  type: string;
  typeKind: TypeKind;
  def: ReactNode;
  meta?: ReactNode;
  search: string;
}
interface LetterBlock {
  letter: string;
  terms: Term[];
}

const Q101 = linkToPath("QueerPulse 101.html");
const TRANS_HEALTH = linkToPath("QueerPulse Trans Healthcare.html");
const CONTACT = linkToPath("QueerPulse Contact.html");

const BLOCKS: LetterBlock[] = [
  {
    letter: "A",
    terms: [
      { name: "Aro/ace spectrum", type: "Identity", typeKind: "", def: (<>Umbrella terms for people on the aromantic or asexual spectra — including grey-ace, demi, and aro-but-allosexual. <em>Not the same as celibate.</em> See also <b>romantic orientation</b>.</>), meta: (<>Cross-references: <Link to={Q101}>Queer 101 → Beyond LGB</Link></>), search: "aro ace spectrum aromantic asexual celibate romantic orientation" },
      { name: "Affirming care", type: "Healthcare", typeKind: "med", def: (<>A clinical approach that treats the patient's stated identity as the working truth, rather than something to interrogate or override. The opposite of <em>"gatekeeper"</em> care. WPATH guidelines describe it; in Portugal, Lei n.º 38/2018 codifies parts of it.</>), meta: (<>See also: <Link to={TRANS_HEALTH}>Trans Healthcare guide</Link></>), search: "affirming care healthcare clinical wpath gatekeeper" },
      { name: "Anjos", type: "Lisbon", typeKind: "local", def: (<>A central Lisbon neighbourhood that, since the late 2010s, has hosted much of the city's organised queer community space — including Café Beirão, Clínica do Largo, and the Trans Hub office. <b>Not a "gayborhood" in the Castro sense.</b> The community is woven into the existing residential fabric.</>), search: "anjos lisbon neighbourhood community space" },
      { name: "Assigned at birth", type: "Essential", typeKind: "essential", def: (<>As in AFAB / AMAB — the sex marker placed on a person's birth certificate. The phrasing emphasises that this was a decision <em>made by others</em>, often without examination. Useful in medical contexts; less needed in social ones.</>), search: "assigned at birth afab amab sex marker" },
    ],
  },
  {
    letter: "B",
    terms: [
      { name: "Binary", type: "Identity", typeKind: "", def: (<>Of gender systems that recognise only two categories (man / woman). The word is often a shorthand for <em>limitations</em>, not a description of any individual.</>), search: "binary gender man woman" },
      { name: "Bichas", type: "Portuguese · in-community", typeKind: "local", def: (<>A reclaimed Portuguese term, roughly equivalent to "queer" used as a noun, used widely within the community. <em>Reclamation matters here.</em> Use only if you're inside; otherwise, opt for <b>queer</b>.</>), search: "bichas portuguese reclaimed queer" },
      { name: "Butch / Femme", type: "Identity · contested", typeKind: "", def: (<>Long-standing terms for masc and femme presentations within queer (particularly lesbian and trans-masc) communities. <em>Identity, not costume.</em> Discussions about who can use them are ongoing — we don't adjudicate.</>), search: "butch femme masc presentation lesbian" },
    ],
  },
  {
    letter: "C",
    terms: [
      { name: "Cis", type: "Essential", typeKind: "essential", def: (<>Short for cisgender — describing a person whose gender matches the one they were assigned at birth. <em>Not an insult, not a slur, just a descriptor</em> — symmetric to "trans". Latin: <i>cis-</i> means "on this side of".</>), search: "cis cisgender descriptor" },
      { name: "Chosen family", type: "Essential", typeKind: "essential", def: (<>The set of intentional, ongoing relationships of care that queer people build, often in parallel with (and sometimes in place of) biological family. <b>Includes lovers, exes, friends, neighbours, and the person who calls if you don't post for three days.</b></>), search: "chosen family care relationships" },
      { name: "Coming out", type: "Essential", typeKind: "essential", def: (<>The ongoing act of disclosing a non-heterosexual or non-cisgender identity. <em>Not a one-time event.</em> Most queer people come out hundreds of times — to coworkers, to taxi drivers, to landlords, to GPs.</>), meta: (<>See also: <Link to={linkToPath("QueerPulse Coming Out.html")}>Coming-Out Support</Link></>), search: "coming out disclosing identity" },
    ],
  },
  {
    letter: "D",
    terms: [
      { name: "Deadname", type: "Healthcare", typeKind: "med", def: (<>The name a trans person no longer uses, typically the one assigned at birth. <em>Don't use it</em> — even with permission, even in the past tense, even at a doctor's office. Lei n.º 38/2018 permits self-determination of name on most records in Portugal.</>), search: "deadname trans name" },
      { name: "Drag", type: "Performance", typeKind: "", def: (<>A theatrical performance of gender. <em>Not the same as being trans.</em> Drag has a queer history, but plenty of straight and cis people do it; plenty of trans people don't.</>), search: "drag performance gender" },
    ],
  },
  {
    letter: "V",
    terms: [
      { name: "Vouch", type: "QueerPulse · platform", typeKind: "local", def: (<>On QueerPulse, to <em>vouch</em> for someone is to attach your name to theirs as a marker of community trust. Used in three places: <b>member onboarding</b> (you vouch for who you're inviting), <b>safe spaces</b> (you vouch a venue lives up to the pact), and <b>service offers</b> (you vouch a therapist or skill-provider is what they say). Vouches are personal — they accumulate, they don't get rated.</>), search: "vouch trust onboarding safe spaces" },
    ],
  },
  {
    letter: "W",
    terms: [
      { name: "WPATH", type: "Healthcare", typeKind: "med", def: (<>The World Professional Association for Transgender Health. Publishes the <em>Standards of Care</em>, the most widely-used clinical guidelines for trans-affirming care. Currently on version 8. Used by most Lisbon clinicians who self-identify as trans-affirming.</>), search: "wpath standards of care transgender health" },
    ],
  },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const HAS = new Set(["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "V", "W"]);

const TYPE_CLASS: Record<TypeKind, string> = {
  "": "",
  essential: "typeEssential",
  med: "typeMed",
  local: "typeLocal",
};

export function GlossaryPage() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const blocks = BLOCKS.map((b) => ({
    ...b,
    terms: b.terms.filter((t) => !q || t.search.includes(q) || t.name.toLowerCase().includes(q)),
  })).filter((b) => b.terms.length > 0);

  const empty = q && blocks.length === 0;

  return (
    <PageShell>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              Reference · maintained by Trans Hub &amp; Wellbeing
            </div>
            <h1 className={styles.h1}>
              A working <em>glossary.</em>
            </h1>
            <p className={styles.dek}>
              Words used here — across the platform, in the magazine, at gatherings.{" "}
              <b>Definitions are working drafts.</b> Where a term is contested, we say
              so. Where it's Lisbon-specific, we mark it.{" "}
              <em>Suggest edits at the bottom; the editors look at them weekly.</em>
            </p>
          </div>
        </section>

        <div className={styles.searchRow}>
          <div className={styles.searchInner}>
            <div className={styles.searchInput}>
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search terms · 142 entries"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className={styles.langToggle}>
              <button type="button" className={styles.langActive}>
                English
              </button>
              <button
                type="button"
                onClick={() => showToast("PT translations coming", "info")}
              >
                Português
              </button>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.alphabet}>
            {ALPHABET.map((l) => (
              <a
                key={l}
                href={`#${l}`}
                className={HAS.has(l) ? styles.has : styles.no}
              >
                {l}
              </a>
            ))}
          </div>

          {blocks.map((b) => (
            <div className={styles.letterBlock} id={b.letter} key={b.letter}>
              <div className={styles.letterH}>{b.letter}</div>
              <div className={styles.termList}>
                {b.terms.map((t) => (
                  <div className={styles.term} key={t.name}>
                    <div className={styles.termRow}>
                      <div className={styles.termName}>{t.name}</div>
                      <span className={[styles.termType, t.typeKind && styles[TYPE_CLASS[t.typeKind]]].filter(Boolean).join(" ")}>
                        {t.type}
                      </span>
                    </div>
                    <div className={styles.termDef}>{t.def}</div>
                    {t.meta && <div className={styles.termMeta}>{t.meta}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {empty && (
            <div className={styles.noResults}>
              <h3>No terms match</h3>
              <p>Try a different search, or browse alphabetically above.</p>
              <Button to={CONTACT} variant="primary">
                Suggest a term →
              </Button>
            </div>
          )}
        </div>

        <section className={styles.foot}>
          <div className={styles.footInner}>
            <h3>
              Found a term we're <em>missing or wrong about?</em>
            </h3>
            <p>
              This is a working document. Suggestions are read by the editorial team
              weekly and discussed at the monthly assembly.{" "}
              <em>We will get things wrong; we'd rather get them wrong publicly and
              fix them.</em>
            </p>
            <Button to={CONTACT} variant="primary">
              Suggest an edit
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
