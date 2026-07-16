import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FadeIn, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { ArtGridSkeleton, MusicGridSkeleton } from "./CreativesSkeleton";
import { ART_WORKS, FEATURED, INVITE, MUSIC_ARTISTS } from "./creatives.data";
import { ArtCard, MusicCard } from "./CreativesCards";
import { CreativesHero } from "./CreativesHero";
import { CreativesTopbar } from "./CreativesTopbar";
import styles from "./CreativesPage.module.css";

export function CreativesPage() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [mode, setMode] = useState<"art" | "music">("art");
  const [filters, setFilters] = useState<string[]>([]);
  const [activePlayer, setActivePlayer] = useState<string | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setFeaturedIdx((i) => (i + 1) % FEATURED.length),
      5000,
    );
    return () => window.clearInterval(intervalId);
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
                title={t("community:creatives.empty.art.title")}
                description={t("community:creatives.empty.art.description")}
                action={{
                  label: t("community:creatives.empty.clearFiltersCta"),
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
              title={t("community:creatives.empty.music.title")}
              description={t("community:creatives.empty.music.description")}
              action={{
                label: t("community:creatives.empty.clearFiltersCta"),
                onClick: () => setFilters([]),
              }}
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
          <Translation
            i18nKey="community:creatives.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("community:creatives.outro.sub")}
      >
        <Button to={INVITE} variant="primary" size="lg">
          {t("community:creatives.outro.cta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
