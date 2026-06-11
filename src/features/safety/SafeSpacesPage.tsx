import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./SafeSpacesPage.module.css";
import { Button } from '../../shared/components/ui'
import { VERIFIED_SPACES, REMOVED_SPACES, type Category } from './safeSpaces'
import { FlagModal } from './FlagModal'

const TYPE_CLASS: Record<Category, string> = {
  Bar: "typeBar",
  Club: "typeClub",
  Cafe: "typeCafe",
  Health: "typeHealth",
  Services: "typeServices",
  Arts: "typeArts",
};

const CRITERIA: { icon: string; lead: string; rest: string }[] = [
  { icon: "✓", lead: "Gender-neutral bathrooms", rest: " available or clearly accessible" },
  { icon: "✓", lead: "Staff intervene", rest: " if a customer is being harassed or discriminated against" },
  { icon: "✓", lead: "No discriminatory incidents", rest: " reported in the past 12 months" },
  { icon: "✓", lead: "Trans and non-binary people", rest: " feel genuinely welcome, not just tolerated" },
  { icon: "✓", lead: "Accessible", rest: " — or access limitations clearly communicated" },
  { icon: "✓", lead: "Minimum 3 independent reviews", rest: " from verified QueerPulse members" },
  { icon: "↺", lead: "Annual re-review", rest: " — status doesn't last forever" },
];

const HOW: { num: string; title: string; desc: string }[] = [
  { num: "01", title: "Any member nominates", desc: "Submit a space with a brief note on why you think it should be verified. We acknowledge within 48 hours." },
  { num: "02", title: "Three independent visits", desc: "Three verified members visit the space independently and submit structured reviews against the criteria. They don't know each other's assessments." },
  { num: "03", title: "Review panel decides", desc: "A small volunteer panel reads the reviews and decides whether the criteria are met. The space isn't told the result until after the decision." },
  { num: "04", title: "Badge awarded", desc: "If approved, the venue receives a physical badge and a digital listing. They can display the badge in their window — it's earned, not purchased." },
  { num: "05", title: "Annual re-review", desc: "Every listing is re-reviewed each year. No status is permanent. New ownership, staff changes, or reported incidents trigger an early review." },
  { num: "06", title: "Any member can flag", desc: "If something changes — an incident, a shift in atmosphere — any member can flag the listing. Three flags trigger an immediate review and temporary suspension of the badge." },
];

const FILTERS: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All spaces" },
  { id: "Bar", label: "Bars" },
  { id: "Club", label: "Clubs" },
  { id: "Cafe", label: "Cafés" },
  { id: "Health", label: "Healthcare" },
  { id: "Services", label: "Services" },
  { id: "Arts", label: "Arts" },
];

export function SafeSpacesPage() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<Category | "all">("all");
  const [flagging, setFlagging] = useState<string | null>(null);
  const [nominated, setNominated] = useState(false);
  const [nomName, setNomName] = useState("");
  const nomRef = useRef<HTMLDivElement>(null);

  const items = VERIFIED_SPACES.filter((s) => filter === "all" || s.cat === filter);
  const scrollToNominate = () =>
    nomRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Community verified</div>
          <h1>
            Spaces that are actually <em>safe.</em>
          </h1>
          <p className={styles.lead}>
            Not self-declared. Not a rainbow sticker in the window. Every venue on
            this list has been visited and reviewed by multiple community members —
            and can lose its status if things change.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <div className={styles.n}>47</div>
              <div className={styles.l}>verified spaces in Lisbon</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>312</div>
              <div className={styles.l}>member reviews submitted</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.n}>6</div>
              <div className={styles.l}>spaces flagged &amp; removed this year</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.badgeExplainer}>
        <div className="wrap">
          <div className={styles.beGrid}>
            <div className={styles.beBadge}>
              <div className={styles.badgeVisual}>
                <div className={styles.bvCheck}>✓</div>
                <div className={styles.bvName}>
                  Community
                  <br />
                  Verified
                </div>
                <div className={styles.bvSub}>QueerPulse</div>
              </div>
              <div className={styles.badgeCaption}>
                The badge venues can display — earned, not purchased
              </div>
            </div>
            <div className={styles.beText}>
              <h2>
                What <em>"verified"</em> actually means.
              </h2>
              <p>
                Any venue can put a rainbow flag in the window during Pride.
                Verification means something different — it means community members
                have been there, assessed it against a clear set of criteria, and
                agreed it meets the standard. And it can be revoked.
              </p>
              <div className={styles.criteriaList}>
                {CRITERIA.map((c) => (
                  <div className={styles.critItem} key={c.lead}>
                    <div className={styles.critDot}>{c.icon}</div>
                    <div className={styles.critText}>
                      <strong>{c.lead}</strong>
                      {c.rest}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.dirHead}>
            <div>
              <h2>
                Verified <em>spaces.</em>
              </h2>
              <div className={styles.dirUpdated}>
                Last updated June 2025 · Member-maintained
              </div>
            </div>
            <button
              type="button"
              className={styles.nominateBtn}
              onClick={scrollToNominate}
            >
              + Nominate a space
            </button>
          </div>

          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={[styles.chip, filter === f.id && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {items.map((s) => (
              <Link to={`/safe-space/${s.slug}`} className={styles.card} key={s.name}>
                <div className={styles.cardHead}>
                  <div
                    className={`${styles.venueType} ${styles[TYPE_CLASS[s.cat]]}`}
                  >
                    {s.typeLabel}
                  </div>
                  <div className={styles.verifiedBadge}>
                    <div className={styles.vbDot} />
                    Verified
                  </div>
                </div>
                <div className={styles.name}>{s.name}</div>
                <div className={styles.hood}>
                  <span className={styles.pin} />
                  {s.hood}
                </div>
                <div className={styles.desc}>{s.desc}</div>
                <div className={styles.tags}>
                  {s.tags.map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className={styles.cardFoot}>
                  <div className={styles.reviews}>
                    ★ <strong>{s.rating}</strong> · {s.reviews}
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    className={styles.flag}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setFlagging(s.name)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        e.stopPropagation()
                        setFlagging(s.name)
                      }
                    }}
                  >
                    ⚑ Flag
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.howSection}>
        <div className="wrap">
          <h2>
            How <em>verification</em> works.
          </h2>
          <div className={styles.howGrid}>
            {HOW.map((h) => (
              <div className={styles.howCard} key={h.num}>
                <div className={styles.howNum}>{h.num}</div>
                <div className={styles.howTitle}>{h.title}</div>
                <div className={styles.howDesc}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.removedSection}>
        <div className="wrap">
          <div className={styles.removedHead}>
            <h2>
              When a space <em>loses</em> its badge.
            </h2>
            <p>
              Verification can be revoked — and is. A listing isn't a reward a venue keeps
              forever; it's a standard they keep meeting. When they stop, we say so, and we
              say why. We removed {REMOVED_SPACES.length > 0 ? 6 : 0} spaces this year.
            </p>
          </div>
          <div className={styles.removedSteps}>
            <div className={styles.rStep}>
              <span>3 flags</span> suspend the badge instantly, pending review.
            </div>
            <div className={styles.rStep}>
              <span>Panel review</span> reads every report against the criteria.
            </div>
            <div className={styles.rStep}>
              <span>Removed</span> if criteria fail or owners won't engage.
            </div>
            <div className={styles.rStep}>
              <span>Public reason</span> — every removal is recorded openly, never quietly.
            </div>
          </div>
          <div className={styles.removedList}>
            {REMOVED_SPACES.map((r) => (
              <Link key={r.slug} to={`/safe-space/${r.slug}`} className={styles.removedCard}>
                <div className={styles.rcTop}>
                  <span className={styles.rcType}>
                    {r.typeLabel} · {r.hood}
                  </span>
                  <span className={styles.rcBadge}>Removed</span>
                </div>
                <div className={styles.rcName}>{r.name}</div>
                <div className={styles.rcReason}>{r.reason}</div>
                <div className={styles.rcFoot}>
                  <span>{r.removedDate}</span>
                  <span className={styles.rcLink}>Why it was removed →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.nomSection} ref={nomRef}>
        <div className="wrap">
          <div className={styles.nomBox}>
            {nominated ? (
              <div className={styles.nomThanks}>
                <div className={styles.nomThanksIcon}>
                  <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={styles.nomThanksTitle}>
                  Thank you. We're <em>on it.</em>
                </h3>
                <p className={styles.nomThanksText}>
                  Your nomination{nomName.trim() ? <> for <strong>{nomName.trim()}</strong></> : null} is
                  in. The community is the reason this list means anything — adding to it
                  is genuinely a gift.
                </p>
                <p className={styles.nomThanksSub}>
                  Here's what happens next: we acknowledge every nomination within
                  <strong> 48 hours</strong>. Then three verified members visit
                  independently and review it against the criteria before a volunteer panel
                  decides. We'll keep you posted.
                </p>
                <Button
                  variant="ghost-dark"
                  onClick={() => {
                    setNominated(false);
                    setNomName("");
                  }}
                >
                  Nominate another space
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <h3>
                    Nominate a <em>space.</em>
                  </h3>
                  <p>
                    You've found somewhere that genuinely feels safe. Tell us about it.
                    We do the rest.
                  </p>
                  <div className={styles.nomFlagNote}>
                    You can also flag a verified space that's changed — use the flag
                    button on any listing, or contact us directly.
                  </div>
                </div>
                <form
                  className={styles.nomFields}
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNominated(true);
                  }}
                >
                  <input
                    className={styles.nomInput}
                    type="text"
                    placeholder="Space name"
                    value={nomName}
                    onChange={(e) => setNomName(e.target.value)}
                    required
                  />
                  <input
                    className={styles.nomInput}
                    type="text"
                    placeholder="Address or neighbourhood"
                  />
                  <select className={styles.nomSelect} defaultValue="">
                    <option value="">Type of space</option>
                    <option>Bar</option>
                    <option>Club</option>
                    <option>Café</option>
                    <option>Healthcare</option>
                    <option>Services</option>
                    <option>Arts venue</option>
                    <option>Gym / fitness</option>
                    <option>Other</option>
                  </select>
                  <textarea
                    className={styles.nomTextarea}
                    placeholder="Why do you think this space should be verified? Specific experiences help."
                  />
                  <button type="submit" className={styles.nomBtn}>
                    Submit nomination
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <section className={styles.outro}>
        <div className="wrap">
          <h2>
            Safety is <em>collective.</em>
          </h2>
          <p className={styles.outroSub}>
            Every review, every flag, every nomination makes this list more useful
            for everyone. It only works because the community maintains it.
          </p>
          <div className={styles.outroBtns}>
            <Button to={linkToPath("QueerPulse Safety.html")} variant="primary" size="lg">
              Safety &amp; reporting
            </Button>
            <Button to={linkToPath("QueerPulse Sober.html")} variant="ghost-dark" size="lg">
              Sober &amp; social
            </Button>
          </div>
        </div>
      </section>

      {flagging && (
        <FlagModal
          spaceName={flagging}
          onClose={() => setFlagging(null)}
          onSubmitted={(reason) => showToast(`Flag submitted — ${reason.toLowerCase()}`, "success")}
        />
      )}
    </PageShell>
  );
}
