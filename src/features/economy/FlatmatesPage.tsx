import { useState } from "react";
import { Link } from "react-router-dom";
import { useScrollLock } from "../../shared/hooks";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./FlatmatesPage.module.css";
import { Button } from '../../shared/components/ui'

type ListingType = "seeking" | "offering";

interface Profile {
  id: number;
  name: string;
  pronouns: string;
  type: ListingType;
  neighbourhood: string;
  neighbourhoodLabel: string;
  budget: string;
  budgetRange: number;
  movein: string;
  moveinKey: string;
  note: string;
  tags: string[];
  av: string;
  avBg: string;
  avCol: string;
  since: string;
}

const PROFILES: Profile[] = [
  { id: 1, name: "Rosa M.", pronouns: "she/her", type: "seeking", neighbourhood: "Arroios", neighbourhoodLabel: "Arroios or Mouraria", budget: "€700–900", budgetRange: 800, movein: "July 2026", moveinKey: "jul", note: "I'm a textile designer working from home. I'm a quiet presence — mornings are sacred, I'll have coffee ready if you want it. Looking for a flat where I won't have to explain my relationship history to a flatmate.", tags: ["Early riser", "WFH", "Plant parent", "Quiet household", "Cats welcome"], av: "RM", avBg: "rgba(232,119,90,.16)", avCol: "var(--accent-ink)", since: "Jan 2025" },
  { id: 2, name: "Diogo V.", pronouns: "he/him", type: "offering", neighbourhood: "Marvila", neighbourhoodLabel: "Marvila", budget: "€750 / month", budgetRange: 750, movein: "Available now", moveinKey: "now", note: "Three of us in a warehouse flat in Marvila — a musician, a UX designer (me), and a nurse. Looking for a fourth who's easy-going and doesn't mind the occasional late session. Big kitchen, good light, lots of plants.", tags: ["Sociable", "Musicians welcome", "Late nights fine", "Pets welcome"], av: "DV", avBg: "rgba(74,140,111,.18)", avCol: "var(--jade)", since: "Sep 2024" },
  { id: 3, name: "Cleo S.", pronouns: "they/them", type: "seeking", neighbourhood: "Príncipe Real", neighbourhoodLabel: "Príncipe Real or Bairro Alto", budget: "€600–800", budgetRange: 700, movein: "August 2026", moveinKey: "aug", note: "PhD researcher, mostly working from cafés and the library. I'm sober and looking for a household that's either sober or relaxed about it. I'm an early riser and will be delighted if you are too. I bake bread sometimes.", tags: ["Sober household", "Early riser", "Quiet household", "WFH"], av: "CS", avBg: "rgba(45,27,61,.12)", avCol: "var(--plum)", since: "Mar 2025" },
  { id: 4, name: "Inês T.", pronouns: "she/her", type: "offering", neighbourhood: "Príncipe Real", neighbourhoodLabel: "Príncipe Real", budget: "€950 / month", budgetRange: 950, movein: "Mid-July", moveinKey: "jul", note: "I have a beautiful first-floor flat with a second room going spare. I work in film, often irregular hours. Looking for someone calm and self-contained — you'll have your own bathroom. Good light, garden view, very quiet street.", tags: ["WFH", "Quiet household", "Introvert-friendly", "Plant parent"], av: "IT", avBg: "rgba(232,119,90,.16)", avCol: "var(--accent-ink)", since: "Nov 2024" },
  { id: 5, name: "Marco A.", pronouns: "he/him", type: "seeking", neighbourhood: "Graça", neighbourhoodLabel: "Graça or Mouraria", budget: "€800–1,000", budgetRange: 900, movein: "Available now", moveinKey: "now", note: "Sound engineer and DJ, mainly working evenings. I keep the flat clean and I'm good at it. Looking for somewhere I don't have to justify my schedule or my friends. I'm sociable but I genuinely respect your space.", tags: ["Night owl", "Sociable", "Late nights fine", "420-friendly"], av: "MA", avBg: "rgba(122,82,184,.14)", avCol: "#7A52B8", since: "Jun 2024" },
  { id: 6, name: "Yara B.", pronouns: "she/they", type: "offering", neighbourhood: "Arroios", neighbourhoodLabel: "Arroios", budget: "€700 / month", budgetRange: 700, movein: "1 August", moveinKey: "aug", note: "I'm offering the smaller room in my two-bed in Arroios. Graphic designer, very tidy, vegan kitchen (not strict if you have friends visiting). I like a quiet household with good conversation. My cat is already resident.", tags: ["Vegan kitchen", "Quiet household", "WFH", "Plant parent", "Pets welcome"], av: "YB", avBg: "rgba(74,140,111,.18)", avCol: "var(--jade)", since: "Feb 2025" },
  { id: 7, name: "Tomé F.", pronouns: "he/him", type: "seeking", neighbourhood: "Mouraria", neighbourhoodLabel: "Anywhere central", budget: "€600–750", budgetRange: 675, movein: "Flexible", moveinKey: "flex", note: "Just moved to Lisbon from Porto. Working at a bookshop in Chiado. Looking for a calm flatmate setup — I'm quite private but happy to share dinners now and then. Sober. I have a small cat and she travels with me.", tags: ["Sober household", "Early riser", "Quiet household", "Cats welcome"], av: "TF", avBg: "rgba(45,27,61,.12)", avCol: "var(--plum)", since: "May 2025" },
  { id: 8, name: "Ana C.", pronouns: "she/her", type: "offering", neighbourhood: "Cais do Sodré", neighbourhoodLabel: "Cais do Sodré", budget: "€850 / month", budgetRange: 850, movein: "Mid-July", moveinKey: "jul", note: "My flatmate is moving out and I need someone for the big room. Very central, five minutes from the river. Small balcony. I'm sociable and respect privacy completely. I work in hospitality so evenings are my thing.", tags: ["Sociable", "Late nights fine", "Pets welcome", "Night owl"], av: "AC", avBg: "rgba(232,119,90,.16)", avCol: "var(--accent-ink)", since: "Aug 2024" },
];

const NEIGHBOURHOODS = ["Príncipe Real", "Mouraria", "Arroios", "Graça", "Bairro Alto", "Cais do Sodré", "Marvila", "Estrela"];
const LIFESTYLE_TAGS = ["WFH", "Quiet household", "Sociable", "Sober household", "Early riser", "Night owl", "Pets welcome", "Plant parent", "Vegan kitchen", "420-friendly"];
const MODAL_TAGS = ["Early riser", "Night owl", "WFH", "Quiet household", "Sociable", "Sober household", "Pets welcome", "Cats welcome", "Plant parent", "Vegan kitchen", "Musicians welcome", "Late nights fine", "Introvert-friendly", "420-friendly"];

function matchesBudget(p: Profile, budget: string) {
  if (budget === "all") return true;
  const b = p.budgetRange;
  if (budget === "600") return b <= 700;
  if (budget === "700") return b > 700 && b <= 900;
  if (budget === "900") return b > 900 && b <= 1100;
  if (budget === "1100") return b > 1100;
  return true;
}

export function FlatmatesPage() {
  const [type, setType] = useState<ListingType | "all">("all");
  const [neighbourhood, setNeighbourhood] = useState("all");
  const [budget, setBudget] = useState("all");
  const [movein, setMovein] = useState("all");
  const [tags, setTags] = useState<string[]>([]);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useScrollLock(modalOpen);
  const [modalType, setModalType] = useState<ListingType>("seeking");
  const [modalTags, setModalTags] = useState<Set<string>>(new Set());

  const filtered = PROFILES.filter((p) => {
    if (type !== "all" && p.type !== type) return false;
    if (neighbourhood !== "all" && p.neighbourhood !== neighbourhood) return false;
    if (!matchesBudget(p, budget)) return false;
    if (movein !== "all" && p.moveinKey !== movein) return false;
    if (tags.length > 0 && !tags.every((t) => p.tags.includes(t))) return false;
    return true;
  });

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => setSubmitted(false), 400);
  };

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Flatmates · Lisbon</div>
          <h1>
            Find your people to <em>come home to.</em>
          </h1>
          <p className={styles.heroSub}>
            A queer-specific flatmate board. Community-based, member-only — browse
            real profiles, reach out directly, find someone you can actually be
            yourself around.
          </p>
          <div className={styles.ethos}>
            <div className={styles.ethosRule} />
            <p className={styles.ethosText}>
              <strong>This is a queer-first space.</strong>
              You don't need to explain or justify yourself to a flatmate here.
              Everyone on this board is a QueerPulse member. Reach out directly,
              have a real conversation, find your home.
            </p>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteDot} />
            Community-based matching · no algorithm · members only
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className="wrap">
          <div className={styles.filterRow}>
            <span className={styles.fLabel}>Show</span>
            {(["all", "seeking", "offering"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={[styles.typeChip, type === t && styles.typeOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setType(t)}
              >
                {t === "all" ? "All profiles" : t === "seeking" ? "Seeking a room" : "Offering a room"}
              </button>
            ))}
            <div className={styles.spacer} />
            <select
              className={styles.fSelect}
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
            >
              <option value="all">Any neighbourhood</option>
              {NEIGHBOURHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <select
              className={styles.fSelect}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option value="all">Any budget</option>
              <option value="600">Up to €700</option>
              <option value="700">€700–900</option>
              <option value="900">€900–1,100</option>
              <option value="1100">€1,100+</option>
            </select>
            <select
              className={styles.fSelect}
              value={movein}
              onChange={(e) => setMovein(e.target.value)}
            >
              <option value="all">Any move-in</option>
              <option value="now">Available now</option>
              <option value="jul">July</option>
              <option value="aug">August</option>
              <option value="flex">Flexible</option>
            </select>
          </div>
          <div className={styles.filterRow}>
            <span className={styles.fLabel}>Lifestyle</span>
            {LIFESTYLE_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                className={[styles.tagChip, tags.includes(t) && styles.tagOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.top}>
            <div className={styles.count}>
              <b>{filtered.length}</b> profiles active this week
            </div>
            <button
              type="button"
              className={styles.postBtn}
              onClick={() => setModalOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Post your profile
            </button>
          </div>
          <div className={styles.grid}>
            {filtered.length === 0 && (
              <div className={styles.empty}>
                <div className={styles.emptyTitle}>
                  No profiles match those filters.
                </div>
                <div className={styles.emptySub}>
                  Try removing a filter, or be the first to post in this
                  combination.
                </div>
              </div>
            )}
            {filtered.map((p) => (
              <div className={styles.card} key={p.id}>
                <div className={styles.cardTop}>
                  <div
                    className={styles.av}
                    style={{ background: p.avBg, color: p.avCol }}
                  >
                    {p.av}
                  </div>
                  <div className={styles.identity}>
                    <div className={styles.name}>{p.name}</div>
                    <div className={styles.pronouns}>{p.pronouns}</div>
                  </div>
                  <span
                    className={[
                      styles.badge,
                      p.type === "seeking" ? styles.badgeSeeking : styles.badgeOffering,
                    ].join(" ")}
                  >
                    {p.type === "seeking" ? "Seeking a room" : "Offering a room"}
                  </span>
                </div>
                <div className={styles.details}>
                  <span className={styles.detail}>📍 {p.neighbourhoodLabel}</span>
                  <span className={styles.detail}>🕒 {p.movein}</span>
                  <span className={styles.detail}>{p.budget}</span>
                </div>
                <p className={styles.note}>{p.note}</p>
                <div className={styles.tags}>
                  {p.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className={styles.foot}>
                  <span className={styles.since}>Member since {p.since}</span>
                  <button
                    type="button"
                    className={[styles.sayBtn, sent.has(p.id) && styles.sayBtnSent]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSent((prev) => new Set(prev).add(p.id))}
                  >
                    {sent.has(p.id) ? "✓ Hello sent" : "Say hello →"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.hsStrip}>
        <div className="wrap">
          <div className={styles.hsStripInner}>
            <div className={styles.hsStripText}>
              <h3>
                Need a place first? See the <em>Housing Board.</em>
              </h3>
              <p>
                Full tenancy resources, legal guidance, landlord recommendations,
                sublets and room shares — everything you need to find and secure a
                home in Lisbon.
              </p>
            </div>
            <Button to={linkToPath("QueerPulse Housing.html")} variant="ghost">
              Housing Board →
            </Button>
          </div>
        </div>
      </div>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            A home where <em>you belong.</em>
          </h2>
          <p className={styles.outroSub}>
            The right flatmate can make a city feel like home. Take your time, trust
            your gut, and use the community.
          </p>
          <div className={styles.outroBtns}>
            <Button
              type="button" variant="primary" size="lg"
              onClick={() => setModalOpen(true)}
            >
              Post your profile
            </Button>
            <Button to={linkToPath("QueerPulse Forum.html")} variant="ghost-dark" size="lg">
              Ask the forum →
            </Button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modal}>
            <button type="button" className={styles.modalX} onClick={closeModal}>
              ×
            </button>
            {!submitted ? (
              <>
                <div className={styles.modalTitle}>Post your profile</div>
                <p className={styles.modalSub}>
                  Takes about two minutes. Your profile goes live straight away —
                  members reach out directly, no matching algorithm.
                </p>
                <div className={styles.fields}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      What are you looking for?
                    </label>
                    <div className={styles.typeToggle}>
                      {(["seeking", "offering"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={[styles.ttOpt, modalType === t && styles.ttOptOn]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => setModalType(t)}
                        >
                          <div className={styles.ttTitle}>
                            {t === "seeking" ? "Seeking a room" : "Offering a room"}
                          </div>
                          <div className={styles.ttDesc}>
                            {t === "seeking"
                              ? "You're looking for a room in a flat or house"
                              : "You have a room or flat share to offer"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Your name</label>
                      <input className={styles.input} type="text" placeholder="First name or nickname" />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Pronouns (optional)</label>
                      <input className={styles.input} type="text" placeholder="e.g. she/her, they/them" />
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Neighbourhood</label>
                      <select className={styles.select} defaultValue="">
                        <option value="">Preference / location</option>
                        {NEIGHBOURHOODS.map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                        <option>Anywhere central</option>
                        <option>Flexible</option>
                      </select>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Budget / month</label>
                      <input className={styles.input} type="text" placeholder="e.g. €700–900" />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Available / move-in from</label>
                    <select className={styles.select} defaultValue="">
                      <option value="">When?</option>
                      <option>Available now</option>
                      <option>July 2026</option>
                      <option>August 2026</option>
                      <option>September 2026</option>
                      <option>Flexible</option>
                    </select>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      About you &amp; what you're looking for in a home
                    </label>
                    <textarea
                      className={styles.textarea}
                      rows={4}
                      placeholder="Tell people a bit about yourself — your rhythm, your work, what kind of home makes you feel good. No need to sell yourself; just be honest."
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Lifestyle tags</label>
                    <div className={styles.lfGrid}>
                      {MODAL_TAGS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={[styles.lfOpt, modalTags.has(t) && styles.lfOptOn]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() =>
                            setModalTags((prev) => {
                              const next = new Set(prev);
                              if (next.has(t)) next.delete(t);
                              else next.add(t);
                              return next;
                            })
                          }
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Your email (not shown publicly)
                    </label>
                    <input className={styles.input} type="email" placeholder="So members can reach you via QueerPulse" />
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <Button
                    type="button" variant="primary"
                    onClick={() => setSubmitted(true)}
                  >
                    Post profile →
                  </Button>
                  <Button type="button" variant="ghost" onClick={closeModal}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className={styles.success}>
                <div className={styles.successIcon}>
                  <svg viewBox="0 0 28 28" fill="none" stroke="var(--jade)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 14l6 6L23 8" />
                  </svg>
                </div>
                <h2>
                  You're on the <em>board.</em>
                </h2>
                <p>
                  Your profile is live. Members will reach out directly — keep an
                  eye on your QueerPulse messages.
                </p>
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Back to profiles
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
