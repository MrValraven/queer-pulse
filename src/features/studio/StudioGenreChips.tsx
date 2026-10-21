import { useId } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import type { StudioFormat, StudioGenre, StudioMood } from "./api/studio.types";
import { useStudioGenres } from "./api/useStudioGenres";
import { useStudioMoods } from "./api/useStudioMoods";
import { StudioFacetTiles } from "./StudioFacetTiles";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import { useStudioTasteOrder } from "./studioFirstRunTaste";
import { studioBrowsePath } from "./studioPaths";
import { useStudioChipScroller } from "./useStudioChipScroller";
import css from "./StudioBrowse.module.css";

interface StudioFilterChip {
  key: string;
  label: string;
  href: string;
  isCurrent: boolean;
}

/** Which vocabulary a chip row lists. */
export type StudioFilterFacet =
  | { kind: "genre"; values: StudioGenre[] }
  | { kind: "mood"; values: StudioMood[] };

/** A labelled chip row on one line that scrolls sideways, fading only at a
 *  side that hides more chips. Shared by the format, genre and mood rows.
 *  A `caption` shows the row's name in a label column (on top on a phone)
 *  and names the landmark in its place. */
export function StudioChipRow({
  label,
  chips,
  className,
  caption,
}: {
  label: string;
  chips: StudioFilterChip[];
  className?: string;
  caption?: string;
}) {
  const captionId = useId();
  const currentKey = chips.find((chip) => chip.isCurrent)?.key ?? "";
  const { listRef, edgeProps } = useStudioChipScroller(
    `${chips.map((chip) => chip.key).join("|")}#${currentKey}`,
  );
  const navClassName =
    [className, caption ? css.chipRowLabelled : undefined]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <nav
      aria-label={caption ? undefined : label}
      aria-labelledby={caption ? captionId : undefined}
      className={navClassName}
    >
      {caption ? (
        <span id={captionId} className={css.chipRowCaption}>
          {caption}
        </span>
      ) : null}
      <ul ref={listRef} className={css.chips} {...edgeProps}>
        {chips.map((chip) => (
          <li key={chip.key}>
            <Link
              to={chip.href}
              className={css.chip}
              aria-current={chip.isCurrent ? "page" : undefined}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Genres or moods as links into /studio/browse, the current one marked.
 *  On the browse page every chip keeps the other filter, and the "Any"
 *  chip clears this one alone. */
export function StudioFilterChips({
  facet,
  activeGenre = null,
  activeMood = null,
  activeFormat = null,
  label,
  caption,
  hasAnyChip = false,
}: {
  facet: StudioFilterFacet;
  activeGenre?: StudioGenre | null;
  activeMood?: StudioMood | null;
  /** Artist kinds: kept in every chip's link on the browse page. */
  activeFormat?: StudioFormat | null;
  label: string;
  /** The visible row name ("Genre", "Mood"). */
  caption?: string;
  hasAnyChip?: boolean;
}) {
  const { t } = useTranslation();
  const isGenreRow = facet.kind === "genre";
  const chips: StudioFilterChip[] =
    facet.kind === "genre"
      ? facet.values.map((genre) => ({
          key: genre,
          label: t(STUDIO_GENRE_LABEL_KEY[genre]),
          href: studioBrowsePath(genre, activeMood, activeFormat),
          isCurrent: genre === activeGenre,
        }))
      : facet.values.map((mood) => ({
          key: mood,
          label: t(STUDIO_MOOD_LABEL_KEY[mood]),
          href: studioBrowsePath(activeGenre, mood, activeFormat),
          isCurrent: mood === activeMood,
        }));
  const anyChip: StudioFilterChip = {
    key: "any",
    label: t(isGenreRow ? "studio:browse.anyGenre" : "studio:browse.anyMood"),
    href: isGenreRow
      ? studioBrowsePath(null, activeMood, activeFormat)
      : studioBrowsePath(activeGenre, null, activeFormat),
    isCurrent: isGenreRow ? activeGenre === null : activeMood === null,
  };
  return (
    <StudioChipRow
      label={label}
      caption={caption}
      chips={hasAnyChip ? [anyChip, ...chips] : chips}
    />
  );
}

/** "Browse by genre", then "Browse by mood", at the foot of Studio home:
 *  each a compact two-row shelf of colour tiles carrying a drawn motif and
 *  the newest cover, every tile keeping the active format. Each holds
 *  skeleton tiles from the first paint while its list loads, and folds away
 *  only when the list comes back empty or the read fails. */
export function StudioHomeGenres({
  activeFormat = null,
  omitGenres = [],
  hasSeeAll = true,
}: {
  activeFormat?: StudioFormat | null;
  /** False on Browse, where See all leads back to the same page. */
  hasSeeAll?: boolean;
  /** Genres another row on the page already offers (Browse drops the
   *  Spoken word genre under a Spoken word format chip). */
  omitGenres?: readonly StudioGenre[];
}) {
  const { t } = useTranslation();
  const {
    genres,
    coverByGenre,
    loadState: genresLoadState,
  } = useStudioGenres();
  const { moods, coverByMood, loadState: moodsLoadState } = useStudioMoods();
  // PRD-12: the welcome's picks lead, on this device only.
  const tastedGenres = useStudioTasteOrder(genres, "genre").filter(
    (genre) => !omitGenres.includes(genre),
  );
  const tastedMoods = useStudioTasteOrder(moods, "mood");
  return (
    <>
      <Collapse isOpen={genresLoadState.isLoading || genres.length > 0}>
        <StudioFacetTiles
          id="studio-home-genres"
          title={
            <Translation
              i18nKey="studio:home.genres.heading"
              components={{ em: <em /> }}
            />
          }
          facet={{
            kind: "genre",
            values: tastedGenres,
            coverByValue: coverByGenre,
          }}
          label={t("studio:home.genres.listLabel")}
          activeFormat={activeFormat}
          isLoading={genresLoadState.isLoading}
          hasSeeAll={hasSeeAll}
        />
      </Collapse>
      <Collapse isOpen={moodsLoadState.isLoading || moods.length > 0}>
        <StudioFacetTiles
          id="studio-home-moods"
          title={
            <Translation
              i18nKey="studio:home.moods.heading"
              components={{ em: <em /> }}
            />
          }
          facet={{
            kind: "mood",
            values: tastedMoods,
            coverByValue: coverByMood,
          }}
          label={t("studio:home.moods.listLabel")}
          activeFormat={activeFormat}
          isLoading={moodsLoadState.isLoading}
          hasSeeAll={hasSeeAll}
        />
      </Collapse>
    </>
  );
}
