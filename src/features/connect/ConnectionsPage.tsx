import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { linkToPath } from "../../app/routeMap";
import styles from "./ConnectionsPage.module.css";
import { Button } from '../../shared/components/ui'

type Tint = "jade" | "plum" | undefined;
type TabId = "all" | "incoming" | "outgoing" | "vouched";

const PROFILE = linkToPath("QueerPulse Profile.html");
const MESSAGES = linkToPath("QueerPulse Messages.html");

function avClass(tint: Tint) {
  if (tint === "jade") return `${styles.av} ${styles.avJade}`;
  if (tint === "plum") return `${styles.av} ${styles.avPlum}`;
  return styles.av;
}

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

interface Person {
  initials: string;
  tint?: Tint;
  name: string;
  pron: string;
  role: string;
}

function CardHead({ person, more }: { person: Person; more?: boolean }) {
  return (
    <div className={styles.cardHead}>
      <Link to={PROFILE} className={avClass(person.tint)}>
        {person.initials}
      </Link>
      <div>
        <div className={styles.name}>
          <Link to={PROFILE}>{person.name}</Link>
        </div>
        <div className={styles.pron}>{person.pron}</div>
        <div className={styles.role}>{person.role}</div>
      </div>
      {more && (
        <button type="button" className={styles.more} aria-label="More">
          <MoreIcon />
        </button>
      )}
    </div>
  );
}

const TABS: { id: TabId; label: string; count: string; accent?: boolean }[] = [
  { id: "all", label: "All connections", count: "47" },
  { id: "incoming", label: "Incoming requests", count: "4", accent: true },
  { id: "outgoing", label: "Sent", count: "2" },
  { id: "vouched", label: "Vouched-for", count: "11" },
];

export function ConnectionsPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<TabId>("all");

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>Your network</div>
          <h1 className={styles.h1}>
            People you've <em>actually met.</em>
          </h1>
          <p className={styles.lead}>
            QueerPulse doesn't do followers. You connect with people once you've
            met them — at a gathering, through someone, or because they vouched
            for you. Quality over count.
          </p>
        </header>

        <div className={styles.langNote}>
          <span>💡</span>
          <span>
            <b>No follower counts on purpose.</b> If you're looking to "follow a
            member's posts" without connecting first, use the Communities feed
            instead. Connections are a two-way thing — they unlock messaging and
            tagged updates.
          </span>
        </div>

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
              <span
                className={[styles.badge, t.accent && styles.badgeAccent]
                  .filter(Boolean)
                  .join(" ")}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <div className={styles.searchInput}>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, role, or community"
            />
          </div>
          <select className={styles.sortSel} defaultValue="Recently connected">
            <option>Recently connected</option>
            <option>A to Z</option>
            <option>Closest mutuals</option>
            <option>Recently active</option>
          </select>
        </div>

        {tab === "all" && (
          <>
            <div className={styles.grid}>
              {ALL.map((c) => (
                <div className={styles.card} key={c.person.name}>
                  <CardHead person={c.person} more />
                  <div className={styles.tags}>
                    {c.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className={styles.meta}>{c.meta}</div>
                  <div className={styles.actions}>{c.actions}</div>
                </div>
              ))}
            </div>
            <div className={styles.loadMore}>
              <Button
                type="button" variant="ghost"
                onClick={() => showToast("Loading more connections…", "info")}
              >
                Load 39 more connections
              </Button>
            </div>
          </>
        )}

        {tab === "incoming" && (
          <div className={styles.grid}>
            {INCOMING.map((c) => (
              <div className={`${styles.card} ${styles.pending}`} key={c.person.name}>
                <CardHead person={c.person} />
                <div className={styles.meta}>{c.meta}</div>
                {c.message && <p className={styles.reqMessage}>{c.message}</p>}
                <div className={styles.actions}>
                  <Button
                    type="button" variant="ghost"
                    onClick={() => showToast("Politely declined", "info")}
                  >
                    Decline
                  </Button>
                  <Button
                    type="button" variant="primary"
                    onClick={() =>
                      showToast(
                        `Connected with ${c.person.name.split(" ")[0]}`,
                        "success",
                      )
                    }
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "outgoing" && (
          <div className={styles.grid}>
            {OUTGOING.map((c) => (
              <div className={styles.card} key={c.person.name}>
                <CardHead person={c.person} />
                <div className={styles.meta}>
                  <span className={styles.metaMuted}>{c.meta}</span>
                </div>
                <div className={styles.actions}>
                  <Button
                    type="button" variant="ghost"
                    onClick={() => showToast("Request withdrawn", "info")}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "vouched" && (
          <>
            <p className={styles.paneIntro}>
              People you've vouched for, or who've vouched for you.{" "}
              <em>Vouching is a small but meaningful act</em> — it stays attached
              to that member's profile.
            </p>
            <div className={styles.grid}>
              {VOUCHED.map((c) => (
                <div className={styles.card} key={c.person.name}>
                  <CardHead person={c.person} />
                  <div className={styles.meta}>
                    <span className={styles.vouched}>{c.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

interface AllCard {
  person: Person;
  tags: string[];
  meta: ReactNode;
  actions: ReactNode;
}

const ALL: AllCard[] = [
  {
    person: {
      initials: "CV",
      name: "Catarina Vaz",
      pron: "she/her",
      role: "Trans Hub coordinator · long-form writer",
    },
    tags: ["Activism", "Writing", "Trans Hub"],
    meta: (
      <>
        <span className={styles.vouched}>Vouched for you</span>
        <span>
          <b>11</b> mutuals
        </span>
        <span>
          Connected <b>Mar 2025</b>
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={MESSAGES} variant="ghost">
          Message
        </Button>
        <Button to={PROFILE} variant="primary">
          View profile
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "JF",
      tint: "jade",
      name: "Jonas Ferreira",
      pron: "he/him",
      role: "Reporter, QueerPulse Magazine",
    },
    tags: ["Editorial", "Reportage"],
    meta: (
      <>
        <span>
          <b>8</b> mutuals
        </span>
        <span>
          Connected <b>Dec 2024</b>
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={MESSAGES} variant="ghost">
          Message
        </Button>
        <Button to={PROFILE} variant="primary">
          View profile
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "LG",
      tint: "plum",
      name: "Luísa Gomes",
      pron: "she/her",
      role: "Design director · ex-Atelier Pulso",
    },
    tags: ["Design", "Mentoring"],
    meta: (
      <>
        <span className={styles.vouched}>You vouched</span>
        <span>
          <b>14</b> mutuals
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={linkToPath("QueerPulse Offer.html")} variant="ghost">
          Book review
        </Button>
        <Button to={MESSAGES} variant="primary">
          Message
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "AK",
      name: "Anika Kovač",
      pron: "she/her",
      role: "Healthcare designer · Trans & NB Network",
    },
    tags: ["Design", "Health", "Hosting"],
    meta: (
      <>
        <span>
          <b>6</b> mutuals
        </span>
        <span>
          Connected <b>Jan 2026</b>
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={linkToPath("QueerPulse Host.html")} variant="ghost">
          Co-host
        </Button>
        <Button to={MESSAGES} variant="primary">
          Message
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "RV",
      tint: "jade",
      name: "Rita Vasquez",
      pron: "they/them",
      role: "Therapist · Café Beirão regular",
    },
    tags: ["Wellbeing", "Therapy"],
    meta: (
      <>
        <span className={styles.vouched}>Mutual vouch</span>
        <span>
          <b>9</b> mutuals
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={MESSAGES} variant="ghost">
          Message
        </Button>
        <Button to={PROFILE} variant="primary">
          View profile
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "NA",
      tint: "plum",
      name: "Nuno Alves",
      pron: "he/him",
      role: "Trans Hub coordinator",
    },
    tags: ["Activism", "Trans Hub"],
    meta: (
      <>
        <span>
          <b>11</b> mutuals
        </span>
        <span>
          Connected <b>Feb 2025</b>
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={MESSAGES} variant="ghost">
          Message
        </Button>
        <Button to={PROFILE} variant="primary">
          View profile
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "SC",
      name: "Sofia Castaño",
      pron: "she/her",
      role: "Service designer · reading group host",
    },
    tags: ["Design", "Reading"],
    meta: (
      <>
        <span>
          <b>4</b> mutuals
        </span>
        <span>
          Connected <b>Apr 2026</b>
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={MESSAGES} variant="ghost">
          Message
        </Button>
        <Button to={PROFILE} variant="primary">
          View profile
        </Button>
      </>
    ),
  },
  {
    person: {
      initials: "SP",
      tint: "jade",
      name: "Sara Pinheiro",
      pron: "she/her",
      role: "Contributing editor · Magazine",
    },
    tags: ["Editorial", "Health"],
    meta: (
      <>
        <span>
          <b>13</b> mutuals
        </span>
        <span>
          Connected <b>Sep 2025</b>
        </span>
      </>
    ),
    actions: (
      <>
        <Button to={MESSAGES} variant="ghost">
          Message
        </Button>
        <Button to={linkToPath("QueerPulse Author.html")} variant="primary">
          View profile
        </Button>
      </>
    ),
  },
];

interface IncomingCard {
  person: Person;
  meta: ReactNode;
  message?: string;
}

const INCOMING: IncomingCard[] = [
  {
    person: {
      initials: "EM",
      name: "Emília Marques",
      pron: "she/her",
      role: "Photographer · met at Riso open-house",
    },
    meta: (
      <>
        <span>
          <b>3</b> mutuals · including Anika
        </span>
        <span>
          Sent <b>2h ago</b>
        </span>
      </>
    ),
    message:
      '"Hi Tomás! We met briefly at the riso night, I\'m working on a series and would love to chat sometime."',
  },
  {
    person: {
      initials: "DR",
      tint: "jade",
      name: "Daniel Reis",
      pron: "he/him",
      role: "Junior designer · seen your portfolio piece",
    },
    meta: (
      <>
        <span>
          <b>1</b> mutual · Luísa
        </span>
        <span>
          Sent <b>yesterday</b>
        </span>
      </>
    ),
  },
  {
    person: {
      initials: "MM",
      tint: "plum",
      name: "Mira Martín",
      pron: "they/them",
      role: "New member · vouched-for by Catarina",
    },
    meta: (
      <>
        <span>
          <b>2</b> mutuals
        </span>
        <span>
          Sent <b>3 days ago</b>
        </span>
      </>
    ),
  },
  {
    person: {
      initials: "PV",
      name: "Pedro Vinhas",
      pron: "he/him",
      role: "No mutuals · we don't see why",
    },
    meta: <span className={styles.metaMuted}>No mutuals — review carefully</span>,
  },
];

interface OutgoingCard {
  person: Person;
  meta: ReactNode;
}

const OUTGOING: OutgoingCard[] = [
  {
    person: {
      initials: "MR",
      name: "Marta Reis",
      pron: "she/her",
      role: "Editor · QueerPulse Magazine",
    },
    meta: (
      <>
        Awaiting reply · sent <b>2 days ago</b>
      </>
    ),
  },
  {
    person: {
      initials: "FL",
      tint: "jade",
      name: "Filipa Lopes",
      pron: "she/her",
      role: "Riso open-house · met last weekend",
    },
    meta: (
      <>
        Awaiting reply · sent <b>5 days ago</b>
      </>
    ),
  },
];

interface VouchedCard {
  person: Person;
  note: string;
}

const VOUCHED: VouchedCard[] = [
  {
    person: {
      initials: "CV",
      name: "Catarina Vaz",
      pron: "she/her",
      role: "Mutual vouch · 2024",
    },
    note: "Vouched both ways",
  },
  {
    person: {
      initials: "RV",
      tint: "jade",
      name: "Rita Vasquez",
      pron: "they/them",
      role: "Mutual vouch · 2025",
    },
    note: "Vouched both ways",
  },
  {
    person: {
      initials: "LG",
      tint: "plum",
      name: "Luísa Gomes",
      pron: "she/her",
      role: "You vouched · 2025",
    },
    note: "You vouched",
  },
];
