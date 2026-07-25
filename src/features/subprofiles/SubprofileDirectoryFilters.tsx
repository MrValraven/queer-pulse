import { SearchInput } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { DIRECTORY_KINDS } from "./subprofileDirectory.data";
import type { SubprofileKind } from "./api/subprofiles.api";
import styles from "./SubprofileDirectoryPage.module.css";

interface FiltersProps {
  /** The active kind filter, or undefined for "All". */
  activeKind: SubprofileKind | undefined;
  onKind: (kind: SubprofileKind | undefined) => void;
  query: string;
  onQuery: (query: string) => void;
  /** Union of tags across the currently loaded result set (deduped, capped,
   *  most-common first) — computed by the page, purely client-side. */
  availableTags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  openToCollabs: boolean;
  onToggleOpenToCollabs: () => void;
}

/** Kind-filter chips ("All" + every kind), a free-text search, an "open to
 *  collabs" toggle, and a tag-chip group. Kind + query re-query the
 *  directory; the collabs toggle and tags filter the already-fetched cards
 *  client-side. Chips are toggle controls, so they're bare buttons with
 *  `aria-pressed` and visible focus — not pill actions. */
export function SubprofileDirectoryFilters({
  activeKind,
  onKind,
  query,
  onQuery,
  availableTags,
  activeTags,
  onToggleTag,
  openToCollabs,
  onToggleOpenToCollabs,
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
          className={[styles.chip, activeKind === undefined && styles.chipOn]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={activeKind === undefined}
          onClick={() => onKind(undefined)}
        >
          {t("subprofiles:directory.filterAll")}
        </button>
        {DIRECTORY_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            className={[styles.chip, activeKind === kind && styles.chipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={activeKind === kind}
            onClick={() => onKind(kind)}
          >
            {t(KIND_LABEL_KEYS[kind])}
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
 *  the currently loaded result set. Extracted so the parent stays well under
 *  the 200-line component limit. */
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
              styles.tagChip,
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
