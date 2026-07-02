import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { ArtGridSkeleton, MusicGridSkeleton } from "./CreativesSkeleton";
import { ART_WORKS, FEATURED, INVITE, MUSIC_ARTISTS } from "./creatives.data";
import { ArtCard, MusicCard } from "./CreativesCards";
import { CreativesHero } from "./CreativesHero";
import { CreativesTopbar } from "./CreativesTopbar";
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
      <CreativesHero
        featuredIdx={featuredIdx}
        setFeaturedIdx={setFeaturedIdx}
      />

      <CreativesTopbar
        mode={mode}
        filters={filters}
        count={count}
        onSwitchMode={switchMode}
        onToggleFilter={toggleFilter}
      />

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
