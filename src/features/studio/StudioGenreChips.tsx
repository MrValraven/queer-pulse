import { useId } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import type { StudioGenre } from "./api/studio.types";
import { useStudioGenres } from "./api/useStudioGenres";
import { studioBrowsePath } from "./studioPaths";
import styles from "./studio.module.css";
import css from "./StudioBrowse.module.css";

/** The genres as links to /studio/browse?genre=, the current one marked. */
export function StudioGenreChips({
  genres,
  activeGenre = null,
  label,
}: {
  genres: StudioGenre[];
  activeGenre?: StudioGenre | null;
  label: string;
}) {
  const { t } = useTranslation();
  return (
    <nav aria-label={label}>
      <ul className={css.chips}>
        {genres.map((genre) => (
          <li key={genre}>
            <Link
              to={studioBrowsePath(genre)}
              className={css.chip}
              aria-current={genre === activeGenre ? "page" : undefined}
            >
              {t(STUDIO_GENRE_LABEL_KEY[genre])}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** "Browse by genre" under the home hero. It grows in once genres arrive and
 *  stays out of the way while they load or when the read fails. */
export function StudioHomeGenres() {
  const { t } = useTranslation();
  const headingId = useId();
  const { genres } = useStudioGenres();
  return (
    <Collapse isOpen={genres.length > 0}>
      <section className={styles.row} aria-labelledby={headingId}>
        <div className={styles.rowH}>
          <h2 id={headingId}>
            <Translation
              i18nKey="studio:home.genres.heading"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <StudioGenreChips
          genres={genres}
          label={t("studio:home.genres.listLabel")}
        />
      </section>
    </Collapse>
  );
}
