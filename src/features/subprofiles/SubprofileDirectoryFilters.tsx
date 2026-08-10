import { SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DIRECTORY_FAMILIES } from "./subprofileDirectory.data";
import type { SkinFamily } from "./subprofile-skins";
import styles from "./SubprofileDirectoryPage.module.css";

interface FiltersProps {
  /** The active skin-family filter, or undefined for "All". Personas
   *  redesign Phase 4: replaces the old raw-kind filter — every kind maps to
   *  exactly one family via `SKIN_OF`. */
  activeFamily: SkinFamily | undefined;
  onFamily: (family: SkinFamily | undefined) => void;
  query: string;
  onQuery: (query: string) => void;
  /** Union of `card.tags` across the currently family-filtered result set
   *  (deduped, capped, most-common first) — computed by the page, purely
   *  client-side. */
  availableTags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  openToCollabs: boolean;
  onToggleOpenToCollabs: () => void;
  /** "Six kinds of page across {n} crafts" — computed by the page from the
   *  currently family-filtered set, already translated. */
  filtersNote: string;
}

/** Skin-family chips ("All" + one per `KIND_FAMILIES` entry), a free-text
 *  search, an "open to collabs" toggle, a computed note line, and a tag-chip
 *  group. Family + query + collabs + tags all filter the already-fetched
 *  cards client-side (Personas redesign Phase 4, Decision §2) — nothing here
 *  re-queries the network. Chips are toggle controls, so they're bare buttons
 *  with `aria-pressed` and visible focus — not pill actions. */
export function SubprofileDirectoryFilters({
  activeFamily,
  onFamily,
  query,
  onQuery,
  availableTags,
  activeTags,
  onToggleTag,
  openToCollabs,
  onToggleOpenToCollabs,
  filtersNote,
}: FiltersProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.filters}>
      <div
        className={styles.chips}
        role="group"
        aria-label={t("subprofiles:directory.filterLabel")}
      >
        <button
          type="button"
          className={[styles.chip, activeFamily === undefined && styles.chipOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={activeFamily === undefined}
          onClick={() => onFamily(undefined)}
        >
          {t("subprofiles:directory.filterAll")}
        </button>
        {DIRECTORY_FAMILIES.map(({ family, labelKey }) => (
          <button
            key={family}
            type="button"
            className={[styles.chip, activeFamily === family && styles.chipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={activeFamily === family}
            onClick={() => onFamily(family)}
          >
            {t(labelKey)}
          </button>
        ))}
        <button
          type="button"
          className={[styles.chip, openToCollabs && styles.chipOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={openToCollabs}
          onClick={onToggleOpenToCollabs}
        >
          {t("subprofiles:directory.openToCollabsChip")}
        </button>
      </div>
      <p className={styles.filtersNote}>{filtersNote}</p>
      <SearchInput
        value={query}
        onChange={onQuery}
        placeholder={t("subprofiles:directory.searchPlaceholder")}
        ariaLabel={t("subprofiles:directory.searchAria")}
        className={styles.search}
      />
      {availableTags.length > 0 && (
        <SubprofileTagFilterRow
          availableTags={availableTags}
          activeTags={activeTags}
          onToggleTag={onToggleTag}
        />
      )}
    </div>
  );
}

interface TagFilterRowProps {
  availableTags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
}

/** The tag-chip row: a small heading plus one toggle chip per tag present in
 *  the currently family-filtered result set, styled distinctly (lighter
 *  weight, muted colour) from the family chips above so the two facets read
 *  as separate filters. Extracted so the parent stays well under the
 *  200-line component limit. */
function SubprofileTagFilterRow({
  availableTags,
  activeTags,
  onToggleTag,
}: TagFilterRowProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.tagFilter}>
      <span className={styles.tagFilterHeading}>
        {t("subprofiles:directory.tagFilterHeading")}
      </span>
      <div
        className={styles.chips}
        role="group"
        aria-label={t("subprofiles:directory.tagFilterLabel")}
      >
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={[
              styles.chip,
              styles.chipTag,
              activeTags.includes(tag) && styles.chipOn,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={activeTags.includes(tag)}
            onClick={() => onToggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
