import { useId, type ReactNode } from "react";
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
import { studioBrowsePath } from "./studioPaths";
import styles from "./studio.module.css";
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

/** Genres or moods as links into /studio/browse, the current one marked.
 *  On the browse page every chip keeps the other filter, and the "Any"
 *  chip clears this one alone. */
export function StudioFilterChips({
  facet,
  activeGenre = null,
  activeMood = null,
  activeFormat = null,
  label,
  hasAnyChip = false,
}: {
  facet: StudioFilterFacet;
  activeGenre?: StudioGenre | null;
  activeMood?: StudioMood | null;
  /** Artist kinds: kept in every chip's link on the browse page. */
  activeFormat?: StudioFormat | null;
  label: string;
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
    <nav aria-label={label}>
      <ul className={css.chips}>
        {(hasAnyChip ? [anyChip, ...chips] : chips).map((chip) => (
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

/** One home browse row: a heading over its tiles. It holds skeleton tiles
 *  from the first paint while its list loads, and folds away only when the
 *  list comes back empty or the read fails. */
function StudioHomeChipSection({
  isOpen,
  headingKey,
  children,
}: {
  isOpen: boolean;
  headingKey: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <Collapse isOpen={isOpen}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation i18nKey={headingKey} components={{ em: <em /> }} />
          </h2>
        </div>
        {children}
      </section>
    </Collapse>
  );
}

/** "Browse by genre", then "Browse by mood", under the home hero: each a
 *  grid of colour tiles carrying a drawn motif and the newest cover. */
export function StudioHomeGenres() {
  const { t } = useTranslation();
  const {
    genres,
    coverByGenre,
    loadState: genresLoadState,
  } = useStudioGenres();
  const { moods, coverByMood, loadState: moodsLoadState } = useStudioMoods();
  return (
    <>
      <StudioHomeChipSection
        isOpen={genresLoadState.isLoading || genres.length > 0}
        headingKey="studio:home.genres.heading"
      >
        <StudioFacetTiles
          facet={{ kind: "genre", values: genres, coverByValue: coverByGenre }}
          label={t("studio:home.genres.listLabel")}
          isLoading={genresLoadState.isLoading}
        />
      </StudioHomeChipSection>
      <StudioHomeChipSection
        isOpen={moodsLoadState.isLoading || moods.length > 0}
        headingKey="studio:home.moods.heading"
      >
        <StudioFacetTiles
          facet={{ kind: "mood", values: moods, coverByValue: coverByMood }}
          label={t("studio:home.moods.listLabel")}
          isLoading={moodsLoadState.isLoading}
        />
      </StudioHomeChipSection>
    </>
  );
}
