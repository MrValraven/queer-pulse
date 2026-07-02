import { useCallback, useMemo, useState } from "react";
import { ChipSelect, SearchInput } from "../../shared/components/ui";
import {
  ALL_PROFESSIONS,
  DISCIPLINES,
  FIELD_BY_PROFESSION,
  PROFESSIONS_BY_FIELD,
  professionsForFields,
  type FilterState,
} from "./memberDirectoryFilter.data";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Toggle a value within a string[] immutably. */
function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/** The "What they do" (field) + "Profession" filter cards. Owns the free-text
 *  search that widens the profession pool to every matching profession. */
export function FilterProfessions({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const disciplineOptions = useMemo(
    () =>
      q
        ? DISCIPLINES.filter(
            (d) =>
              d.label.toLowerCase().includes(q) ||
              (PROFESSIONS_BY_FIELD[d.label] ?? []).some((p) =>
                p.toLowerCase().includes(q),
              ),
          )
        : DISCIPLINES,
    [q],
  );
  const professionPool = useMemo(
    () =>
      q
        ? ALL_PROFESSIONS.filter((p) => p.toLowerCase().includes(q))
        : professionsForFields(filters.disciplines),
    [q, filters.disciplines],
  );

  // Toggling a profession on also selects its parent field, so the choice
  // survives `reconcileProfessions` and the field chip lights up to match.
  const toggleProfession = useCallback(
    (value: string) => {
      const has = filters.professions.includes(value);
      const professions = has
        ? filters.professions.filter((p) => p !== value)
        : [...filters.professions, value];
      const field = FIELD_BY_PROFESSION[value];
      const disciplines =
        !has && field && !filters.disciplines.includes(field)
          ? [...filters.disciplines, field]
          : filters.disciplines;
      onChange({ ...filters, professions, disciplines });
    },
    [filters, onChange],
  );

  return (
    <>
      <div className={styles.filterCard}>
        <h4>What they do</h4>
        <SearchInput
          className={styles.searchField}
          placeholder="Search a field or profession…"
          value={query}
          onChange={setQuery}
          ariaLabel="Search fields and professions"
        />
        {disciplineOptions.length > 0 ? (
          <ChipSelect
            options={disciplineOptions.map((o) => o.label)}
            selected={new Set(filters.disciplines)}
            onToggle={(value) =>
              onChange({
                ...filters,
                disciplines: toggle(filters.disciplines, value),
              })
            }
          />
        ) : (
          <p className={styles.rangeNote}>
            <em>No field matches "{query}".</em>
          </p>
        )}
      </div>

      <div className={styles.filterCard}>
        <h4>Profession</h4>
        {professionPool.length > 0 ? (
          <ChipSelect
            options={professionPool}
            selected={new Set(filters.professions)}
            onToggle={toggleProfession}
          />
        ) : (
          <p className={styles.rangeNote}>
            <em>No profession matches "{query}".</em>
          </p>
        )}
        <p className={styles.rangeNote}>
          {q ? (
            <em>Matching your search across every field.</em>
          ) : filters.disciplines.length ? (
            <em>
              Showing professions within your selected field
              {filters.disciplines.length > 1 ? "s" : ""}.
            </em>
          ) : (
            <em>Pick a field above, or search to find any profession.</em>
          )}
        </p>
      </div>
    </>
  );
}
