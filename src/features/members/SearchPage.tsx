import { useState } from "react";
import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { linkToPath } from "../../app/routeMap";
import styles from "./SearchPage.module.css";

type ResultType = "member" | "gathering" | "community" | "board";

interface SearchItem {
  t: ResultType;
  name: string;
  sub: string;
  href: string;
  kw: string;
}

const DATA: SearchItem[] = [
  { t: "member", name: "Inês Tavares", sub: "Graphic Designer · Príncipe Real", href: "QueerPulse Profile.html", kw: "design branding type editorial" },
  { t: "member", name: "Rui Marçal", sub: "Software Engineer · Marvila", href: "QueerPulse Profile.html", kw: "tech backend rust engineering" },
  { t: "member", name: "Sofia Andrade", sub: "Documentary Filmmaker · Alfama", href: "QueerPulse Profile.html", kw: "film directing editing documentary" },
  { t: "member", name: "Tomás Beto", sub: "Chef · Supper Club Host · Mouraria", href: "QueerPulse Profile.html", kw: "food supper club fermentation chef" },
  { t: "member", name: "Mariana Loução", sub: "Clinical Psychologist · Estrela", href: "QueerPulse Profile.html", kw: "care therapy lgbtq psychologist" },
  { t: "member", name: "André Quintela", sub: "Portrait Photographer · Cais do Sodré", href: "QueerPulse Profile.html", kw: "photography analog portrait darkroom" },
  { t: "member", name: "Carla Nogueira", sub: "Product Manager · Arroios", href: "QueerPulse Profile.html", kw: "tech product fintech strategy" },
  { t: "member", name: "Beatriz Pinto", sub: "Ceramicist · Graça", href: "QueerPulse Profile.html", kw: "craft ceramics studio glazing" },
  { t: "member", name: "Diogo Vasques", sub: "Music Producer · Bairro Alto", href: "QueerPulse Profile.html", kw: "music electronic dj producing" },
  { t: "gathering", name: "Queer Supper Club №12", sub: "Mouraria · 6 Jun — 8 seats left", href: "QueerPulse Gathering.html", kw: "food social supper dinner" },
  { t: "gathering", name: "Portfolio Night: Designers & Photographers", sub: "Príncipe Real · 14 Jun — 32 going", href: "QueerPulse Gathering.html", kw: "design photography portfolio mixer" },
  { t: "gathering", name: "Inside Beatriz's Ceramics Studio", sub: "Graça · 21 Jun — 3 spots left", href: "QueerPulse Gathering.html", kw: "craft ceramics studio visit" },
  { t: "gathering", name: "Founders & Builders Breakfast", sub: "Marvila · 2 Jul", href: "QueerPulse Gathering.html", kw: "founders tech breakfast networking" },
  { t: "community", name: "Queer Social Lisbon", sub: "Social · 340 members · Monthly", href: "QueerPulse Communities.html", kw: "social casual meetup monthly" },
  { t: "community", name: "Rainbow Arts Collective", sub: "Arts · 128 members · Monthly", href: "QueerPulse Communities.html", kw: "arts visual collective studio" },
  { t: "community", name: "Trans Mutual Aid Network", sub: "Support · 89 members · Ongoing", href: "QueerPulse Communities.html", kw: "trans support mutual aid peer" },
  { t: "community", name: "Queer Runners Lisboa", sub: "Sports · 214 members · Weekly", href: "QueerPulse Communities.html", kw: "running sports outdoors weekly" },
  { t: "community", name: "Queer Hikers Lisboa", sub: "Sports · 156 members · Weekly", href: "QueerPulse Communities.html", kw: "hiking outdoors sintra nature" },
  { t: "community", name: "Queer Founders Lisboa", sub: "Professional · 72 members · Monthly", href: "QueerPulse Communities.html", kw: "founders professional startup" },
  { t: "community", name: "Queer Tech Lisbon", sub: "Professional · 134 members · Monthly", href: "QueerPulse Communities.html", kw: "tech professional career talks" },
  { t: "board", name: "Free portrait sessions for trans & nonbinary members", sub: "Offering · André Quintela · 2 days ago", href: "QueerPulse Offer.html", kw: "portrait free trans nonbinary" },
  { t: "board", name: "A collaborator for a queer zine launching in September", sub: "Looking for · Inês Tavares · 3 days ago", href: "QueerPulse Offer.html", kw: "zine collab writing illustration design" },
  { t: "board", name: "Monthly mentoring for junior engineers", sub: "Offering · Rui Marçal · 4 days ago", href: "QueerPulse Offer.html", kw: "mentoring tech engineering backend" },
  { t: "board", name: "A sublet in Arroios, June through August", sub: "Looking for · Carla Nogueira · 1 week ago", href: "QueerPulse Offer.html", kw: "housing sublet arroios rent" },
  { t: "board", name: "Two desks to share in a bright Graça studio", sub: "Offering · Beatriz Pinto · 1 week ago", href: "QueerPulse Offer.html", kw: "desk studio workspace graça" },
  { t: "board", name: "A composer for a short documentary, paid", sub: "Looking for · Sofia Andrade · 2 weeks ago", href: "QueerPulse Offer.html", kw: "music composer documentary film paid" },
];

const TYPE_BG: Record<ResultType, string> = {
  member: "rgba(45,27,61,.08)",
  gathering: "rgba(74,140,111,.1)",
  community: "rgba(232,119,90,.1)",
  board: "rgba(122,82,184,.1)",
};
const TYPE_ICON: Record<ResultType, string> = {
  member: "👤",
  gathering: "📅",
  community: "🤝",
  board: "📋",
};
const TYPE_LABEL: Record<ResultType, string> = {
  member: "Members",
  gathering: "Gatherings",
  community: "Communities",
  board: "Board",
};
const RECENTS = [
  "portrait sessions",
  "supper club",
  "ceramics studio",
  "mentoring engineers",
  "sublet arroios",
  "documentary composer",
];
const TABS: { id: ResultType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "member", label: "Members" },
  { id: "gathering", label: "Gatherings" },
  { id: "community", label: "Communities" },
  { id: "board", label: "Board" },
];

function ResultCard({ item }: { item: SearchItem }) {
  return (
    <Link to={linkToPath(item.href)} className={styles.card}>
      <div className={styles.cardIcon} style={{ background: TYPE_BG[item.t] }}>
        {TYPE_ICON[item.t]}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardType}>{TYPE_LABEL[item.t]}</div>
        <div className={styles.cardName}>{item.name}</div>
        <div className={styles.cardSub}>{item.sub}</div>
      </div>
    </Link>
  );
}

function Group({ items, label }: { items: SearchItem[]; label: string }) {
  if (!items.length) return null;
  return (
    <div className={styles.section}>
      <div className={styles.secHead}>{label}</div>
      <div className={styles.grid}>
        {items.map((item) => (
          <ResultCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ResultType | "all">("all");

  const q = query.trim().toLowerCase();

  let content: React.ReactNode;
  if (!q) {
    content = (
      <>
        <div className={styles.recent}>
          <div className={styles.recentLabel}>Recent searches</div>
          <div className={styles.recentChips}>
            {RECENTS.map((r) => (
              <button
                key={r}
                type="button"
                className={styles.chip}
                onClick={() => setQuery(r)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-6.93" />
                </svg>
                {r}
              </button>
            ))}
          </div>
        </div>
        <Group items={DATA.filter((d) => d.t === "member").slice(0, 6)} label="Members" />
        <Group items={DATA.filter((d) => d.t === "gathering")} label="Upcoming gatherings" />
      </>
    );
  } else {
    const hits = DATA.filter((d) => {
      const matches = `${d.name} ${d.sub} ${d.kw}`.toLowerCase().includes(q);
      return matches && (tab === "all" || d.t === tab);
    });
    const countEl = (
      <div className={styles.count}>
        <b>{hits.length}</b> result{hits.length === 1 ? "" : "s"} for "
        <b>{query.trim()}</b>"
      </div>
    );
    if (!hits.length) {
      content = (
        <>
          {countEl}
          <div className={styles.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--plum)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>Nothing found</h3>
            <p>
              Try a different word — member name, neighbourhood, skill, or type of
              gathering.
            </p>
          </div>
        </>
      );
    } else if (tab === "all") {
      const types: ResultType[] = ["member", "gathering", "community", "board"];
      content = (
        <>
          {countEl}
          {types.map((typ) => (
            <Group
              key={typ}
              items={hits.filter((h) => h.t === typ)}
              label={TYPE_LABEL[typ]}
            />
          ))}
        </>
      );
    } else {
      content = (
        <>
          {countEl}
          <Group items={hits} label={TYPE_LABEL[tab]} />
        </>
      );
    }
  }

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.label}>Search</div>
          <h1 className={styles.title}>
            Find anyone, anything <em>in the community.</em>
          </h1>
          <div className={styles.barWrap}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.barInput}
              type="text"
              placeholder="Members, gatherings, communities, board posts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className={styles.shortcut}>⌘K</span>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
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
          {content}
        </div>
      </div>
    </PageShell>
  );
}
