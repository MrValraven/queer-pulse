import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./MemberDirectoryFilterPage.module.css";
import { Button } from '../../shared/components/ui'

interface CheckOption {
  label: string;
  count: string;
  checked?: boolean;
}
interface ChipOption {
  label: string;
  active?: boolean;
}

const OPEN_TO: CheckOption[] = [
  { label: "Mentoring junior peers", count: "142", checked: true },
  { label: "Portfolio reviews", count: "28" },
  { label: "Hosting gatherings", count: "84", checked: true },
  { label: "Co-hosting an event", count: "62" },
  { label: "Collaborating on something", count: "214" },
  { label: "Coffee with new arrivals", count: "312" },
  { label: "Vouching for a stranger", count: "68" },
];

const NEIGHBOURHOODS: ChipOption[] = [
  { label: "Anjos · 412", active: true },
  { label: "Mouraria · 184", active: true },
  { label: "Graça · 142" },
  { label: "Alfama · 98" },
  { label: "Bairro Alto · 84" },
  { label: "Marvila · 62" },
  { label: "All of Lisbon · 1,612" },
];

const DISCIPLINES: ChipOption[] = [
  { label: "Design · 184", active: true },
  { label: "Editorial · 88" },
  { label: "Healthcare · 142" },
  { label: "Legal · 38" },
  { label: "Education · 112" },
  { label: "Tech · 218" },
  { label: "+ 14 more" },
];

const IDENTITY: CheckOption[] = [
  { label: "Trans & non-binary", count: "408" },
  { label: "Lesbian", count: "214" },
  { label: "Gay", count: "312" },
  { label: "Bi / Pan", count: "288" },
  { label: "Aro / ace spectrum", count: "96" },
  { label: "QPOC / queer of colour", count: "142" },
  { label: "Disabled / chronic illness", count: "88" },
];

const LANGUAGES: ChipOption[] = [
  { label: "PT · 1,612", active: true },
  { label: "EN · 1,488", active: true },
  { label: "ES · 312" },
  { label: "FR · 142" },
  { label: "DE · 88" },
];

interface MemberCard {
  initials: string;
  tint?: "jade" | "plum";
  name: string;
  meta: string;
  role: string;
  tags: { label: string; match?: boolean }[];
  vouch: string;
  mutuals: string;
}

const MEMBERS: MemberCard[] = [
  {
    initials: "LG",
    name: "Luísa Gomes",
    meta: "she/her · Mouraria",
    role: "Design director, ex-Atelier Pulso. Reviews portfolios, mentors junior designers, hosts critique nights.",
    tags: [
      { label: "Design", match: true },
      { label: "Mentoring", match: true },
      { label: "PT · EN" },
    ],
    vouch: "3 vouches",
    mutuals: "3 mutuals",
  },
  {
    initials: "AB",
    tint: "jade",
    name: "André Bento",
    meta: "he/him · Anjos",
    role: "Co-founder of Atelier Pulso. Hosts Open Studio monthly. Mentors mid-career designers in identity systems.",
    tags: [
      { label: "Design", match: true },
      { label: "Hosting", match: true },
      { label: "PT · EN" },
    ],
    vouch: "7 vouches",
    mutuals: "4 mutuals",
  },
  {
    initials: "TC",
    tint: "plum",
    name: "Tó Cunha",
    meta: "he/him · Anjos",
    role: "Riso printer at Editora Anjos. Runs the 6-week risograph workshop. Open to mentoring & co-hosting print nights.",
    tags: [
      { label: "Design", match: true },
      { label: "Mentoring", match: true },
      { label: "Hosting", match: true },
    ],
    vouch: "2 vouches",
    mutuals: "1 mutual",
  },
  {
    initials: "MR",
    name: "Marta Reis",
    meta: "she/her · Anjos",
    role: "Editor in chief of QueerPulse Magazine. Hosts Open Studio. Mentors designers moving into editorial.",
    tags: [
      { label: "Design", match: true },
      { label: "Editorial" },
      { label: "Hosting", match: true },
    ],
    vouch: "9 vouches",
    mutuals: "11 mutuals",
  },
  {
    initials: "SC",
    tint: "jade",
    name: "Sofia Castaño",
    meta: "she/her · Mouraria",
    role: "Service designer. Hosts the Stone Butch Blues reading group. Open to portfolio reviews for service designers.",
    tags: [
      { label: "Design", match: true },
      { label: "Hosting", match: true },
      { label: "PT · EN" },
    ],
    vouch: "2 vouches",
    mutuals: "4 mutuals",
  },
  {
    initials: "FL",
    tint: "plum",
    name: "Filipa Lopes",
    meta: "she/her · Anjos",
    role: "Brand designer · Atelier Pulso. Co-hosts Porto launch. Mentors juniors making the city move.",
    tags: [
      { label: "Design", match: true },
      { label: "Mentoring", match: true },
    ],
    vouch: "1 vouch",
    mutuals: "2 mutuals",
  },
];

const INITIAL_APPLIED = [
  "Open to mentoring",
  "Hosting gatherings",
  "Anjos",
  "Mouraria",
  "Design",
  "PT + EN",
];

function avClass(tint?: "jade" | "plum") {
  if (tint === "jade") return `${styles.mAv} ${styles.mAvJade}`;
  if (tint === "plum") return `${styles.mAv} ${styles.mAvPlum}`;
  return styles.mAv;
}

function ChipGroup({ options }: { options: ChipOption[] }) {
  const [active, setActive] = useState(
    () => new Set(options.filter((o) => o.active).map((o) => o.label)),
  );
  return (
    <div className={styles.chipRow}>
      {options.map((opt) => {
        const on = active.has(opt.label);
        return (
          <button
            key={opt.label}
            type="button"
            className={[styles.chip, on && styles.chipActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() =>
              setActive((prev) => {
                const next = new Set(prev);
                if (next.has(opt.label)) next.delete(opt.label);
                else next.add(opt.label);
                return next;
              })
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function MemberDirectoryFilterPage() {
  const { showToast } = useToast();
  const [applied, setApplied] = useState(INITIAL_APPLIED);

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Members · advanced filter</div>
          <h1 className={styles.h1}>
            Find <em>1,847 members,</em> exactly.
          </h1>
          <p className={styles.lead}>
            Filter by what they offer, where they're based, what they're{" "}
            <b>open to</b>. The same data goes both ways — members appear here
            because they opted in to be findable for these reasons.
          </p>
        </header>

        <div className={styles.grid}>
          <aside className={styles.filters}>
            <div className={styles.filterCard}>
              <h4>What they're open to</h4>
              {OPEN_TO.map((o) => (
                <label key={o.label} className={styles.filterRow}>
                  <input type="checkbox" defaultChecked={o.checked} />
                  {o.label}
                  <span className={styles.ct}>{o.count}</span>
                </label>
              ))}
            </div>

            <div className={styles.filterCard}>
              <h4>Where they're based</h4>
              <ChipGroup options={NEIGHBOURHOODS} />
            </div>

            <div className={styles.filterCard}>
              <h4>What they do</h4>
              <ChipGroup options={DISCIPLINES} />
            </div>

            <div className={styles.filterCard}>
              <h4>Identity · self-declared</h4>
              {IDENTITY.map((o) => (
                <label key={o.label} className={styles.filterRow}>
                  <input type="checkbox" />
                  {o.label}
                  <span className={styles.ct}>{o.count}</span>
                </label>
              ))}
            </div>

            <div className={styles.filterCard}>
              <h4>Member age</h4>
              <div className={styles.range}>
                <input type="number" placeholder="From" defaultValue={0} />
                <span>→</span>
                <input type="number" placeholder="Years" defaultValue={3} />
              </div>
              <p className={styles.rangeNote}>
                Years on QueerPulse.{" "}
                <em>Newer members appear with a "first year" badge by default.</em>
              </p>
            </div>

            <div className={styles.filterCard}>
              <h4>Languages</h4>
              <ChipGroup options={LANGUAGES} />
            </div>

            <div className={styles.clearRow}>
              <button
                type="button"
                onClick={() => {
                  setApplied([]);
                  showToast("Filters cleared", "info");
                }}
              >
                Clear all filters
              </button>
              <span>{applied.length} applied</span>
            </div>
          </aside>

          <main>
            <div className={styles.topRow}>
              <div className={styles.count}>
                Showing{" "}
                <b>
                  <em>184</em>
                </b>{" "}
                of 1,847 members
              </div>
              <div className={styles.sort}>
                <span className={styles.sortLabel}>Sort</span>
                <select defaultValue="Recently active">
                  <option>Recently active</option>
                  <option>Recently joined</option>
                  <option>Closest mutuals</option>
                  <option>A to Z</option>
                  <option>Most vouched</option>
                </select>
              </div>
            </div>

            {applied.length > 0 && (
              <div className={styles.appliedRow}>
                {applied.map((label) => (
                  <span key={label} className={styles.applied}>
                    {label}
                    <button
                      type="button"
                      aria-label={`Remove ${label}`}
                      onClick={() =>
                        setApplied((prev) => prev.filter((l) => l !== label))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className={styles.mGrid}>
              {MEMBERS.map((member) => (
                <Link
                  key={member.name}
                  to={linkToPath("QueerPulse Profile.html")}
                  className={styles.mCard}
                >
                  <div className={styles.mHead}>
                    <div className={avClass(member.tint)}>{member.initials}</div>
                    <div>
                      <div className={styles.mName}>{member.name}</div>
                      <div className={styles.mPron}>{member.meta}</div>
                    </div>
                  </div>
                  <div className={styles.mRole}>{member.role}</div>
                  <div className={styles.mTags}>
                    {member.tags.map((tag) => (
                      <span
                        key={tag.label}
                        className={[styles.mTag, tag.match && styles.mTagMatch]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>
                  <div className={styles.mFoot}>
                    <span className={styles.vouch}>{member.vouch}</span>
                    <span>{member.mutuals}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.loadMore}>
              <Button
                type="button" variant="ghost"
                onClick={() => showToast("Loading more members…", "info")}
              >
                Load 178 more members
              </Button>
            </div>
          </main>
        </div>
      </div>
    </PageShell>
  );
}
