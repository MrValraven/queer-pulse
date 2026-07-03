import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { linkToPath } from "../../app/routeMap";
import {
  SEARCH_DATA,
  TYPE_BG,
  TYPE_ICON,
  TYPE_LABEL,
  RECENTS,
  TABS,
  type ResultType,
  type SearchItem,
} from "./search.data";
import styles from "./SearchPage.module.css";

/** Loading placeholder mirroring ResultCard — same icon + two lines. */
function ResultSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine
        width={42}
        height={42}
        style={{ borderRadius: 11, flex: "none" }}
      />
      <div className={styles.cardBody}>
        <SkeletonLine width="30%" height={11} />
        <SkeletonLine width="70%" height={15} style={{ marginTop: 6 }} />
        <SkeletonLine width="55%" height={13} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

function SkeletonGroup() {
  return (
    <div className={styles.section}>
      <SkeletonLine width={120} height={12} style={{ marginBottom: 16 }} />
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ item }: { item: SearchItem }) {
  const TypeIcon = TYPE_ICON[item.t];
  return (
    <Link to={linkToPath(item.href)} className={styles.card}>
      <div className={styles.cardIcon} style={{ background: TYPE_BG[item.t] }}>
        <TypeIcon />
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
        {items.map((item, i) => (
          <FadeIn key={item.name} delay={Math.min(i, 8) * 60}>
            <ResultCard item={item} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

export function SearchPage() {
  // The query lives in the URL (?q=…) so it's shareable, bookmarkable, and can be
  // pre-filled by the global ⌘K command palette.
  const loading = useSimulatedLoad();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const setQuery = (value: string) =>
    setSearchParams(value ? { q: value } : {}, { replace: true });
  const [tab, setTab] = useState<ResultType | "all">("all");
  const q = query.trim().toLowerCase();

  let content: React.ReactNode;
  if (loading) {
    content = (
      <>
        <SkeletonGroup />
        <SkeletonGroup />
      </>
    );
  } else if (!q) {
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
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-6.93" />
                </svg>
                {r}
              </button>
            ))}
          </div>
        </div>
        <Group
          items={SEARCH_DATA.filter((d) => d.t === "topic")}
          label="Browse topics"
        />
        <Group
          items={SEARCH_DATA.filter((d) => d.t === "member").slice(0, 6)}
          label="Members"
        />
        <Group
          items={SEARCH_DATA.filter((d) => d.t === "gathering")}
          label="Upcoming gatherings"
        />
      </>
    );
  } else {
    const hits = SEARCH_DATA.filter((d) => {
      const matches = `${d.name} ${d.sub} ${d.kw}`.toLowerCase().includes(q);
      return matches && (tab === "all" || d.t === tab);
    });
    // When the query is a bare "#tag" matching a known topic, offer a direct
    // jump to its feed page above the ordinary results.
    const topicJump = q.startsWith("#")
      ? SEARCH_DATA.find((d) => d.t === "topic" && d.name.toLowerCase() === q)
      : undefined;
    const banner = topicJump ? (
      <Link to={linkToPath(topicJump.href)} className={styles.jump}>
        <span className={styles.jumpText}>
          Jump to <b>{topicJump.name}</b>
        </span>
        <span className={styles.jumpArrow} aria-hidden>
          →
        </span>
      </Link>
    ) : null;
    const countEl = (
      <div className={styles.count}>
        <b>{hits.length}</b> result{hits.length === 1 ? "" : "s"} for "
        <b>{query.trim()}</b>"
      </div>
    );
    if (!hits.length) {
      content = (
        <>
          {banner}
          {countEl}
          <div className={styles.empty}>
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--plum)"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <h3>Nothing found</h3>
            <p>
              Try a different word — member name, neighbourhood, skill, or type
              of gathering.
            </p>
          </div>
        </>
      );
    } else if (tab === "all") {
      const types: ResultType[] = [
        "topic",
        "member",
        "gathering",
        "community",
        "board",
      ];
      content = (
        <>
          {banner}
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
          {banner}
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
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
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
