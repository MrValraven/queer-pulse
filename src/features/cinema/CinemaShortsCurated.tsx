import { routes } from "../../app/routeMap";
import { getShort, shortFilms, type ShortsShelf } from "./cinemaShorts.data";
import { SecDiv, ShortGrid } from "./CinemaShortsParts";

const madeHere = `${routes.cinemaBrowse}?f=made-here`;

/** The four algorithmic shelves that sit between the intro and the makers. */
export function CuratedShelves({ shelf }: { shelf: ShortsShelf }) {
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
      <SecDiv
        title={
          <>
            New <em>this week</em>
          </>
        }
        sub="Films submitted and approved in the last 7 days"
        actionTo={madeHere}
        actionLabel="All new →"
      />
      <ShortGrid films={newThisWeek} shelf={shelf} />

      <SecDiv
        title={
          <>
            Because you tipped <em>The pharmacy at 3am</em>
          </>
        }
        sub="More from Rui, and films in the same key"
        actionTo={`${routes.cinemaFilmmaker}/rui-almeida`}
        actionLabel="Rui's page →"
      />
      <ShortGrid films={because} shelf={shelf} />
    </>
  );
}

/** Debut + most-tipped shelves, shown after the makers row. */
export function CuratedTail({ shelf }: { shelf: ShortsShelf }) {
  const debuts = shortFilms.filter((f) => f.debut).slice(0, 4);
  const mostTipped = [...shortFilms]
    .sort((a, b) => b.tipsMonth - a.tipsMonth)
    .slice(0, 4);

  return (
    <>
      <SecDiv
        title={
          <>
            Someone's <em>first film</em>
          </>
        }
        sub="Debuts deserve a first audience — be theirs"
        actionTo={madeHere}
        actionLabel="All debuts →"
      />
      <ShortGrid films={debuts} shelf={shelf} />

      <SecDiv
        title={
          <>
            Most <em>tipped</em>
          </>
        }
        sub="Films where members have been generous this month"
        actionTo={madeHere}
        actionLabel="All films →"
      />
      <ShortGrid films={mostTipped} shelf={shelf} />
    </>
  );
}
