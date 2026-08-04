import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved } from "../../app/providers/useSaved";
import { CinemaComingSoon } from "./CinemaComingSoon";
import { Button, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import { CinemaShortsHeader } from "./CinemaShortsHeader";
import { AccessNote, CuratorNote, Spotlight } from "./CinemaShortsIntro";
import {
  ContinueWatching,
  MeetTheMakers,
  Programmes,
} from "./CinemaShortsShelves";
import { CuratedShelves, CuratedTail } from "./CinemaShortsCurated";
import { CinemaShortsCatalog } from "./CinemaShortsCatalog";
import {
  CommunityVote,
  SubmitCta,
  Transparency,
  WatchParties,
} from "./CinemaShortsCommunity";
import {
  getShort,
  seededSeen,
  shortFilms,
  type ShortsShelf,
} from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Made Here — the community catalogue of member-made queer short films. */
export function CinemaShortsPage() {
  const { demoMode } = useDemoMode();
  if (!demoMode) return <CinemaComingSoon />;
  return <DemoCinemaShortsPage />;
}

function DemoCinemaShortsPage() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { isSaved, toggleSave } = useSaved();

  // The shelf still speaks in bare film ids, but its saved-state is now backed
  // by the real, backend-wired SavedProvider (kind "film") instead of throwaway
  // local state. Scope the derived list to shorts ids so other saved films
  // don't leak into the catalogue's "Saved" filter.
  const savedFilmIds = useMemo(
    () => shortFilms.filter((film) => isSaved(`film:${film.id}`)).map((film) => film.id),
    [isSaved],
  );

  const shelf = useMemo<ShortsShelf>(
    () => ({
      saved: savedFilmIds,
      seen: seededSeen,
      onToggleSave: (id) => {
        const film = getShort(id);
        if (!film) return;
        const nowSaved = toggleSave({
          id: `film:${id}`,
          kind: "film",
          title: `${film.titlePre}${film.titleEm}${film.titlePost ?? ""}`,
          href: routes.film,
          meta: film.makerShort,
        });
        showToast(
          t(
            nowSaved
              ? "cinema:shorts.toast.savedToWatchlist"
              : "cinema:film.watchlist.removedToast",
          ),
          "success",
        );
      },
      onShare: (label) =>
        showToast(
          t("cinema:shorts.toast.linkCopiedShare", { label }),
          "success",
        ),
      notify: (message) => showToast(message, "success"),
    }),
    [savedFilmIds, toggleSave, showToast, t],
  );

  return (
    <CinemaShell>
      <CinemaShortsHeader />

      <section className={styles.body}>
        <div className="wrap">
          <CuratorNote />
          <AccessNote />
          <Spotlight shelf={shelf} />

          <ContinueWatching />
          <Programmes shelf={shelf} />
          <CuratedShelves shelf={shelf} />
          <MeetTheMakers />
          <CuratedTail shelf={shelf} />

          <WatchParties notify={shelf.notify} />
          <CommunityVote notify={shelf.notify} />

          <CinemaShortsCatalog shelf={shelf} />

          <Transparency />
          <SubmitCta />
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="cinema:shorts.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("cinema:shorts.outro.sub")}
      >
        <Button size="lg" to={`${routes.cinemaBrowse}?f=made-here`}>
          {t("cinema:shorts.outro.browseCta")}
        </Button>
      </Outro>
    </CinemaShell>
  );
}
