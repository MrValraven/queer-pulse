import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { ArtGridSkeleton, MusicGridSkeleton } from "./CreativesSkeleton";
import {
  ART_FILTERS,
  ART_WORKS,
  FEATURED,
  INVITE,
  MUSIC_ARTISTS,
  MUSIC_FILTERS,
} from "./creatives.data";
import { ArtCard, MusicCard } from "./CreativesCards";
import { badgeClass } from "./creativesBadge";
import styles from "./CreativesPage.module.css";

export function CreativesPage() {
  const loading = useSimulatedLoad();
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [mode, setMode] = useState<"art" | "music">("art");
  const [filters, setFilters] = useState<string[]>([]);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setInterval(
      () => setFeaturedIdx((i) => (i + 1) % FEATURED.length),
      5000,
    );
    return () => window.clearInterval(t);
  }, []);

  const f = FEATURED[featuredIdx]!;
  const availableFilters = mode === "art" ? ART_FILTERS : MUSIC_FILTERS;

  const toggleFilter = (name: string) => {
    if (name === "All") {
      setFilters([]);
      return;
    }
    setFilters((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  };

  const matches = (item: object) => {
    if (filters.length === 0) return true;
    const hay = JSON.stringify(item).toLowerCase();
    return filters.some((flt) => hay.includes(flt.toLowerCase()));
  };

  const artItems = ART_WORKS.filter(matches);
  const musicItems = MUSIC_ARTISTS.filter(matches);
  const count = mode === "art" ? artItems.length : musicItems.length;

  const switchMode = (m: "art" | "music") => {
    setMode(m);
    setFilters([]);
  };

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroContent} wrap`}>
          <div className={styles.eyebrow}>Featured this week</div>
          <h1 className={styles.heroName}>
            {f.nameMain}
            <em>{f.nameEm}</em>
          </h1>
          <div className={styles.heroDiscipline}>{f.discipline}</div>
          <p className={styles.heroQuote}>“{f.quote}”</p>
          <div className={styles.heroBadges}>
            {f.badges.map((b) => (
              <span key={b} className={`${styles.badge} ${badgeClass(b)}`}>
                {b}
              </span>
            ))}
          </div>
          <div className={styles.heroNav}>
            {FEATURED.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Featured ${i + 1}`}
                className={[
                  styles.heroDot,
                  i === featuredIdx && styles.heroDotActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFeaturedIdx(i)}
              />
            ))}
          </div>
        </div>
      </header>

      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.modeToggle}>
            <button
              type="button"
              className={[
                styles.modeBtn,
                mode === "art" && styles.modeBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => switchMode("art")}
            >
              Visual Art
            </button>
            <button
              type="button"
              className={[
                styles.modeBtn,
                mode === "music" && styles.modeBtnActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => switchMode("music")}
            >
              Music
            </button>
          </div>
          <div className={styles.filters}>
            {availableFilters.map((flt) => {
              const isActive =
                flt === "All" ? filters.length === 0 : filters.includes(flt);
              return (
                <button
                  key={flt}
                  type="button"
                  className={[styles.chip, isActive && styles.chipActive]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleFilter(flt)}
                >
                  {flt}
                </button>
              );
            })}
          </div>
          <div className={styles.count}>
            <b>{count}</b>{" "}
            {mode === "art"
              ? `work${count !== 1 ? "s" : ""}`
              : `artist${count !== 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      <main className={styles.body}>
        <div className="wrap">
          {mode === "art" ? (
            loading ? (
              <div className={styles.artGrid}>
                <ArtGridSkeleton />
              </div>
            ) : artItems.length === 0 ? (
              <EmptyState
                compact
                icon={<FiSearch />}
                title="Nothing matches your filters"
                description="No works fit these tags right now. Clear them to see everything the community has shared."
                action={{
                  label: "Clear filters",
                  onClick: () => setFilters([]),
                }}
              />
            ) : (
              <div className={styles.artGrid}>
                {artItems.map((w, i) => (
                  <FadeIn
                    key={w.title}
                    delay={Math.min(i, 8) * 60}
                    style={{ breakInside: "avoid" }}
                  >
                    <ArtCard w={w} />
                  </FadeIn>
                ))}
              </div>
            )
          ) : loading ? (
            <div className={styles.musicGrid}>
              <MusicGridSkeleton />
            </div>
          ) : musicItems.length === 0 ? (
            <EmptyState
              compact
              icon={<FiSearch />}
              title="Nothing matches your filters"
              description="No artists fit these tags right now. Clear them to hear everyone in the room."
              action={{ label: "Clear filters", onClick: () => setFilters([]) }}
            />
          ) : (
            <div className={styles.musicGrid}>
              {musicItems.map((a, i) => (
                <FadeIn key={a.id} delay={Math.min(i, 8) * 60}>
                  <MusicCard
                    a={a}
                    active={activePlayer === a.id}
                    onPlay={() => setActivePlayer(a.id)}
                  />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </main>

      <Outro
        title={
          <>
            Your work <em>belongs here.</em>
          </>
        }
        sub="QueerPulse is a space for queer creatives to be found, supported, and commissioned — by each other and the wider community."
      >
        <Button to={INVITE} variant="primary" size="lg">
          Add your creative profile
        </Button>
      </Outro>
    </PageShell>
  );
}
