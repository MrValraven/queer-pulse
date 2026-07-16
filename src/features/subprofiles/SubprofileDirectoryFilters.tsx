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
}

/** Kind-filter chips ("All" + every kind) plus a free-text search. Chips are
 *  toggle controls, so they're bare buttons with `aria-pressed` and visible
 *  focus — not pill actions. */
export function SubprofileDirectoryFilters({
  activeKind,
  onKind,
  query,
  onQuery,
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
      </div>
      <SearchInput
        value={query}
        onChange={onQuery}
        placeholder={t("subprofiles:directory.searchPlaceholder")}
        ariaLabel={t("subprofiles:directory.searchAria")}
        className={styles.search}
      />
    </div>
  );
}
