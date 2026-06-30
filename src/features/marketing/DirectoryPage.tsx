import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import {
  Button,
  FadeIn,
  FilterChips,
  Outro,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { DIRECTORY_PLACES as BIZS, type Tint } from "./directoryPlaces";
import { routes } from "../../app/routeMap";
import s from "./DirectoryPage.module.css";

const CATS = [
  { c: "all", label: "All" },
  { c: "food", label: "Food & drink" },
  { c: "design", label: "Design & craft" },
  { c: "health", label: "Health & care" },
  { c: "space", label: "Spaces" },
  { c: "culture", label: "Culture" },
  { c: "tech", label: "Tech" },
  { c: "grooming", label: "Barbershop & Salon" },
  { c: "fitness", label: "Gym & Fitness" },
];
const CAT_LABEL: Record<string, string> = Object.fromEntries(
  CATS.map((c) => [c.c, c.label]),
);

const tintBg: Record<Tint, string> = {
  coral: "rgba(232,119,90,.15)",
  jade: "rgba(74,140,111,.15)",
  plum: "rgba(45,27,61,.1)",
};
const tintFg: Record<Tint, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade)",
  plum: "var(--plum)",
};

function DirectoryCardSkeleton() {
  // Mirrors the real .card: top row (44px avatar + badge), name, cat, hood, desc, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.top}>
        <SkeletonLine width={44} height={44} style={{ borderRadius: 12 }} />
        <SkeletonLine width={84} height={18} style={{ borderRadius: 6 }} />
      </div>
      <div>
        <SkeletonLine width="65%" height={19} />
        <SkeletonLine width="40%" height={12} style={{ marginTop: 6 }} />
        <SkeletonLine width="50%" height={12.5} style={{ marginTop: 6 }} />
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.foot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
      </div>
    </div>
  );
}

export function DirectoryPage() {
  const loading = useSimulatedLoad();
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIZS.filter((b) => {
      if (cat !== "all" && b.cat !== cat) return false;
      if (
        q &&
        !(
          b.name.toLowerCase().includes(q) ||
          b.hood.toLowerCase().includes(q) ||
          b.desc.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });
  }, [cat, query]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Queer business directory"
        title={
          <>
            Find your <em>people's places.</em>
          </>
        }
        sub="Queer-owned businesses and queer-friendly professionals in Lisbon. Vetted by the community, maintained by the community. Whether you just arrived or you've been here for years."
      >
        <div className={s.heroNote}>
          <span className={s.live} /> Community-verified · updated monthly
        </div>
      </PageHero>

      <div className={s.bar}>
        <div className="wrap">
          <div className={s.search}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <circle cx={11} cy={11} r={7} />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, neighbourhood, or type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <FilterChips
            options={CATS.map((c) => ({ value: c.c, label: c.label }))}
            value={cat}
            onChange={setCat}
          />
        </div>
      </div>

      <section className={s.content}>
        <div className="wrap">
          <Reveal className={s.count}>
            {loading ? (
              <>Loading places…</>
            ) : (
              <>
                Showing <b>{visible.length}</b> of {BIZS.length} places
              </>
            )}
          </Reveal>
          <div className={s.grid}>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <DirectoryCardSkeleton key={i} />
              ))}
            {!loading && visible.length === 0 && (
              <div className={s.empty}>
                No places match — try a broader filter.
              </div>
            )}
            {!loading &&
              visible.map((b, i) => (
                <FadeIn
                  key={b.name}
                  as={Link}
                  delay={Math.min(i, 8) * 60}
                  to={`${routes.directory}/${b.slug}`}
                  className={s.card}
                >
                  <div className={s.top}>
                    <span
                      className={s.av}
                      style={{
                        background: tintBg[b.tint],
                        color: tintFg[b.tint],
                      }}
                    >
                      {b.av}
                    </span>
                    <span
                      className={`${s.badge} ${b.owned ? s.owned : s.friendly}`}
                    >
                      {b.owned ? "Queer-owned" : "LGBTQ+ friendly"}
                    </span>
                  </div>
                  <div>
                    <div className={s.name}>{b.name}</div>
                    <div className={s.cat}>{CAT_LABEL[b.cat]}</div>
                    <div className={s.hood}>
                      <FiMapPin /> {b.hood}
                    </div>
                  </div>
                  <div className={s.desc}>{b.desc}</div>
                  <div className={s.foot}>
                    {b.member ? (
                      <span className={s.memberLink}>Member-run</span>
                    ) : (
                      <span />
                    )}
                    <span className={s.visit}>View details →</span>
                  </div>
                </FadeIn>
              ))}
          </div>

          <Reveal className={s.submitStrip}>
            <div>
              <h3>
                Know a place worth <em>adding?</em>
              </h3>
              <p>
                If you run or know a queer-owned or queer-friendly business in
                Lisbon that belongs in this directory, tell us. We review every
                suggestion before it goes live.
              </p>
            </div>
            <Button
              size="lg"
              href="mailto:hello@queerpulse.pt?subject=Directory suggestion"
            >
              Suggest a place
            </Button>
          </Reveal>
        </div>
      </section>

      <Outro
        title={
          <>
            New to Lisbon? <em>You're not starting from zero.</em>
          </>
        }
        sub="Join the network and get access to the full directory, member recommendations, and a community that knows the city."
      >
        <Button size="lg" to={routes.requestInvite}>
          Request an invite
        </Button>
      </Outro>
    </PageShell>
  );
}
