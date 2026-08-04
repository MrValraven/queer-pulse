import { SectionHead } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { getShort, shortFilms, type ShortsShelf } from "./cinemaShorts.data";
import { ShortGrid } from "./CinemaShortsParts";
import styles from "./CinemaShortsPage.module.css";

const madeHere = `${routes.cinemaBrowse}?f=made-here`;

/** The four algorithmic shelves that sit between the intro and the makers. */
export function CuratedShelves({ shelf }: { shelf: ShortsShelf }) {
  const { t } = useTranslation();
  const newThisWeek = shortFilms.filter((f) => f.newWk).slice(0, 4);

  const tipped = getShort("pharmacy-3am");
  const because = shortFilms
    .filter(
      (f) =>
        tipped &&
        f.id !== tipped.id &&
        (f.makerShort === tipped.makerShort ||
          f.moods.some((m) => tipped.moods.includes(m))),
    )
    .sort((a, b) => b.watches - a.watches)
    .slice(0, 4);

  return (
    <>
      <SectionHead
        className={styles.shortsSectionHead}
        title={
          <Translation
            i18nKey="cinema:shorts.shelf.newThisWeek.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:shorts.shelf.newThisWeek.sub")}
        linkTo={madeHere}
        linkLabel={t("cinema:shorts.shelf.newThisWeek.cta")}
      />
      <ShortGrid films={newThisWeek} shelf={shelf} />

      <SectionHead
        className={styles.shortsSectionHead}
        title={
          <Translation
            i18nKey="cinema:shorts.shelf.becauseYouTipped.title"
            values={{ filmTitle: "The pharmacy at 3am" }}
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:shorts.shelf.becauseYouTipped.sub", { maker: "Rui" })}
        linkTo={`${routes.cinemaFilmmaker}/rui-almeida`}
        linkLabel={t("cinema:shorts.shelf.becauseYouTipped.cta", {
          maker: "Rui",
        })}
      />
      <ShortGrid films={because} shelf={shelf} />
    </>
  );
}

/** Debut + most-tipped shelves, shown after the makers row. */
export function CuratedTail({ shelf }: { shelf: ShortsShelf }) {
  const { t } = useTranslation();
  const debuts = shortFilms.filter((f) => f.debut).slice(0, 4);
  const mostTipped = [...shortFilms]
    .sort((a, b) => b.tipsMonth - a.tipsMonth)
    .slice(0, 4);

  return (
    <>
      <SectionHead
        className={styles.shortsSectionHead}
        title={
          <Translation
            i18nKey="cinema:shorts.shelf.firstFilm.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:shorts.shelf.firstFilm.sub")}
        linkTo={madeHere}
        linkLabel={t("cinema:shorts.shelf.firstFilm.cta")}
      />
      <ShortGrid films={debuts} shelf={shelf} />

      <SectionHead
        className={styles.shortsSectionHead}
        title={
          <Translation
            i18nKey="cinema:shorts.shelf.mostTipped.title"
            components={{ em: <em /> }}
          />
        }
        subtitle={t("cinema:shorts.shelf.mostTipped.sub")}
        linkTo={madeHere}
        linkLabel={t("cinema:shorts.shelf.mostTipped.cta")}
      />
      <ShortGrid films={mostTipped} shelf={shelf} />
    </>
  );
}
